-- Rizoma Agroproducer Marketplace Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Providers table (Agroproducers)
CREATE TABLE providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  tax_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT DEFAULT 'Mexico',
  state TEXT,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_review', 'verified', 'rejected')),
  blockchain_hash TEXT,
  reputation_score DECIMAL(3,2) DEFAULT 0.00 CHECK (reputation_score >= 0 AND reputation_score <= 5),
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  unit TEXT NOT NULL, -- kg, ton, liter, etc.
  price_per_unit DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  minimum_order DECIMAL(10,2),
  available_quantity DECIMAL(10,2),
  harvest_season TEXT,
  origin_region TEXT,
  certifications TEXT[], -- organic, fair trade, etc.
  images TEXT[],
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (KYC/KYB compliance)
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'business_registration',
    'tax_certificate',
    'phytosanitary_certificate',
    'organic_certification',
    'quality_certification',
    'export_license',
    'bank_statement',
    'identity_document',
    'address_proof',
    'other'
  )),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_hash TEXT, -- SHA-256 hash of the document
  blockchain_proof TEXT, -- Solana transaction signature
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  expiry_date DATE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blockchain Verifications table
CREATE TABLE blockchain_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('document_hash', 'provider_registration', 'reputation_update', 'transaction_proof')),
  solana_signature TEXT UNIQUE NOT NULL,
  data_hash TEXT NOT NULL,
  block_time TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews and Ratings table
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  buyer_wallet TEXT NOT NULL,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  transaction_ref UUID,
  blockchain_proof TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table (for tracking deals)
CREATE TABLE transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  buyer_wallet TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  quantity DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USDC',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_transit', 'delivered', 'disputed', 'completed', 'cancelled')),
  smart_contract_address TEXT,
  escrow_signature TEXT,
  delivery_date DATE,
  blockchain_proof TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider Categories (for filtering)
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
  ('Fruits', 'fruits', 'Fresh and dried fruits'),
  ('Vegetables', 'vegetables', 'Fresh vegetables and greens'),
  ('Grains', 'grains', 'Cereals, wheat, corn, rice'),
  ('Coffee', 'coffee', 'Coffee beans and processed coffee'),
  ('Spices', 'spices', 'Herbs, spices and seasonings'),
  ('Avocado', 'avocado', 'Fresh avocados - Hass, Fuerte'),
  ('Berries', 'berries', 'Strawberries, blueberries, raspberries'),
  ('Citrus', 'citrus', 'Oranges, lemons, limes'),
  ('Organic', 'organic', 'Certified organic products');

-- Indexes for performance
CREATE INDEX idx_providers_wallet ON providers(wallet_address);
CREATE INDEX idx_providers_status ON providers(verification_status);
CREATE INDEX idx_providers_active ON providers(is_active);
CREATE INDEX idx_products_provider ON products(provider_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_documents_provider ON documents(provider_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_blockchain_verifications_provider ON blockchain_verifications(provider_id);
CREATE INDEX idx_blockchain_verifications_signature ON blockchain_verifications(solana_signature);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_transactions_provider ON transactions(provider_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_wallet);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read access for verified providers
CREATE POLICY "Public providers read access" ON providers
    FOR SELECT USING (verification_status = 'verified' AND is_active = true);

-- Providers can update their own data
CREATE POLICY "Providers can update own data" ON providers
    FOR UPDATE USING (auth.jwt() ->> 'wallet_address' = wallet_address);

-- Public read access for products
CREATE POLICY "Public products read access" ON products
    FOR SELECT USING (is_available = true);

-- Providers can manage their own products
CREATE POLICY "Providers can manage own products" ON products
    FOR ALL USING (
        provider_id IN (
            SELECT id FROM providers WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Documents only accessible by owner and admins
CREATE POLICY "Providers can view own documents" ON documents
    FOR SELECT USING (
        provider_id IN (
            SELECT id FROM providers WHERE wallet_address = auth.jwt() ->> 'wallet_address'
        )
    );

-- Public read for blockchain verifications
CREATE POLICY "Public blockchain verifications" ON blockchain_verifications
    FOR SELECT USING (true);

-- Public read for reviews
CREATE POLICY "Public reviews read access" ON reviews
    FOR SELECT USING (true);

-- Anyone can insert reviews (will need wallet signature verification in app)
CREATE POLICY "Anyone can create reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Public read for categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public categories read access" ON categories
    FOR SELECT USING (true);

-- Function to update provider reputation score
CREATE OR REPLACE FUNCTION update_provider_reputation()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers
    SET reputation_score = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE provider_id = NEW.provider_id AND is_verified = true
    )
    WHERE id = NEW.provider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reputation_on_review
    AFTER INSERT OR UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_provider_reputation();

-- Sample data for testing
INSERT INTO providers (wallet_address, company_name, legal_name, tax_id, email, phone, state, city, description, verification_status) VALUES
  ('Demo1WalletAddress123', 'Aguacates del Norte', 'Aguacates del Norte S.A. de C.V.', 'RFC-123456789', 'contacto@aguacatesdelnorte.mx', '+52 33 1234 5678', 'Michoacán', 'Uruapan', 'Productores de aguacate Hass certificado orgánico con 15 años de experiencia', 'verified'),
  ('Demo2WalletAddress456', 'Café de Altura Veracruz', 'Café de Altura Veracruz S.P.R. de R.L.', 'RFC-987654321', 'ventas@cafedealtura.mx', '+52 22 9876 5432', 'Veracruz', 'Coatepec', 'Café arábica de altura cultivado de forma sustentable', 'verified');

INSERT INTO products (provider_id, name, description, category, unit, price_per_unit, minimum_order, available_quantity, certifications) VALUES
  ((SELECT id FROM providers WHERE company_name = 'Aguacates del Norte'), 'Aguacate Hass Orgánico', 'Aguacate Hass certificado orgánico, calibre 32-36', 'Avocado', 'kg', 3.50, 500, 5000, ARRAY['USDA Organic', 'México Calidad Suprema']),
  ((SELECT id FROM providers WHERE company_name = 'Café de Altura Veracruz'), 'Café Arábica Premium', 'Café arábica lavado, altura 1200-1500 msnm', 'Coffee', 'kg', 12.00, 100, 2000, ARRAY['Rainforest Alliance', 'Fair Trade']);
