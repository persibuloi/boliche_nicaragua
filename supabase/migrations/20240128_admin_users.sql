-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_tokens table for session management
CREATE TABLE IF NOT EXISTS admin_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using SHA-256
INSERT INTO admin_users (name, email, password_hash, role, is_active) 
VALUES (
  'Administrador Principal',
  'admin@boliche-nicaragua.com',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- admin123
  'admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_tokens_user_id ON admin_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_tokens_token ON admin_tokens(token);
CREATE INDEX IF NOT EXISTS idx_admin_tokens_is_active ON admin_tokens(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Admin users can see all users
CREATE POLICY "Admin users can view all users" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_tokens at
      JOIN admin_users au ON at.user_id = au.id
      WHERE at.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND at.is_active = true
      AND au.is_active = true
    )
  );

-- Admin users can update all users (admins only)
CREATE POLICY "Admin users can update users" ON admin_users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_tokens at
      JOIN admin_users au ON at.user_id = au.id
      WHERE at.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND at.is_active = true
      AND au.is_active = true
      AND au.role = 'admin'
    )
  );

-- Admin users can insert new users (admins only)
CREATE POLICY "Admin users can insert users" ON admin_users
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_tokens at
      JOIN admin_users au ON at.user_id = au.id
      WHERE at.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND at.is_active = true
      AND au.is_active = true
      AND au.role = 'admin'
    )
  );

-- Admin users can delete users (admins only, except themselves)
CREATE POLICY "Admin users can delete users" ON admin_users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM admin_tokens at
      JOIN admin_users au ON at.user_id = au.id
      WHERE at.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND at.is_active = true
      AND au.is_active = true
      AND au.role = 'admin'
      AND au.id != admin_users.id -- Can't delete yourself
    )
  );

-- Tokens policies
CREATE POLICY "Users can manage their own tokens" ON admin_tokens
  FOR ALL USING (
    user_id = (
      SELECT au.id FROM admin_users au
      JOIN admin_tokens at ON at.user_id = au.id
      WHERE at.token = current_setting('request.jwt.claims', true)::json->>'token'
      AND at.is_active = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_admin_users_updated_at 
  BEFORE UPDATE ON admin_users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions to service role
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON admin_tokens TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
