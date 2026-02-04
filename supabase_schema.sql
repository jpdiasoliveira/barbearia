-- Create tables for the Barbershop App

-- Table: Barbers
create table barbers (
  id text primary key,
  name text not null,
  commission_rate integer default 50
);

-- Table: History (Services performed)
create table history (
  id uuid primary key default gen_random_uuid(),
  barber_id text references barbers(id) on delete set null,
  service_name text not null,
  price numeric not null,
  timestamp timestamptz default now(),
  is_navalhado boolean default false,
  payment_method text
);

-- Table: Appointments
create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text,
  barber_id text references barbers(id) on delete set null,
  service_type text not null,
  duration integer default 30,
  scheduled_time timestamptz not null,
  status text default 'scheduled'
);

-- Table: Barber Services State (To track counts and pricing per barber)
-- We store this as a JSONB object to match the current frontend structure strictly,
-- OR we could normalize it. For a quick migration, JSONB might be easier, 
-- but a normalized structure is better for SQL. 
-- Let's try to normalize it a bit: one row per barber-service-day?
-- Actually, the current app stores `servicesState` as a big object keyed by barberId.
-- Let's stick to a simpler "barber_services_state" table that stores the JSON state per barber if we want to be lazy,
-- BUT the "counters" reset daily.
-- The current state is "just a counter on the screen".
-- Ideally, the "count" should be derived from the history table (count(*) where ...).
-- However, the user might want manual control.
-- Let's use a "daily_stats" table or similar.

-- Actually, looking at the code: `servicesState` holds `currentPrice`, `count` (manual), `isNavalhado` (toggle), `selectedPaymentMethod`.
-- `count` seems to be used just for display ("Cortes: 3").
-- `currentPrice` is important.
-- Let's create a table for Barber Service Configs.

create table barber_service_configs (
  barber_id text references barbers(id) on delete cascade,
  service_id text not null,
  current_price numeric not null,
  is_navalhado boolean default false,
  selected_payment_method text default 'dinheiro',
  primary key (barber_id, service_id)
);

-- We don't really need to store "count" in the DB if we can calculate it from history,
-- BUT the app has a "manual decrement" feature which implies the count might not strictly match history 1-to-1 if history is deleted?
-- Wait, `handleManualDecrement` deletes from history. So count IS derived from associated history items.
-- The `servicesState` in `App.tsx` seems to be the "source of truth" for the UI counters, but it's updated alongside history.
-- IF we migrate to Supabase, we should probably calculate counts from the `history` table to be robust.
-- For now, let's just make the `barber_service_configs` to store preferences (price, etc).

-- RLS Policies (Optional but good practice - enabling public access for now as per "anon" key usage)
alter table barbers enable row level security;
create policy "Public access" on barbers for all using (true);

alter table history enable row level security;
create policy "Public access" on history for all using (true);

alter table appointments enable row level security;
create policy "Public access" on appointments for all using (true);

alter table barber_service_configs enable row level security;
create policy "Public access" on barber_service_configs for all using (true);
