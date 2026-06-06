-- Run this in Supabase SQL Editor to create all tables

create table if not exists books (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  author text not null,
  description text,
  cover text,
  file_path text not null,
  file_type text not null default 'pdf',
  subject text,
  level text,
  tags text,
  page_count int,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reading_sessions (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  book_id text not null references books(id) on delete cascade,
  progress float not null default 0,
  last_page int not null default 1,
  total_time int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, book_id)
);

create table if not exists bookmarks (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  book_id text not null references books(id) on delete cascade,
  page int not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_bookmarks_user on bookmarks(user_id);

create table if not exists chat_messages (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  book_id text not null references books(id) on delete cascade,
  role text not null,
  content text not null,
  page_ref int,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_user_book on chat_messages(user_id, book_id);

create table if not exists study_sessions (
  id text primary key default gen_random_uuid()::text,
  user_id text not null,
  book_id text not null,
  tool text not null,
  content text not null,
  page_ref int,
  created_at timestamptz not null default now()
);

-- Seed data: sample books
insert into books (id, title, author, subject, level, description, file_path, tags) values
  ('seed-intro-algo', 'Introduction to Algorithms', 'Cormen, Leiserson, Rivest, Stein', 'Computer Science', '300L', 'The classic algorithms textbook covering sorting, data structures, graph algorithms, and more.', 'sample.pdf', 'algorithms,data structures,computer science'),
  ('seed-db-concepts', 'Database System Concepts', 'Silberschatz, Korth, Sudarshan', 'Computer Science', '200L', 'Comprehensive introduction to database systems, SQL, relational algebra, and system design.', 'sample.pdf', 'database,SQL,systems'),
  ('seed-os-concepts', 'Operating System Concepts', 'Silberschatz, Galvin, Gagne', 'Computer Science', '300L', 'Core concepts of operating systems including process management, memory, and file systems.', 'sample.pdf', 'OS,systems,processes'),
  ('seed-networks', 'Computer Networks', 'Andrew S. Tanenbaum', 'Computer Science', '400L', 'Comprehensive guide to computer networking from physical layer to application protocols.', 'sample.pdf', 'networking,protocols,internet'),
  ('seed-ai-modern', 'Artificial Intelligence: A Modern Approach', 'Russell & Norvig', 'Computer Science', '400L', 'The definitive textbook on AI covering search, knowledge representation, ML, and robotics.', 'sample.pdf', 'AI,machine learning,search'),
  ('seed-discrete-math', 'Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', 'Mathematics', '100L', 'Foundational mathematics for computer science: logic, sets, relations, graphs, and combinatorics.', 'sample.pdf', 'discrete math,logic,sets'),
  ('seed-eng-mechanics', 'Engineering Mechanics: Statics', 'R.C. Hibbeler', 'Engineering', '200L', 'Fundamental principles of statics for engineering students, covering forces, equilibrium, and structural analysis.', 'sample.pdf', 'statics,mechanics,forces'),
  ('seed-org-chemistry', 'Organic Chemistry', 'Paula Yurkanis Bruice', 'Chemistry', '200L', 'Introduction to organic chemistry covering structure, reactions, and synthesis of organic compounds.', 'sample.pdf', 'organic,reactions,synthesis'),
  ('seed-physics', 'University Physics with Modern Physics', 'Young & Freedman', 'Physics', '100L', 'Comprehensive physics textbook covering mechanics, thermodynamics, electromagnetism, and modern physics.', 'sample.pdf', 'mechanics,electromagnetism,thermodynamics'),
  ('seed-cell-biology', 'Molecular Biology of the Cell', 'Alberts et al.', 'Biology', '300L', 'Comprehensive coverage of cell biology, molecular mechanisms, genetics, and cellular processes.', 'sample.pdf', 'cell biology,genetics,molecular')
on conflict (id) do nothing;
