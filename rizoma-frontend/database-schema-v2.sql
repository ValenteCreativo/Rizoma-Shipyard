-- ============================================================================
-- RIZOMA PLATFORM - DATABASE SCHEMA V2.0
-- Complete schema with authentication, buyer profiles, and RFQ system
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Supabase auth.users table is managed automatically
-- We extend it with our profiles

-- Add user_id column to providers table (link to auth.users)
ALTER TABLE providers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_verification'));

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);

-- ============================================================================
-- BUYER PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS buyer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,

  -- Company Information
  company_name TEXT NOT NULL,
  business_type TEXT, -- Restaurant, Distributor, Retailer, Wholesaler, Food Manufacturer
  company_size TEXT, -- Small (1-50), Medium (51-250), Large (251+)
  tax_id TEXT,

  -- Contact Information
  contact_person TEXT,
  phone TEXT,
  website TEXT,

  -- Location
  country TEXT NOT NULL,
  city TEXT,
  address TEXT,
  postal_code TEXT,

  -- Business Details
  annual_volume JSONB, -- { "avocados": 10000, "berries": 5000 } (in kg/year)
  product_interests JSONB, -- ["avocados", "berries", "coffee"]
  import_license_number TEXT,
  operating_countries JSONB, -- ["USA", "Canada", "Japan"]

  -- Preferences
  preferred_currency TEXT DEFAULT 'USD',
  preferred_language TEXT DEFAULT 'en',
  preferred_payment_terms TEXT, -- NET 30, NET 60, Advance

  -- Account Status
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_verification')),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_user_id ON buyer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_country ON buyer_profiles(country);
CREATE INDEX IF NOT EXISTS idx_buyer_profiles_verified ON buyer_profiles(verified);

-- ============================================================================
-- RFQ (REQUEST FOR QUOTE) SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES buyer_profiles(id) ON DELETE CASCADE NOT NULL,

  -- RFQ Details
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'quoted', 'negotiating', 'accepted', 'declined', 'expired', 'closed')),

  -- Shipping & Logistics
  incoterms TEXT, -- FOB, CIF, EXW, DDP, etc.
  destination_port TEXT,
  destination_country TEXT,
  required_delivery_date DATE,

  -- Additional Requirements
  certifications_required JSONB, -- ["Organic", "Fair Trade", "GlobalGAP"]
  packaging_requirements TEXT,
  quality_standards TEXT,
  special_requirements TEXT,

  -- Validity
  valid_until DATE,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  closed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_id ON rfqs(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_at ON rfqs(created_at DESC);

-- ============================================================================
-- RFQ ITEMS (Products requested in each RFQ)
-- ============================================================================

CREATE TABLE IF NOT EXISTS rfq_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,

  -- Product Information
  product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Optional: specific product
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL, -- Optional: specific provider

  -- Request Details
  product_category TEXT, -- General category if not specific product
  product_name TEXT,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',

  -- Specifications
  specifications JSONB, -- { "variety": "Hass", "size": "Large", "ripeness": "Ready to eat" }
  quality_grade TEXT,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'selected', 'rejected')),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq_id ON rfq_items(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_product_id ON rfq_items(product_id);
CREATE INDEX IF NOT EXISTS idx_rfq_items_provider_id ON rfq_items(provider_id);

-- ============================================================================
-- QUOTES (Provider responses to RFQs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rfq_item_id UUID REFERENCES rfq_items(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,

  -- Pricing
  price_per_unit DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  minimum_order_quantity DECIMAL,

  -- Terms
  lead_time_days INTEGER,
  incoterms TEXT,
  payment_terms TEXT, -- NET 30, NET 60, 50% advance + 50% on delivery

  -- Validity
  valid_until DATE NOT NULL,

  -- Details
  notes TEXT,
  attachments JSONB, -- [{"name": "quote.pdf", "url": "..."}, ...]

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired', 'withdrawn')),

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_quotes_rfq_item_id ON quotes(rfq_item_id);
CREATE INDEX IF NOT EXISTS idx_quotes_provider_id ON quotes(provider_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);

-- ============================================================================
-- FAVORITES (Saved providers by buyers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES buyer_profiles(id) ON DELETE CASCADE NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE NOT NULL,

  -- Organization
  list_name TEXT DEFAULT 'My Favorites', -- "Organic Suppliers", "Backup Vendors", etc.
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(buyer_id, provider_id) -- Can't favorite same provider twice
);

CREATE INDEX IF NOT EXISTS idx_favorites_buyer_id ON favorites(buyer_id);
CREATE INDEX IF NOT EXISTS idx_favorites_provider_id ON favorites(provider_id);

-- ============================================================================
-- MESSAGES (Communication between buyers and providers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Participants
  sender_id UUID NOT NULL, -- Can be buyer or provider user_id
  recipient_id UUID NOT NULL, -- Can be buyer or provider user_id
  sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'provider')),
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('buyer', 'provider')),

  -- Related to
  rfq_id UUID REFERENCES rfqs(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,

  -- Message Content
  subject TEXT,
  message TEXT NOT NULL,
  attachments JSONB,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_rfq_id ON messages(rfq_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ============================================================================
-- COMPARISON LISTS (Temp storage for product comparisons)
-- ============================================================================

CREATE TABLE IF NOT EXISTS comparison_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES buyer_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Comparison Items
  provider_ids JSONB NOT NULL, -- Array of provider UUIDs [uuid1, uuid2, uuid3]
  product_ids JSONB, -- Array of product UUIDs [uuid1, uuid2, uuid3]

  -- Metadata
  name TEXT DEFAULT 'Comparison',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days') -- Auto-cleanup after 7 days
);

CREATE INDEX IF NOT EXISTS idx_comparison_lists_buyer_id ON comparison_lists(buyer_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- References auth.users(id)

  -- Notification Details
  type TEXT NOT NULL, -- 'rfq_received', 'quote_received', 'message_received', 'price_alert', etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Internal link to relevant page

  -- Related entities
  related_id UUID, -- ID of related RFQ, quote, message, etc.
  related_type TEXT, -- 'rfq', 'quote', 'message', etc.

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE buyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Buyer Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view their own buyer profile"
  ON buyer_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own buyer profile"
  ON buyer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own buyer profile"
  ON buyer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RFQs: Buyers can see their own RFQs, providers can see RFQs sent to them
CREATE POLICY "Buyers can view their own RFQs"
  ON rfqs FOR SELECT
  USING (
    buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can manage their own RFQs"
  ON rfqs FOR ALL
  USING (
    buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  );

-- Quotes: Providers can see quotes they created, buyers can see quotes for their RFQs
CREATE POLICY "Providers can view their own quotes"
  ON quotes FOR SELECT
  USING (
    provider_id IN (
      SELECT id FROM providers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Buyers can view quotes for their RFQs"
  ON quotes FOR SELECT
  USING (
    rfq_id IN (
      SELECT id FROM rfqs WHERE buyer_id IN (
        SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Favorites: Users can only manage their own favorites
CREATE POLICY "Buyers can manage their own favorites"
  ON favorites FOR ALL
  USING (
    buyer_id IN (
      SELECT id FROM buyer_profiles WHERE user_id = auth.uid()
    )
  );

-- Messages: Users can see messages they sent or received
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_buyer_profiles_updated_at
  BEFORE UPDATE ON buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON rfqs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Note: Auth users must be created through Supabase Auth signup
-- After creating auth users, their user_id can be used here

-- Sample Buyer Profile (replace with actual user_id after signup)
INSERT INTO buyer_profiles (
  user_id,
  company_name,
  business_type,
  country,
  city,
  product_interests,
  preferred_currency,
  verified
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid, -- Replace with real user_id
  'Tokyo Fresh Foods Co.',
  'Wholesaler',
  'Japan',
  'Tokyo',
  '["avocados", "berries"]'::jsonb,
  'JPY',
  true
) ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- MAINTENANCE & CLEANUP
-- ============================================================================

-- Function to clean up expired comparisons
CREATE OR REPLACE FUNCTION cleanup_expired_comparisons()
RETURNS void AS $$
BEGIN
  DELETE FROM comparison_lists WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to mark expired quotes
CREATE OR REPLACE FUNCTION mark_expired_quotes()
RETURNS void AS $$
BEGIN
  UPDATE quotes
  SET status = 'expired'
  WHERE status = 'pending'
    AND valid_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark expired RFQs
CREATE OR REPLACE FUNCTION mark_expired_rfqs()
RETURNS void AS $$
BEGIN
  UPDATE rfqs
  SET status = 'expired'
  WHERE status IN ('sent', 'quoted')
    AND valid_until < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS FOR EASIER QUERYING
-- ============================================================================

-- View: RFQs with buyer information
CREATE OR REPLACE VIEW rfqs_with_buyer AS
SELECT
  r.*,
  b.company_name as buyer_company_name,
  b.country as buyer_country,
  b.verified as buyer_verified
FROM rfqs r
JOIN buyer_profiles b ON r.buyer_id = b.id;

-- View: Quotes with provider and RFQ information
CREATE OR REPLACE VIEW quotes_with_details AS
SELECT
  q.*,
  p.company_name as provider_company_name,
  p.city as provider_city,
  p.state as provider_state,
  r.title as rfq_title,
  b.company_name as buyer_company_name
FROM quotes q
JOIN providers p ON q.provider_id = p.id
JOIN rfqs r ON q.rfq_id = r.id
JOIN buyer_profiles b ON r.buyer_id = b.id;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Additional indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rfqs_buyer_status ON rfqs(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_quotes_provider_status ON quotes(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, read) WHERE read = FALSE;

-- ============================================================================
-- SCHEMA VERSION TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_versions (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

INSERT INTO schema_versions (version, description) VALUES
  ('2.0.0', 'Added authentication, buyer profiles, RFQ system, and messaging')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- END OF SCHEMA V2.0
-- ============================================================================
