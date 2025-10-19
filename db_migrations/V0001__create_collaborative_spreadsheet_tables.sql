-- Create tables for collaborative spreadsheet
CREATE TABLE IF NOT EXISTS sheets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Sheet',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cells (
    id SERIAL PRIMARY KEY,
    sheet_id INTEGER NOT NULL,
    row_index INTEGER NOT NULL,
    col_index INTEGER NOT NULL,
    value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sheet_id, row_index, col_index)
);

CREATE TABLE IF NOT EXISTS active_users (
    id SERIAL PRIMARY KEY,
    sheet_id INTEGER NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    user_color VARCHAR(7) NOT NULL,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default sheet
INSERT INTO sheets (name) VALUES ('Моя таблица');

-- Insert some sample data
INSERT INTO cells (sheet_id, row_index, col_index, value) VALUES 
(1, 0, 0, 'Продукт'),
(1, 0, 1, 'Количество'),
(1, 0, 2, 'Цена'),
(1, 0, 3, 'Сумма'),
(1, 1, 0, 'Ноутбук'),
(1, 1, 1, '5'),
(1, 1, 2, '75000'),
(1, 1, 3, '375000'),
(1, 2, 0, 'Мышь'),
(1, 2, 1, '20'),
(1, 2, 2, '1500'),
(1, 2, 3, '30000');