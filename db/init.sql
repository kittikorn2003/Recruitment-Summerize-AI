CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
        CHECK (role IN ('user', 'hr', 'admin')),
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    address TEXT,
    file_name TEXT,
    career_summary TEXT,
    skills TEXT[],
    spoken_languages TEXT[],
    projects_or_research JSONB,
    education JSONB,
    employment_history JSONB,
    content TEXT,
    search_vector tsvector,
    embedding vector(384),
    created_at TIMESTAMP DEFAULT NOW()

);

CREATE TABLE role_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_role TEXT NOT NULL CHECK (requested_role IN ('hr')),
    evidence_url TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP,
    reject_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE role_change_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    old_role TEXT,
    new_role TEXT,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    source TEXT,
    created_at TIMESTAMP DEFAULT NOW()
    CHECK (old_role IN ('user', 'hr', 'admin')),
    CHECK (new_role IN ('user', 'hr', 'admin'))
);

CREATE INDEX idx_resume_search
ON resumes
USING GIN(search_vector);

CREATE INDEX idx_resumes_vector 
ON resumes USING hnsw (embedding vector_cosine_ops);

CREATE UNIQUE INDEX idx_one_pending_request
ON role_requests (user_id)
WHERE status = 'pending';
