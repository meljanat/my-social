-- +migrate Up
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    notified_id INTEGER NOT NULL,
    post_id INTEGER DEFAULT 0,
    group_id INTEGER DEFAULT 0,
    event_id INTEGER DEFAULT 0,
    type_notification TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (notified_id) REFERENCES users (id) ON DELETE CASCADE
);