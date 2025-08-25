// Language definitions based on the user's requirements
export const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
] as const;

export type LanguageCode = typeof AVAILABLE_LANGUAGES[number]['code'];

// Translations for common UI text
export const translations = {
  en: {
    welcome: 'Welcome to our hotel',
    name: 'Name',
    roomNumber: 'Room Number',
    language: 'Language',
    startChat: 'Start Chat',
    aiDisclaimer: 'This is an AI assistant and may make mistakes. Each message is handled separately for simplicity.',
    greetNameRoom: 'Hello {name} from room {roomNumber}.',
    initialGreeting: 'Welcome to {hotelName}. I\'m here to help you with any requests, questions, or services you need during your stay. Each message is being handled separately for simplicity for now.',
    typeMessage: 'Type your message...',
    send: 'Send',
  },
  es: {
    welcome: 'Bienvenido a nuestro hotel',
    name: 'Nombre',
    roomNumber: 'Número de habitación',
    language: 'Idioma',
    startChat: 'Iniciar chat',
    aiDisclaimer: 'Este es un asistente de IA y puede cometer errores. Cada mensaje se maneja por separado para simplificar.',
    greetNameRoom: 'Hola {name} de la habitación {roomNumber}.',
    initialGreeting: 'Bienvenido a {hotelName}. Estoy aquí para ayudarte con cualquier solicitud, pregunta o servicio que necesites durante tu estancia. Cada mensaje se maneja por separado por simplicidad por ahora.',
    typeMessage: 'Escribe tu mensaje...',
    send: 'Enviar',
  },
  fr: {
    welcome: 'Bienvenue dans notre hôtel',
    name: 'Nom',
    roomNumber: 'Numéro de chambre',
    language: 'Langue',
    startChat: 'Commencer le chat',
    aiDisclaimer: 'Ceci est un assistant IA et peut faire des erreurs. Chaque message est traité séparément pour simplifier.',
    greetNameRoom: 'Bonjour {name} de la chambre {roomNumber}.',
    initialGreeting: 'Bienvenue à {hotelName}. Je suis là pour vous aider avec toute demande, question ou service dont vous avez besoin pendant votre séjour. Chaque message est traité séparément pour l\'instant pour simplifier.',
    typeMessage: 'Tapez votre message...',
    send: 'Envoyer',
  },
  de: {
    welcome: 'Willkommen in unserem Hotel',
    name: 'Name',
    roomNumber: 'Zimmernummer',
    language: 'Sprache',
    startChat: 'Chat starten',
    aiDisclaimer: 'Dies ist ein KI-Assistent und kann Fehler machen. Jede Nachricht wird zur Vereinfachung separat behandelt.',
    greetNameRoom: 'Hallo {name} aus Zimmer {roomNumber}.',
    initialGreeting: 'Willkommen im {hotelName}. Ich bin hier, um Ihnen bei allen Anfragen, Fragen oder Dienstleistungen zu helfen, die Sie während Ihres Aufenthalts benötigen. Jede Nachricht wird zur Vereinfachung vorerst separat behandelt.',
    typeMessage: 'Geben Sie Ihre Nachricht ein...',
    send: 'Senden',
  },
  it: {
    welcome: 'Benvenuto nel nostro hotel',
    name: 'Nome',
    roomNumber: 'Numero camera',
    language: 'Lingua',
    startChat: 'Inizia chat',
    aiDisclaimer: 'Questo è un assistente IA e può commettere errori. Ogni messaggio è gestito separatamente per semplicità.',
    greetNameRoom: 'Ciao {name} della stanza {roomNumber}.',
    initialGreeting: 'Benvenuto al {hotelName}. Sono qui per aiutarti con qualsiasi richiesta, domanda o servizio di cui hai bisogno durante il tuo soggiorno. Ogni messaggio viene gestito separatamente per ora per semplicità.',
    typeMessage: 'Digita il tuo messaggio...',
    send: 'Invia',
  },
  pt: {
    welcome: 'Bem-vindo ao nosso hotel',
    name: 'Nome',
    roomNumber: 'Número do quarto',
    language: 'Idioma',
    startChat: 'Iniciar chat',
    aiDisclaimer: 'Este é um assistente de IA e pode cometer erros. Cada mensagem é tratada separadamente para simplicidade.',
    greetNameRoom: 'Olá {name} do quarto {roomNumber}.',
    initialGreeting: 'Bem-vindo ao {hotelName}. Estou aqui para ajudá-lo com qualquer solicitação, pergunta ou serviço que você precise durante sua estadia. Cada mensagem é tratada separadamente por ora para simplicidade.',
    typeMessage: 'Digite sua mensagem...',
    send: 'Enviar',
  },
  ru: {
    welcome: 'Добро пожаловать в наш отель',
    name: 'Имя',
    roomNumber: 'Номер комнаты',
    language: 'Язык',
    startChat: 'Начать чат',
    aiDisclaimer: 'Это ИИ-помощник, который может совершать ошибки. Каждое сообщение обрабатывается отдельно для упрощения.',
    greetNameRoom: 'Здравствуйте, {name} из номера {roomNumber}.',
    initialGreeting: 'Добро пожаловать в {hotelName}. Я здесь, чтобы помочь вам с любыми запросами, вопросами или услугами, которые вам нужны во время вашего пребывания. Каждое сообщение пока обрабатывается отдельно для упрощения.',
    typeMessage: 'Введите ваше сообщение...',
    send: 'Отправить',
  },
  he: {
    welcome: 'ברוכים הבאים למלון שלנו',
    name: 'שם',
    roomNumber: 'מספר חדר',
    language: 'שפה',
    startChat: 'התחל צ\'אט',
    aiDisclaimer: 'זהו עוזר בינה מלאכותית והוא עלול לעשות טעויות. כל הודעה מטופלת בנפרד לפשטות.',
    greetNameRoom: 'שלום {name} מחדר {roomNumber}.',
    initialGreeting: 'ברוכים הבאים ל{hotelName}. אני כאן כדי לעזור לכם עם כל בקשה, שאלה או שירות שאתם צריכים במהלך השהייה שלכם. כל הודעה מטופלת בנפרד לעת עתה לפשטות.',
    typeMessage: 'הקלידו את ההודעה שלכם...',
    send: 'שלח',
  },
};

export function getTranslation(languageCode: LanguageCode, key: keyof typeof translations.en): string {
  return translations[languageCode]?.[key] || translations.en[key];
}

export function getLanguageByCode(code: string) {
  return AVAILABLE_LANGUAGES.find(lang => lang.code === code);
}

export function isValidLanguageCode(code: string): code is LanguageCode {
  return AVAILABLE_LANGUAGES.some(lang => lang.code === code);
}
