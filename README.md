AI Portfolio Builder


გაშვების ინსტრუქცია:

  npm install
ან
  npm install react react-dom react-router-dom @supabase/supabase-js framer-motion react-icons html2pdf.js
  npm install -D vite @vitejs/plugin-react


windows-ის შემთხვევაში ჯერ უნდა დაყენოთ node.js:
  https://nodejs.org/en/blog/release/v22.17.0

root-ში შექმენით .env ფაილი:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key

    გამოიყენეთ ჩემი API:
    deleted

ლოკალურად გაშვება:
npm run dev
შემდეგ გახსენით: http://localhost:5173

თუ გინდათ გამიყენეთ თქვენი API:

შექმენით 'supabase.com' ანგარიში და მანდ შექმენით პროექტი და ჩასვით ეს SQL სკრიპტები Supabase SQL რედაქტორში: 
--მომხმარებლების ცხრილი
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  role text default 'user',
  plan text default 'free',
  plan_expires_at timestamp,
  banned boolean default false
);

--პორტფოლიოები
create table if not exists portfolios (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc', now())
);

--CV
create table resumes (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) not null,
    data jsonb not null,
    template text,
    created_at timestamptz default now(),
    theme text
);

--ბლოგები

create table if not exists blogs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content jsonb not null,
  created_at timestamp with time zone default timezone('utc', now()),
  author_id uuid references users(id) on delete cascade,
  like_count int default 0,
  view_count int default 0
);

--ბლოგის მოწონებები და ნახვები

create table if not exists blog_likes (
  id uuid primary key default uuid_generate_v4(),
  blog_id uuid references blogs(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  value int not null,
  unique(blog_id, user_id)
);

create table if not exists blog_views (
  id uuid primary key default uuid_generate_v4(),
  blog_id uuid references blogs(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  viewed_at timestamp with time zone default timezone('utc', now()),
  unique(blog_id, user_id)
);

--ტრიგერები და ფუნქციები

create or replace function increment_blog_view_count(blogid uuid)
returns void as $$
begin
  update blogs set view_count = view_count + 1 where id = blogid;
end;
$$ language plpgsql;

create or replace function update_blog_like_count()
returns trigger as $$
begin
  update blogs
    set like_count = (select coalesce(sum(value), 0) from blog_likes where blog_id = new.blog_id)
    where id = new.blog_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_like_update on blog_likes;
create trigger blog_like_update
after insert or update or delete on blog_likes
for each row
execute procedure update_blog_like_count();


პირველი ადმინისტრატორი? მომხმარებლის ხელით განახლება Supabase-ში:
update users set role = 'admin' where email = 'your_email@example.com';
