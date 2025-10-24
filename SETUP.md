# Rizoma - Agroproducer Verification Marketplace Setup Guide

## 📋 Overview

Rizoma is a blockchain-powered marketplace for verified agricultural producers in Mexico. The platform enables international buyers to connect with certified agroproducers while maintaining full transparency through Solana blockchain verification and zero-knowledge principles for document privacy.

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with Vite
- React Router for navigation
- Solana Web3.js & Anchor Framework
- Solana Wallet Adapter
- Supabase Client for database

**Backend/Database:**
- Supabase (PostgreSQL + Storage + Auth)
- Solana blockchain (Devnet for development)

**Smart Contracts:**
- Anchor Framework (Rust)
- Solana program in `programs/rizoma2/src/lib.rs`

## 🚀 Setup Instructions

### 1. Supabase Database Setup

#### A. Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

#### B. Run Database Schema
1. Go to Supabase SQL Editor
2. Copy the entire content from `rizoma-frontend/database-schema.sql`
3. Run the SQL script
4. Verify tables are created: `providers`, `products`, `documents`, `blockchain_verifications`, `reviews`, `transactions`, `categories`

#### C. Create Storage Bucket
1. Go to Storage in Supabase Dashboard
2. Create a new bucket called `provider-documents`
3. Set bucket to **public** access
4. Add policy for authenticated uploads:

```sql
-- Policy for uploading documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-documents');

-- Policy for reading documents
CREATE POLICY "Public can read documents"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'provider-documents');
```

### 2. Frontend Setup

```bash
cd rizoma-frontend

# Install dependencies
npm install

# Environment variables are already configured in .env
# Verify the file contains:
# VITE_SUPABASE_URL=https://pvcfhehzgaidtorzwgxj.supabase.co
# VITE_SUPABASE_ANON_KEY=your-key-here

# Start development server
npm run dev
```

### 3. Solana Program Setup (Optional for Development)

The Solana program is already deployed for demo purposes, but if you want to deploy your own:

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Build the program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 📱 Application Features

### For Buyers (All Users)

1. **Marketplace Browsing** (`/marketplace`)
   - Search and filter verified providers
   - View provider profiles and ratings
   - Check blockchain verification status
   - Browse by category (Coffee, Avocado, Fruits, etc.)

### For Providers (Wallet Required)

1. **Onboarding** (`/onboarding`)
   - 4-step registration process
   - Company information collection
   - Legal document upload (KYC/KYB)
   - Blockchain verification

2. **Provider Dashboard** (`/dashboard`)
   - Overview of company stats
   - Product management (CRUD operations)
   - Review management
   - Blockchain proof display

## 🔐 Zero-Knowledge Verification Flow

1. **Document Upload**
   - Provider uploads legal documents to Supabase Storage
   - SHA-256 hash is calculated for each document
   - Hash is stored in database

2. **Blockchain Registration**
   - All document hashes are concatenated
   - Combined hash is stored on Solana blockchain
   - Transaction signature serves as immutable proof

3. **Verification**
   - Buyers can verify document existence without seeing them
   - Blockchain proof confirms documentation completeness
   - Only hash visibility (privacy preserved)

## 🗂️ Database Schema

### Key Tables

**providers**
- Company information
- Wallet address (unique identifier)
- Verification status
- Reputation score
- Blockchain hash

**products**
- Product listings
- Pricing and availability
- Certifications
- Category classification

**documents**
- KYC/KYB documents
- File URLs (private storage)
- SHA-256 hashes
- Verification status
- Blockchain proof reference

**blockchain_verifications**
- Solana transaction signatures
- Data hashes
- Verification type
- Timestamps

**reviews**
- Buyer ratings
- Review text
- Blockchain verification
- Is verified flag

## 🔧 Configuration

### Environment Variables

Create/verify `.env` file in `rizoma-frontend`:

```env
VITE_SUPABASE_URL=https://pvcfhehzgaidtorzwgxj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Wallet Configuration

The app uses Solana Wallet Adapter with:
- Auto-detection of available wallets
- Phantom wallet support
- Solflare wallet support
- Any SPL-compatible wallet

## 📝 Usage Guide

### For Providers

1. **Connect Wallet**
   - Use Phantom or any Solana wallet
   - Click "Connect Wallet" button

2. **Complete Onboarding**
   - Navigate to `/onboarding`
   - Fill company information
   - Upload required documents:
     - Business Registration (Required)
     - Tax Certificate/RFC (Required)
     - Bank Statement (Required)
     - Identity Document (Required)
     - Optional: Certifications, licenses

3. **Blockchain Verification**
   - System creates hash of all documents
   - Registers hash on Solana blockchain
   - Provides immutable proof

4. **Manage Products**
   - Go to Dashboard
   - Add products with pricing
   - Set availability and certifications
   - Update information anytime

### For Buyers

1. **Browse Marketplace**
   - Visit `/marketplace`
   - Use search and filters
   - View verified providers

2. **Verify Providers**
   - Check blockchain verification badge
   - View reputation score
   - Read reviews
   - See transaction history

## 🎨 Design System

### Color Palette
- Primary Background: `#0a0e1a`
- Elevated Background: `#1a1f2e`
- Accent Green: `#2dd4a6`
- Text Primary: `#e8edf5`

### Components
- Modern dark theme
- Glassmorphism effects
- Smooth transitions
- Responsive design (mobile-first)

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Providers can only edit their own data
   - Public read for verified providers
   - Private document access

2. **Blockchain Immutability**
   - Document hashes stored permanently
   - Tamper-proof verification
   - Transaction signatures as proof

3. **Zero-Knowledge Privacy**
   - Documents stored securely
   - Only hashes publicly visible
   - Buyers verify existence, not content

## 🚧 Future Enhancements

- [ ] Smart contract escrow for transactions
- [ ] USDC/USDT payment integration
- [ ] Multi-signature transaction support
- [ ] Advanced reputation algorithm
- [ ] Real-time messaging between buyers/sellers
- [ ] Mobile app (React Native)
- [ ] Mainnet deployment
- [ ] Advanced analytics dashboard

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Not Connecting**
   - Ensure wallet extension is installed
   - Check network is set to Devnet
   - Clear browser cache

2. **Document Upload Failing**
   - Check file size (<10MB)
   - Verify Supabase storage bucket exists
   - Confirm storage policies are set

3. **Database Errors**
   - Verify RLS policies are enabled
   - Check Supabase project status
   - Confirm environment variables are correct

## 📞 Support

For issues or questions:
- Review database schema in `database-schema.sql`
- Check browser console for errors
- Verify Supabase dashboard for data integrity

## 📄 License

ISC
