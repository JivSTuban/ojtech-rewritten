-- Create CV table
CREATE TABLE IF NOT EXISTS cvs (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    extracted_skills TEXT,
    skills TEXT,
    analysis_results TEXT,
    last_analyzed_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    error_message TEXT,
    file_hash VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);

-- Create index on is_active to find active CVs quickly
CREATE INDEX IF NOT EXISTS idx_cvs_is_active ON cvs(is_active); 