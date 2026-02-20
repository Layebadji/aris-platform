/*
  # Glycemic Profile — Vigilance Glycémique & Low-GI Labels

  ## Changes

  ### `profiles` table
  - Add `glycemic_vigilance` (boolean, default false)
    Enables glycemic-aware sorting and advisor warnings for users
    managing blood sugar or energy stability.

  ### `recommendations` table
  - Add `is_low_gi` (boolean, default false)
    Flags dishes with a low glycemic index (GI < 55) for priority display
    when a user has glycemic vigilance enabled.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS glycemic_vigilance boolean DEFAULT false;

ALTER TABLE recommendations
  ADD COLUMN IF NOT EXISTS is_low_gi boolean DEFAULT false;
