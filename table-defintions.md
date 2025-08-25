create table public.hotels (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null default ''::text,
  languages text[] not null default '{en}'::text[],
  plan public.hotel_plan not null default 'basic'::hotel_plan,
  slug text not null,
  default_language text not null default 'en'::text,
  departments text[] null default array[
    'front_desk'::text,
    'housekeeping'::text,
    'maintenance'::text,
    'kitchen'::text,
    'security'::text,
    'spa'::text
  ],
  owner_id uuid not null,
  default_currency text not null default 'USD'::text,
  constraint hotels_pkey primary key (id),
  constraint hotels_name_key unique (name),
  constraint hotels_slug_key unique (slug),
  constraint hotels_owner_id_fkey foreign KEY (owner_id) references auth.users (id),
  constraint hotels_slug_lower_chk check ((slug = lower(slug)))
) TABLESPACE pg_default;

create index IF not exists hotels_owner_idx on public.hotels using btree (owner_id) TABLESPACE pg_default;

create table public.guests (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  hotel_id uuid not null,
  room_number text null,
  last_name text null,
  language text null default 'en'::text,
  last_active_at timestamp with time zone null default now(),
  url_token text null default SUBSTRING(
    (gen_random_uuid ())::text
    from
      1 for 12
  ),
  checkout_date date null,
  constraint guests_pkey primary key (id),
  constraint guests_url_token_key unique (url_token),
  constraint guests_auth_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint guests_hotel_id_fkey foreign KEY (hotel_id) references hotels (id)
) TABLESPACE pg_default;

create index IF not exists guests_hotel_room_idx on public.guests using btree (hotel_id, room_number) TABLESPACE pg_default;

create index IF not exists guests_user_idx on public.guests using btree (user_id) TABLESPACE pg_default;