-- +migrate Up
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    date_of_birth DATE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT NOT NULL,
    cover TEXT NOT NULL,
    about TEXT,
    privacy TEXT NOT NULL,
    session_token TEXT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);