-- Create donations table for tracking donations and orders
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS donations (
  id BIGSERIAL PRIMARY KEY,
  donor_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  note TEXT,
  transaction_date DATE,
  is_donation BOOLEAN DEFAULT true,
  order_description TEXT,
  photoshoot_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on transaction_date for faster queries
CREATE INDEX IF NOT EXISTS idx_donations_transaction_date ON donations(transaction_date DESC);

-- Create index on is_donation for filtering donations
CREATE INDEX IF NOT EXISTS idx_donations_is_donation ON donations(is_donation);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for fetching donation total and messages)
-- Adjust this policy based on your security needs
CREATE POLICY "Allow public read access" ON donations
  FOR SELECT
  USING (true);

-- Create policy to allow service role full access (for admin operations via API routes)
-- This will work with SUPABASE_SERVICE_ROLE_KEY in your API routes
-- Note: Service role key bypasses RLS by default, but this makes it explicit

