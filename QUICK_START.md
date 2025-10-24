# Rizoma Quick Start Guide

## 🚀 5-Minute Setup

### 1. Supabase Setup (3 minutes)

```bash
# Go to https://supabase.com and create a project
# Copy your Project URL and anon key (already in .env)
```

**In Supabase Dashboard:**

1. **SQL Editor** → Paste entire `rizoma-frontend/database-schema.sql` → Run
2. **Storage** → Create Bucket → Name: `provider-documents` → Make Public
3. **Storage** → Policies → Add:

```sql
-- Upload policy
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'provider-documents');

-- Read policy
CREATE POLICY "Public can read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'provider-documents');
```

### 2. Frontend Setup (2 minutes)

```bash
cd rizoma-frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

## 🎯 Test the Full Flow

### As a Provider:

1. **Connect Wallet**
   - Install Phantom wallet extension
   - Get some devnet SOL: https://faucet.solana.com
   - Click "Connect Wallet" in navbar

2. **Register** → Go to `/onboarding`
   - Fill company info (Step 1)
   - Add contact details (Step 2)
   - Upload documents (Step 3) - *Use any PDFs for testing*
   - Complete blockchain verification (Step 4)

3. **Manage Products** → Go to `/dashboard`
   - Click "Add Product"
   - Fill product details
   - Set pricing and availability

### As a Buyer:

1. **Browse Marketplace** → Go to `/marketplace`
   - Search providers
   - Filter by category/state
   - View provider cards
   - See verification badges

## 📍 Routes

- `/` - Landing page
- `/marketplace` - Browse verified providers
- `/onboarding` - Register as provider (requires wallet)
- `/dashboard` - Provider dashboard (requires wallet + registration)

## 🔑 Key Features

✅ Multi-step onboarding with document upload
✅ SHA-256 hashing for documents
✅ Solana blockchain verification
✅ Provider marketplace with search/filter
✅ Product management dashboard
✅ Reputation system
✅ Zero-knowledge proof for privacy

## 📦 What You Get

- **Database**: 7 tables with RLS security
- **Pages**: 4 complete pages with routing
- **Components**: Navbar, Forms, Cards, Modals
- **Blockchain**: Solana integration with wallet
- **Storage**: File upload to Supabase
- **Styling**: Dark theme, responsive design

## 🐛 Common Issues

**"Storage bucket not found"**
→ Create `provider-documents` bucket in Supabase Storage

**"Cannot upload files"**
→ Add storage policies (see step 1.3 above)

**"Provider not found"**
→ Complete onboarding first at `/onboarding`

**Wallet won't connect**
→ Switch to Devnet in Phantom settings

## 📚 Documentation

- **SETUP.md** - Comprehensive setup guide
- **IMPLEMENTATION_SUMMARY.md** - Complete feature list
- **database-schema.sql** - Full database schema with sample data

## 🎨 Sample Test Data

**Providers** (already in schema):
- Aguacates del Norte (Michoacán)
- Café de Altura Veracruz (Veracruz)

**Products**:
- Aguacate Hass Orgánico - $3.50/kg
- Café Arábica Premium - $12.00/kg

## 💡 Pro Tips

1. **Use the sample data** - The schema includes 2 demo providers to see how the marketplace looks
2. **Test with real PDFs** - Any PDF works for testing document upload
3. **Check blockchain** - Each verification creates a real Solana transaction on Devnet
4. **Mobile testing** - All pages are fully responsive
5. **Dashboard first** - After onboarding, go to `/dashboard` to manage products

## ⚡ Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Success Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Storage bucket created
- [ ] Storage policies added
- [ ] npm install completed
- [ ] Dev server running
- [ ] Wallet connected
- [ ] Test provider registered
- [ ] Test product created
- [ ] Marketplace displaying providers

## 🚀 You're Ready!

Once the checklist is complete, you have a fully functional agroproducer verification marketplace with:
- Blockchain-verified providers
- Zero-knowledge document proofs
- Product management system
- Buyer marketplace

**Next Steps:** Invite real agroproducers to register and start building your verified network! 🌱
