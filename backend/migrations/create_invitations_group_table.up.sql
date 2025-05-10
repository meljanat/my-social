-- +migrate Up
CREATE TABLE IF NOT EXISTS invitations_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invited_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    UNIQUE (sender_id, recipient_id, group_id)
);