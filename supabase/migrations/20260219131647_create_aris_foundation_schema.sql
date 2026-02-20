/*
  # ARIS Platform Foundation Schema
  
  ## Overview
  Complete database foundation for the ARIS health performance platform, designed for high-level executives in Dakar. This migration establishes the core data architecture with emphasis on privacy, anonymization, and performance tracking.

  ## New Tables
  
  ### 1. `profiles`
  Executive profile data with minimal personal information
  - `id` (uuid, primary key) - Links to auth.users
  - `full_name` (text, optional) - Display name (nullable for privacy)
  - `performance_goal` (text) - Personal health objective
  - `metabolic_type` (text) - Metabolic classification
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### 2. `health_logs`
  Anonymized health performance metrics tracking
  - `id` (uuid, primary key) - Unique log identifier
  - `user_id` (uuid, foreign key) - References auth.users(id)
  - `vitality_score` (integer) - Overall health score (0-100)
  - `cognitive_index` (integer) - Mental performance metric (0-100)
  - `metabolic_stability` (integer) - Metabolic health indicator (0-100)
  - `recovery_index` (integer) - Recovery quality metric (0-100)
  - `logged_at` (timestamptz) - Timestamp of measurement
  - `created_at` (timestamptz) - Record creation time

  ### 3. `recommendations`
  Curated restaurant dishes with performance ratings
  - `id` (uuid, primary key) - Unique recommendation identifier
  - `dish_name` (text) - Name of the dish
  - `restaurant_name` (text) - Restaurant identifier
  - `description` (text) - Dish description
  - `performance_rating` (integer) - Health performance score (0-100)
  - `metabolic_compatibility` (text array) - Compatible metabolic types
  - `cognitive_boost` (boolean) - Enhances cognitive function
  - `recovery_support` (boolean) - Aids recovery
  - `price_tier` (text) - Pricing category
  - `created_at` (timestamptz) - Record creation time

  ## Security Implementation
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies ensuring:
  - Users can only access their own data
  - Complete data isolation between users
  - Recommendations are public for browsing but controlled for mutations
  
  ### Privacy & Anonymization
  - No sensitive personal data in health_logs beyond user_id
  - Profile information is optional and minimal
  - All health metrics stored as normalized scores
  
  ## Important Notes
  1. All timestamps use timestamptz for timezone awareness
  2. Foreign key constraints ensure referential integrity
  3. Default values provided for user experience
  4. Indexes will be added in future migrations as needed
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  performance_goal text DEFAULT 'Optimize cognitive and physical performance',
  metabolic_type text DEFAULT 'balanced',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create health_logs table
CREATE TABLE IF NOT EXISTS health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vitality_score integer DEFAULT 0,
  cognitive_index integer DEFAULT 0,
  metabolic_stability integer DEFAULT 0,
  recovery_index integer DEFAULT 0,
  logged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dish_name text NOT NULL,
  restaurant_name text NOT NULL,
  description text DEFAULT '',
  performance_rating integer DEFAULT 0,
  metabolic_compatibility text[] DEFAULT ARRAY[]::text[],
  cognitive_boost boolean DEFAULT false,
  recovery_support boolean DEFAULT false,
  price_tier text DEFAULT 'premium',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for health_logs table
CREATE POLICY "Users can view own health logs"
  ON health_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health logs"
  ON health_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health logs"
  ON health_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own health logs"
  ON health_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for recommendations table (public read, admin write)
CREATE POLICY "Anyone can view recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_health_logs_user_id ON health_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_health_logs_logged_at ON health_logs(logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_restaurant ON recommendations(restaurant_name);
CREATE INDEX IF NOT EXISTS idx_recommendations_rating ON recommendations(performance_rating DESC);