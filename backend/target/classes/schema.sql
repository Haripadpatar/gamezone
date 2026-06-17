-- Antigravity Production Database Schema Blueprint

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    referred_by VARCHAR(20),
    vip_tier VARCHAR(20) DEFAULT 'BRONZE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(20) DEFAULT 'USER',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'UNVERIFIED', -- 'UNVERIFIED', 'PENDING', 'VERIFIED'
    security_2fa BOOLEAN DEFAULT FALSE
);

-- Login History Table
CREATE TABLE IF NOT EXISTS login_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45) NOT NULL,
    device VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    main_balance DECIMAL(15, 2) DEFAULT 1000.00,
    bonus_balance DECIMAL(15, 2) DEFAULT 250.00,
    locked_balance DECIMAL(15, 2) DEFAULT 0.00,
    practice_balance DECIMAL(15, 2) DEFAULT 10000.00,
    referral_earnings DECIMAL(15, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    wallet_id BIGINT REFERENCES wallets(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'BONUS', 'REFERRAL'
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED'
    payment_method VARCHAR(50), -- 'UPI', 'CARD', 'NETBANKING', 'CRYPTO'
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Game History Logs Table
CREATE TABLE IF NOT EXISTS game_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL, -- 'MINES', 'CRASH', 'SLOTS', 'ROULETTE', etc.
    bet_amount DECIMAL(15, 2) NOT NULL,
    win_amount DECIMAL(15, 2) NOT NULL,
    multiplier DECIMAL(10, 2) NOT NULL,
    payout_details VARCHAR(255),
    played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Advertisements Table
CREATE TABLE IF NOT EXISTS advertisements (
    id SERIAL PRIMARY KEY,
    placement VARCHAR(50) NOT NULL, -- 'BANNER', 'POPUP', 'SIDEBAR', 'REWARDED'
    title VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    link_url VARCHAR(255),
    reward_amount DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE
);

-- Referrals Table
CREATE TABLE IF NOT EXISTS referrals (
    id BIGSERIAL PRIMARY KEY,
    referrer_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    referee_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    commission_earned DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    points INT DEFAULT 0,
    prize DECIMAL(15, 2) DEFAULT 0.00,
    rank INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    vip_tier VARCHAR(20) DEFAULT 'BRONZE',
    text VARCHAR(500) NOT NULL,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'WALLET', 'GAMES', 'PROMO', 'TECHNICAL'
    message TEXT NOT NULL,
    reply TEXT,
    status VARCHAR(20) DEFAULT 'OPEN', -- 'OPEN', 'RESOLVED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id BIGSERIAL PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(50) NOT NULL
);
