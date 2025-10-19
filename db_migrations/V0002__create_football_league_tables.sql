-- Create tables for football league standings
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logo_emoji VARCHAR(10) DEFAULT '⚽',
    color VARCHAR(7) DEFAULT '#8B5CF6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_stats (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    played INTEGER DEFAULT 0,
    won INTEGER DEFAULT 0,
    drawn INTEGER DEFAULT 0,
    lost INTEGER DEFAULT 0,
    goals_for INTEGER DEFAULT 0,
    goals_against INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    UNIQUE(team_id)
);

CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    match_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_finished BOOLEAN DEFAULT FALSE
);

-- Insert sample teams
INSERT INTO teams (name, logo_emoji, color) VALUES 
('Спартак', '🔴', '#DC2626'),
('Зенит', '🔵', '#2563EB'),
('ЦСКА', '🔴', '#991B1B'),
('Динамо', '⚪', '#3B82F6'),
('Локомотив', '🟢', '#16A34A'),
('Краснодар', '🟢', '#15803D'),
('Ростов', '🟡', '#EAB308'),
('Рубин', '🔴', '#B91C1C'),
('Сочи', '🌊', '#0EA5E9'),
('Урал', '⚫', '#525252'),
('Крылья Советов', '🦅', '#6366F1'),
('Ахмат', '🟢', '#22C55E');

-- Insert initial stats for all teams
INSERT INTO team_stats (team_id, played, won, drawn, lost, goals_for, goals_against, points)
SELECT id, 0, 0, 0, 0, 0, 0, 0 FROM teams;

-- Update with some sample stats
UPDATE team_stats SET played = 10, won = 7, drawn = 2, lost = 1, goals_for = 21, goals_against = 8, points = 23 WHERE team_id = 1;
UPDATE team_stats SET played = 10, won = 6, drawn = 3, lost = 1, goals_for = 18, goals_against = 7, points = 21 WHERE team_id = 2;
UPDATE team_stats SET played = 10, won = 6, drawn = 2, lost = 2, goals_for = 17, goals_against = 10, points = 20 WHERE team_id = 3;
UPDATE team_stats SET played = 10, won = 5, drawn = 4, lost = 1, goals_for = 16, goals_against = 9, points = 19 WHERE team_id = 4;
UPDATE team_stats SET played = 10, won = 5, drawn = 3, lost = 2, goals_for = 14, goals_against = 11, points = 18 WHERE team_id = 5;
UPDATE team_stats SET played = 10, won = 4, drawn = 4, lost = 2, goals_for = 13, goals_against = 10, points = 16 WHERE team_id = 6;
UPDATE team_stats SET played = 10, won = 4, drawn = 3, lost = 3, goals_for = 12, goals_against = 12, points = 15 WHERE team_id = 7;
UPDATE team_stats SET played = 10, won = 3, drawn = 4, lost = 3, goals_for = 11, goals_against = 13, points = 13 WHERE team_id = 8;
UPDATE team_stats SET played = 10, won = 3, drawn = 2, lost = 5, goals_for = 10, goals_against = 15, points = 11 WHERE team_id = 9;
UPDATE team_stats SET played = 10, won = 2, drawn = 3, lost = 5, goals_for = 8, goals_against = 16, points = 9 WHERE team_id = 10;
UPDATE team_stats SET played = 10, won = 1, drawn = 4, lost = 5, goals_for = 7, goals_against = 17, points = 7 WHERE team_id = 11;
UPDATE team_stats SET played = 10, won = 1, drawn = 2, lost = 7, goals_for = 5, goals_against = 20, points = 5 WHERE team_id = 12;