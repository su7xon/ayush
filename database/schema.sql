-- TEA-TIME Database Schema
-- Anonymous Social Network for College Students

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Colleges/Universities table
CREATE TABLE colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(100) NOT NULL UNIQUE, -- e.g., "harvard.edu"
    logo_url TEXT,
    location VARCHAR(255),
    student_count INTEGER,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (anonymous profiles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE, -- College email for verification
    anonymous_username VARCHAR(50) NOT NULL, -- e.g., "TeaLeaf42"
    anonymous_avatar_seed VARCHAR(100), -- For generating consistent avatars
    tea_points INTEGER DEFAULT 0, -- Gamification points
    tea_rank VARCHAR(50) DEFAULT 'Freshman Spiller',
    is_verified BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_username_per_college UNIQUE(college_id, anonymous_username)
);

-- Post categories
CREATE TYPE post_category AS ENUM (
    'confession', 'poll', 'tea', 'rumor', 'challenge', 'general'
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    category post_category NOT NULL DEFAULT 'general',
    title VARCHAR(300),
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of media URLs
    is_anonymous BOOLEAN DEFAULT true,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_reported BOOLEAN DEFAULT false,
    report_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for trending and feed queries
    INDEX idx_posts_trending (college_id, is_trending, created_at DESC),
    INDEX idx_posts_feed (college_id, created_at DESC),
    INDEX idx_posts_category (college_id, category, created_at DESC)
);

-- Polls (extends posts)
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll options
CREATE TABLE poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text VARCHAR(200) NOT NULL,
    votes_count INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poll votes
CREATE TABLE poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    poll_option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_poll_vote UNIQUE(poll_id, user_id)
);

-- Rumor polls (for campus rumor mill)
CREATE TABLE rumors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    rumor_text TEXT NOT NULL,
    believe_count INTEGER DEFAULT 0,
    doubt_count INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    credibility_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rumor votes
CREATE TABLE rumor_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rumor_id UUID NOT NULL REFERENCES rumors(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    believes BOOLEAN NOT NULL, -- true = believe, false = doubt
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_rumor_vote UNIQUE(rumor_id, user_id)
);

-- Challenges
CREATE TABLE challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    challenge_text TEXT NOT NULL,
    challenge_type VARCHAR(50) DEFAULT 'confession', -- confession, dare, story
    participants_count INTEGER DEFAULT 0,
    is_trending BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Challenge responses
CREATE TABLE challenge_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reactions types
CREATE TYPE reaction_type AS ENUM (
    'like', 'laugh', 'shocked', 'angry', 'fire', 'eyes'
);

-- Post reactions
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_post_reaction UNIQUE(post_id, user_id)
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_reported BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment reactions
CREATE TABLE comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type reaction_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_user_comment_reaction UNIQUE(comment_id, user_id)
);

-- Notifications
CREATE TYPE notification_type AS ENUM (
    'post_liked', 'post_commented', 'comment_liked', 'post_trending', 
    'challenge_response', 'poll_voted', 'rumor_update', 'tea_rank_up'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_notifications_user (user_id, is_read, created_at DESC)
);

-- User sessions (for analytics)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    posts_viewed INTEGER DEFAULT 0,
    posts_created INTEGER DEFAULT 0,
    comments_made INTEGER DEFAULT 0,
    reactions_given INTEGER DEFAULT 0
);

-- Reports (for moderation)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trending topics/hashtags
CREATE TABLE trending_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    topic VARCHAR(100) NOT NULL,
    mention_count INTEGER DEFAULT 1,
    trend_score DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_topic_per_college UNIQUE(college_id, topic)
);

-- Views for analytics
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.anonymous_username,
    u.tea_points,
    u.tea_rank,
    COUNT(DISTINCT p.id) as posts_count,
    COUNT(DISTINCT c.id) as comments_count,
    COUNT(DISTINCT r.id) as reactions_given,
    COALESCE(SUM(p.likes_count), 0) as total_likes_received
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN reactions r ON u.id = r.user_id
GROUP BY u.id, u.anonymous_username, u.tea_points, u.tea_rank;

-- Triggers for updating counts
CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'reactions' THEN
            UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'reactions' THEN
            UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_reactions
    AFTER INSERT OR DELETE ON reactions
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

CREATE TRIGGER trigger_update_post_comments
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Indexes for performance
CREATE INDEX idx_users_college ON users(college_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_college_created ON posts(college_id, created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_trending_topics_college ON trending_topics(college_id, trend_score DESC);

-- Insert sample colleges
INSERT INTO colleges (name, domain, location) VALUES
('Harvard University', 'harvard.edu', 'Cambridge, MA'),
('Stanford University', 'stanford.edu', 'Stanford, CA'),
('MIT', 'mit.edu', 'Cambridge, MA'),
('University of California, Berkeley', 'berkeley.edu', 'Berkeley, CA'),
('Yale University', 'yale.edu', 'New Haven, CT');