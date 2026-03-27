-- ============================================================
-- Tianguis Tycoon — Initial Database Schema
-- PostgreSQL Migration 001
-- ============================================================

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'Jugador',
  money DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  reputation DECIMAL(5,2) NOT NULL DEFAULT 50.00 CHECK (reputation BETWEEN 0 AND 100),
  trust_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  current_day INTEGER NOT NULL DEFAULT 1,
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items catalog (base items)
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  base_value DECIMAL(10,2) NOT NULL,
  rarity VARCHAR(20) NOT NULL DEFAULT 'común',
  rarity_multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  condition DECIMAL(3,2) NOT NULL DEFAULT 1.0 CHECK (condition BETWEEN 0 AND 1),
  demand DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Player inventory
CREATE TABLE IF NOT EXISTS inventory (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id),
  purchase_price DECIMAL(10,2) NOT NULL,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transaction history
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL REFERENCES items(id),
  npc_type VARCHAR(30),
  npc_name VARCHAR(100),
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  price DECIMAL(10,2) NOT NULL,
  profit DECIMAL(10,2),
  game_day INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPCs (generated procedurally, stored for reputation tracking)
CREATE TABLE IF NOT EXISTS npcs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  name VARCHAR(100) NOT NULL,
  patience DECIMAL(3,2) NOT NULL,
  greed DECIMAL(3,2) NOT NULL,
  knowledge DECIMAL(3,2) NOT NULL,
  ego DECIMAL(3,2) NOT NULL,
  risk_tolerance DECIMAL(3,2) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  mood VARCHAR(20) NOT NULL DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPC reputation tracking (NPCs remember the player)
CREATE TABLE IF NOT EXISTS npc_reputation (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  npc_id INTEGER NOT NULL REFERENCES npcs(id) ON DELETE CASCADE,
  reputation_score DECIMAL(5,2) NOT NULL DEFAULT 50.00,
  trust_level VARCHAR(20) NOT NULL DEFAULT 'medium',
  interactions_count INTEGER NOT NULL DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, npc_id)
);

-- Market events
CREATE TABLE IF NOT EXISTS market_events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  category VARCHAR(50),
  demand_modifier DECIMAL(3,2) NOT NULL DEFAULT 0,
  day_start INTEGER NOT NULL,
  day_end INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market state (category demand/supply per day)
CREATE TABLE IF NOT EXISTS market_state (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  demand DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  supply DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  game_day INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_player ON inventory(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_player ON transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_transactions_day ON transactions(game_day);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_market_events_day ON market_events(day_start, day_end);
CREATE INDEX IF NOT EXISTS idx_npc_reputation_player ON npc_reputation(player_id);
CREATE INDEX IF NOT EXISTS idx_market_state_day ON market_state(game_day);

-- Insert initial player
INSERT INTO players (name, money, level, reputation, current_day)
VALUES ('Jugador 1', 500.00, 1, 50.00, 1)
ON CONFLICT DO NOTHING;
