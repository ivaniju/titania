-- Esquema inicial de Expediente.

create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique check (email = lower(email)),
  password_hash text not null,
  salt text not null,
  oposicion text not null,
  email_verified_at timestamptz,
  -- Desnormalizados para que los rankings no recorran todo el histórico:
  points integer not null default 0,   -- suma de puntos de todos sus exámenes
  last_active_day date,                -- último día (Madrid) con actividad
  created_at timestamptz not null
);
create index users_points_idx on users (points desc) where points > 0;
create index users_oposicion_points_idx on users (oposicion, points desc) where points > 0;

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  token_hash text not null unique,
  created_at timestamptz not null,
  expires_at timestamptz not null
);
create index sessions_user_idx on sessions (user_id);

create table email_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  purpose text not null check (purpose in ('verify', 'reset')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz
);
create index email_tokens_user_idx on email_tokens (user_id, purpose);

-- Banco de preguntas ya validado por el cargador. Las preguntas que desaparecen
-- de los ficheros se desactivan, no se borran: los tests antiguos las referencian.
create table questions (
  id text primary key,
  data jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null
);

create table tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  mode text not null check (mode in ('estudio', 'examen', 'errores-estudio', 'errores-examen')),
  day date not null,                   -- día de inicio en Europe/Madrid
  started_at timestamptz not null,
  finished_at timestamptz,
  total integer not null,
  correct integer,
  points integer
);
-- Límite diario de exámenes iniciados.
create index tests_user_mode_day_idx on tests (user_id, mode, day);

create table test_questions (
  test_id uuid not null references tests (id) on delete cascade,
  question_id text not null references questions (id),
  position integer not null,
  option_order smallint[] not null check (cardinality(option_order) = 4),
  selected_original smallint check (selected_original between 0 and 3),
  answered_at timestamptz,
  primary key (test_id, question_id),
  unique (test_id, position)
);

create table exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  test_id uuid not null unique references tests (id) on delete cascade,
  oposicion text not null,
  day date not null,
  points integer not null check (points between 0 and 100),
  correct integer not null,
  total integer not null
);
-- Rankings por periodo (semanal, mensual, 30 días): rango de días agregando por usuario.
create index exams_day_user_idx on exams (day, user_id) include (points);
-- Ranking por oposición y periodo.
create index exams_oposicion_day_idx on exams (oposicion, day, user_id) include (points);
create index exams_user_idx on exams (user_id);

create table error_bank (
  user_id uuid not null references users (id) on delete cascade,
  question_id text not null references questions (id),
  primary key (user_id, question_id)
);

create table seen_questions (
  user_id uuid not null references users (id) on delete cascade,
  question_id text not null references questions (id),
  seen_at timestamptz not null,
  primary key (user_id, question_id)
);

-- Días (Madrid) con actividad: base de rachas y del libro de asistencia.
create table activity_days (
  user_id uuid not null references users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

-- Intentos para los límites de frecuencia. La clave lleva prefijo y, cuando
-- deriva de un email, va en hash: aquí no se guardan direcciones.
create table login_attempts (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null
);
create index login_attempts_key_idx on login_attempts (key, created_at);
