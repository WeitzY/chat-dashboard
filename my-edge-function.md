URL - https://yledgllxhtbidgozojce.supabase.co/functions/v1/chat-handler
Name - chat-handler

### index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createCorsResponse, createCorsErrorResponse, handleCorsPreflightRequest } from '../_shared/cors.ts';
import { validateChatRequest } from '../_shared/validation.ts';
import { processChatMessage } from './chatProcessor.ts';
serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest();
  }
  try {
    // Validate and parse request
    const validation = await validateChatRequest(req);
    if (!validation.isValid) {
      return createCorsErrorResponse(validation.error, 400);
    }
    // Process the chat message
    const result = await processChatMessage(validation.data);
    return createCorsResponse(result);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Chat processing error:', errorMessage);
    return createCorsErrorResponse('Internal server error. Please try again later.', 500);
  }
});

### chatProcessor.ts
// Main chat processing logic
import { processMessage } from './aiResponse.ts';
import { getHotelDepartments, findOrCreateGuest, saveChatMessage, createStaffNote } from './databaseOps.ts';
export async function processChatMessage(requestData) {
  const { message, hotelId, lastName, roomNumber, language, sessionCode, guestId } = requestData;
  // Get hotel departments for AI classification
  const departments = await getHotelDepartments(hotelId);
  // Process message with AI (generates guest response, staff summary, and department)
  const aiResponse = await processMessage(message, departments, roomNumber, hotelId, language);
  // Find or create guest
  const guest = await findOrCreateGuest(hotelId, lastName, roomNumber, guestId);
  // Save guest message to chat_messages
  await saveChatMessage(guest.id, hotelId, guest.user_id, 'guest', message, {
    language,
    sessionCode,
    roomNumber,
    department: aiResponse.department,
    originalMessage: message
  });
  // Save AI guest response to chat_messages (what the guest sees)
  await saveChatMessage(guest.id, hotelId, guest.user_id, 'ai', aiResponse.guestResponse, {
    department: aiResponse.department,
    originalMessage: message,
    responseType: 'guest',
    canHandle: aiResponse.canHandle
  });
  // Create staff note only if the AI can handle the request
  if (aiResponse.canHandle) {
    await createStaffNote({
      hotelId,
      guestId: guest.id,
      createdByName: lastName,
      department: aiResponse.department,
      noteContent: aiResponse.staffSummary,
      roomNumber,
      status: 'pending',
      priority: 'normal',
      intentType: null
    });
  }
  console.log(`Chat processed successfully for hotel ${hotelId}, room ${roomNumber}, department: ${aiResponse.department}`);
  return {
    success: true,
    guestResponse: aiResponse.guestResponse,
    staffSummary: aiResponse.staffSummary,
    department: aiResponse.department,
    canHandle: aiResponse.canHandle,
    guestId: guest.id,
    message: aiResponse.canHandle ? 'Message processed and staff notified' : 'Message processed - guest referred to front desk'
  };
}

### aiResponse.md
// Enhanced AI processing with vector search capabilities for hotel-specific data
import { createSupabaseServiceClient } from '../_shared/supabaseClient.ts';
import { getEmbedding } from '../_shared/embeddings.ts';
// Vector search for hotel-specific data
async function searchHotelData(message, hotelId) {
  const supabase = createSupabaseServiceClient();
  try {
    // Generate embedding for the user message
    const messageEmbedding = await getEmbedding(message);
    // Search items using vector similarity (minimum threshold: 0.7)
    const { data: items, error: itemsError } = await supabase.rpc('search_items_by_similarity', {
      query_embedding: messageEmbedding,
      hotel_id: hotelId,
      similarity_threshold: 0.7,
      match_limit: 5
    });
    // Search FAQs using vector similarity (minimum threshold: 0.7)  
    const { data: faqs, error: faqsError } = await supabase.rpc('search_faqs_by_similarity', {
      query_embedding: messageEmbedding,
      hotel_id: hotelId,
      similarity_threshold: 0.7,
      match_limit: 3
    });
    if (itemsError) {
      console.error('Items search error:', itemsError);
    }
    if (faqsError) {
      console.error('FAQs search error:', faqsError);
    }
    return {
      items: items || [],
      faqs: faqs || []
    };
  } catch (error) {
    console.error('Vector search error:', error);
    return {
      items: [],
      faqs: []
    };
  }
}
export async function processMessage(message, departments, roomNumber, hotelId, language) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  const isEnglish = !language || language.toLowerCase() === 'en' || language.toLowerCase() === 'english';
  // Perform vector search for hotel-specific data
  const searchResults = await searchHotelData(message, hotelId);
  const hasRelevantData = searchResults.items.length > 0 || searchResults.faqs.length > 0;
  // Enhanced function schema following OpenAI best practices
  const functionSchema = {
    type: "function",
    function: {
      name: "process_hotel_message",
      description: "Process a hotel guest message and generate appropriate responses based on available hotel data",
      parameters: {
        type: "object",
        properties: {
          canHandle: {
            type: "boolean",
            description: "Whether this request can be handled based on available hotel services/items/information. Set to false if the request is outside hotel capabilities."
          },
          guestResponse: {
            type: "string",
            description: `A friendly, professional response to the guest for room ${roomNumber}. If canHandle is false, politely explain that you cannot assist with this specific request and suggest contacting the front desk. Always respond in ${isEnglish ? 'English' : language}.`
          },
          staffSummary: {
            type: "string",
            description: "One clear, actionable sentence in English for hotel staff describing what needs to be done. Include room number and specific details."
          },
          department: {
            type: "string",
            enum: departments,
            description: `The most appropriate department to handle this request. Must be exactly one of: ${departments.join(', ')}`
          }
        },
        required: [
          "canHandle",
          "guestResponse",
          "staffSummary",
          "department"
        ],
        additionalProperties: false
      }
    }
  };
  // Build context with hotel-specific data
  let contextMessage = `Guest in room ${roomNumber}: "${message}"`;
  if (hasRelevantData) {
    contextMessage += "\n\nAvailable hotel services/items for this request:";
    if (searchResults.items.length > 0) {
      contextMessage += "\nItems/Services:";
      searchResults.items.forEach((item)=>{
        contextMessage += `\n- ${item.item}${item.description ? `: ${item.description}` : ''} (${item.category})`;
      });
    }
    if (searchResults.faqs.length > 0) {
      contextMessage += "\nRelevant Information:";
      searchResults.faqs.forEach((faq)=>{
        contextMessage += `\n- ${faq.title}: ${faq.content}`;
      });
    }
  } else {
    contextMessage += "\n\nNote: No specific hotel services/items found related to this request.";
  }
  const systemContent = `You are a professional hotel AI assistant. Your role is to:
1. Analyze guest requests against available hotel services and information
2. Only confirm requests that match available hotel data
3. Politely decline requests outside hotel capabilities
4. Always be helpful, professional, and specific about room ${roomNumber}
${isEnglish ? '' : `5. Respond to guests in ${language}, but provide staff summaries in English`}

Guidelines:
- If hotel data shows relevant services/items, set canHandle to true
- If no relevant hotel data exists, set canHandle to false and suggest contacting front desk
- Be specific about room number in all responses
- Keep responses concise but warm and professional`;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: contextMessage
        }
      ],
      tools: [
        functionSchema
      ],
      tool_choice: {
        type: "function",
        function: {
          name: "process_hotel_message"
        }
      },
      max_tokens: 400,
      temperature: 0.2,
      frequency_penalty: 0.1 // Slight penalty to avoid repetition
    })
  });
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData}`);
  }
  const data = await response.json();
  if (!data.choices?.[0]?.message) {
    throw new Error('Invalid response from OpenAI API');
  }
  const messageResponse = data.choices[0].message;
  // Validate function call
  if (!messageResponse.tool_calls?.[0]) {
    throw new Error('OpenAI did not call the expected function');
  }
  const toolCall = messageResponse.tool_calls[0];
  if (toolCall.type !== 'function' || toolCall.function.name !== 'process_hotel_message') {
    throw new Error('OpenAI called unexpected function');
  }
  let aiResponse;
  try {
    aiResponse = JSON.parse(toolCall.function.arguments);
  } catch (error) {
    throw new Error(`Failed to parse OpenAI function arguments: ${error}`);
  }
  // Validate required fields
  if (typeof aiResponse.canHandle !== 'boolean' || !aiResponse.guestResponse || !aiResponse.staffSummary || !aiResponse.department) {
    throw new Error('AI response missing required fields');
  }
  // Validate department
  if (!departments.includes(aiResponse.department)) {
    console.warn(`Invalid department ${aiResponse.department}, falling back to ${departments[0]}`);
    aiResponse.department = departments[0] || 'front_desk';
  }
  return aiResponse;
}

### databaseOps.ts
import { createSupabaseServiceClient } from '../_shared/supabaseClient.ts';
export async function getHotelDepartments(hotelId) {
  const supabase = createSupabaseServiceClient();
  const { data: hotelData, error: hotelError } = await supabase.from('hotels').select('departments').eq('id', hotelId).single();
  if (hotelError || !hotelData) {
    throw new Error(`Invalid hotel ID: ${hotelId}`);
  }
  return hotelData.departments || [
    'general',
    'housekeeping',
    'maintenance',
    'concierge',
    'room-service'
  ];
}
export async function findOrCreateGuest(hotelId, lastName, roomNumber, userId) {
  const supabase = createSupabaseServiceClient();
  const { data: existingGuest, error: findError } = await supabase.from('guests').select('*').eq('hotel_id', hotelId).eq('room_number', roomNumber).eq('last_name', lastName).single();
  if (existingGuest && !findError) {
    return existingGuest;
  }
  // Create new guest if not found
  // For simplified version, we'll create a user_id if not provided
  const guestUserId = userId || crypto.randomUUID();
  const { data: newGuest, error: createError } = await supabase.from('guests').insert({
    user_id: guestUserId,
    hotel_id: hotelId,
    room_number: roomNumber,
    last_name: lastName,
    language: 'en'
  }).select().single();
  if (createError || !newGuest) {
    throw new Error(`Failed to create guest: ${createError?.message}`);
  }
  return newGuest;
}
export async function saveChatMessage(guestId, hotelId, userId, sender, message, metadata) {
  const supabase = createSupabaseServiceClient();
  const { data: newMessage, error } = await supabase.from('chat_messages').insert({
    user_id: userId,
    hotel_id: hotelId,
    sender,
    message,
    guest_id: guestId,
    metadata: metadata || {}
  }).select().single();
  if (error || !newMessage) {
    throw new Error(`Failed to save chat message: ${error?.message}`);
  }
  return newMessage;
}
export async function createStaffNote(input) {
  const supabase = createSupabaseServiceClient();
  const { hotelId, guestId, department, noteContent, roomNumber } = input;
  const { data, error } = await supabase.from('staff_notes').insert({
    hotel_id: hotelId,
    guest_id: guestId,
    created_by_name: 'Chatbot',
    created_by_staff_id: null,
    department: department,
    note_content: noteContent,
    status: input.status ?? 'pending',
    priority: input.priority ?? 'normal',
    intent_type: input.intentType ?? null,
    is_active: true,
    room_number: roomNumber
  }).select().single();
  if (error) {
    throw new Error(`Failed to create staff note: ${error.message}`);
  }
  return data;
}

### cors.ts
// CORS headers and response utilities for Edge Functions
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
export function createCorsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json'
    }
  });
}
export function createCorsErrorResponse(error, status = 400) {
  return createCorsResponse({
    error
  }, status);
}
export function handleCorsPreflightRequest() {
  return new Response('ok', {
    headers: corsHeaders
  });
}

### validation.ts 
// Request validation using Zod for better type safety and validation
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
// Security: Check for SQL injection patterns
function containsSQLInjection(input) {
  const sqlPatterns = [
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/i,
    /(--|\/\*|\*\/)/,
    /\b(OR|AND)\b.*=/i,
    /[;|&]/,
    /\bxp_cmdshell\b/i,
    /\bsp_executesql\b/i
  ];
  return sqlPatterns.some((pattern)=>pattern.test(input));
}
// Security: Sanitize string input
function sanitizeString(input) {
  const CONTROL_CHARS = /\p{Cc}/gu; // Unicode control characters
  return input.trim().replace(CONTROL_CHARS, '') // Remove control characters
  .replace(/[<>'"&`]/g, '') // Remove potential XSS chars
  .substring(0, 1000); // Limit length for safety
}
// Zod schema for chat request validation
const ChatRequestSchema = z.object({
  message: z.string().min(5, "Message too short. Minimum 5 characters required.").max(2000, "Message too long. Maximum 2000 characters allowed.").refine((val)=>!containsSQLInjection(val), "Invalid characters in message"),
  hotelId: z.string().uuid("Hotel ID must be a valid UUID").transform((val)=>val.toLowerCase()),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long").regex(/^[a-zA-Z\s\-']+$/, "Last name contains invalid characters"),
  roomNumber: z.string().min(1, "Room number is required").max(20, "Room number is too long").regex(/^[a-zA-Z0-9\-_.]+$/, "Room number contains invalid characters"),
  language: z.string().max(10, "Language code is too long").optional(),
  sessionCode: z.string().max(100, "Session code is too long").optional(),
  guestId: z.string().uuid("Guest ID must be a valid UUID").transform((val)=>val.toLowerCase()).optional()
}).transform((data)=>({
    ...data,
    message: sanitizeString(data.message),
    lastName: sanitizeString(data.lastName),
    roomNumber: sanitizeString(data.roomNumber),
    language: data.language ? sanitizeString(data.language) : undefined,
    sessionCode: data.sessionCode ? sanitizeString(data.sessionCode) : undefined
  }));
export async function validateChatRequest(req) {
  // Validate method
  if (req.method !== 'POST') {
    return {
      isValid: false,
      error: 'Method not allowed. Use POST.'
    };
  }
  // Parse JSON with size limit
  let requestData;
  try {
    const body = await req.text();
    // Security: Limit request body size
    if (body.length > 10000) {
      return {
        isValid: false,
        error: 'Request body too large'
      };
    }
    requestData = JSON.parse(body);
  } catch  {
    return {
      isValid: false,
      error: 'Invalid JSON format in request body'
    };
  }
  // Security: Ensure requestData is an object
  if (!requestData || typeof requestData !== 'object' || Array.isArray(requestData)) {
    return {
      isValid: false,
      error: 'Request body must be a JSON object'
    };
  }
  // Validate using Zod schema
  try {
    const validatedData = ChatRequestSchema.parse(requestData);
    return {
      isValid: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return the first validation error for better UX
      const firstError = error.errors[0];
      return {
        isValid: false,
        error: firstError.message
      };
    }
    return {
      isValid: false,
      error: 'Validation failed'
    };
  }
}

### supabaseClient.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Supabase client with SERVICE_ROLE key for Edge Functions
export function createSupabaseServiceClient() {
  const supabaseUrl = Deno.env.get('SB_URL');
  const supabaseKey = Deno.env.get('SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
// Supabase client with ANON key (if needed for specific use cases)
export function createSupabaseAnonClient() {
  const supabaseUrl = Deno.env.get('SB_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

### embeddings.ts
// Embedding generation utilities for Edge Functions - English only for resume version
export async function getEmbedding(text) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    })
  });
  if (!response.ok) {
    throw new Error(`OpenAI embedding error: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Invalid embedding response from OpenAI');
  }
  return data.data[0].embedding;
}
export function estimateTokenCount(text) {
  // More accurate estimation: average 0.75 tokens per word
  const words = text.split(/\s+/).filter((word)=>word.length > 0);
  return Math.ceil(words.length * 0.75);
}
