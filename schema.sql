CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_link TEXT NOT NULL,
  package TEXT NOT NULL,
  contact TEXT NOT NULL,
  note TEXT,
  price REAL NOT NULL,
  currency TEXT NOT NULL,
  pay_address TEXT NOT NULL,
  status TEXT NOT NULL,
  public_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
