# Rizoma Deployment Checklist

## ✅ Pre-Deployment Verification

### Database Setup
- [ ] Supabase project created
- [ ] Project URL and anon key copied
- [ ] Database schema executed successfully (`database-schema.sql`)
- [ ] All 7 tables created (providers, products, documents, blockchain_verifications, reviews, transactions, categories)
- [ ] Sample data inserted (2 demo providers)
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] RLS policies working correctly

### Storage Configuration
- [ ] Storage bucket `provider-documents` created
- [ ] Bucket set to **public** access
- [ ] Upload policy added for authenticated users
- [ ] Read policy added for public access
- [ ] Test file upload works
- [ ] Uploaded files accessible via public URL

### Frontend Configuration
- [ ] Environment variables set in `.env`
  - [ ] `VITE_SUPABASE_URL` matches your project
  - [ ] `VITE_SUPABASE_ANON_KEY` matches your project
- [ ] Dependencies installed (`npm install`)
- [ ] Build successful (`npm run build`)
- [ ] No TypeScript/ESLint errors
- [ ] Dev server runs (`npm run dev`)

### Wallet Integration
- [ ] Phantom wallet extension installed
- [ ] Wallet switched to Devnet
- [ ] Devnet SOL obtained from faucet
- [ ] Wallet connects successfully
- [ ] Transactions can be signed

## ✅ Functional Testing

### Homepage (`/`)
- [ ] Landing page loads
- [ ] Hero section displays correctly
- [ ] Video embed works
- [ ] CTA buttons link correctly
- [ ] Problem/Solution section visible
- [ ] How It Works steps display
- [ ] Footer renders properly
- [ ] Responsive on mobile

### Marketplace (`/marketplace`)
- [ ] Page loads without errors
- [ ] Sample providers display (if schema loaded)
- [ ] Search bar functional
- [ ] Filters work (category, state, sort)
- [ ] Provider cards show correctly
- [ ] Verification badges visible
- [ ] Links to provider profiles work
- [ ] Empty state shows when no results
- [ ] Categories section renders
- [ ] CTA section displays
- [ ] Responsive layout works

### Onboarding (`/onboarding`)
- [ ] Redirects if wallet not connected
- [ ] Wallet connection prompt shows
- [ ] Step 1: Company info form works
- [ ] Step 2: Contact form works
- [ ] Step 3: Document upload functions
  - [ ] File selection works
  - [ ] Upload to Supabase succeeds
  - [ ] Hash calculation works
  - [ ] Documents list displays
  - [ ] Remove document works
- [ ] Step 4: Summary displays correctly
- [ ] Blockchain verification works
  - [ ] Transaction signs successfully
  - [ ] Signature stored in database
  - [ ] Redirects to dashboard after success
- [ ] Form validation works
- [ ] Error messages display
- [ ] Success messages show
- [ ] Progress stepper updates
- [ ] Back/Next navigation works
- [ ] Responsive on mobile

### Provider Dashboard (`/dashboard`)
- [ ] Redirects if not registered
- [ ] Redirects if wallet not connected
- [ ] Provider data loads
- [ ] Header shows company info
- [ ] Verification status badge correct
- [ ] Stats cards display
  - [ ] Reputation score
  - [ ] Total transactions
  - [ ] Product count
  - [ ] Review count
- [ ] Tab navigation works
- [ ] **Overview tab:**
  - [ ] Company info displays
  - [ ] Blockchain hash shows
  - [ ] Reviews render (if any)
- [ ] **Products tab:**
  - [ ] Products list loads
  - [ ] "Add Product" button works
  - [ ] Product modal opens
  - [ ] Create product succeeds
  - [ ] Edit product works
  - [ ] Delete product works
  - [ ] Product cards display correctly
- [ ] **Reviews tab:**
  - [ ] Reviews list loads
  - [ ] Empty state for no reviews
- [ ] **Settings tab:**
  - [ ] Renders (placeholder)
- [ ] Responsive layout works

### Navigation
- [ ] Navbar always visible (sticky)
- [ ] Logo links to home
- [ ] All nav links work
- [ ] Wallet button in navbar
- [ ] Active link highlighting
- [ ] Mobile menu (if implemented)

## ✅ Data Verification

### Database
- [ ] New provider inserted on registration
- [ ] Documents inserted with hashes
- [ ] Blockchain verification record created
- [ ] Products CRUD operations work
- [ ] Reviews can be fetched
- [ ] Categories load correctly

### Storage
- [ ] Files uploaded to correct bucket
- [ ] File URLs are accessible
- [ ] Files can be deleted
- [ ] Storage quota reasonable

### Blockchain
- [ ] Transactions appear on Solana Explorer
- [ ] Signatures are valid
- [ ] Hashes match stored documents
- [ ] Transaction links work

## ✅ Security Verification

### Row Level Security
- [ ] Providers can only edit own data
- [ ] Public can read verified providers
- [ ] Documents are private (owner only)
- [ ] Anonymous users can browse marketplace

### Authentication
- [ ] Wallet signature required for writes
- [ ] Wallet address used as identifier
- [ ] No unauthorized data access

### Privacy
- [ ] Document content not exposed
- [ ] Only hashes publicly visible
- [ ] Buyer cannot access provider documents
- [ ] Blockchain proof verifiable

## ✅ Performance

### Load Times
- [ ] Homepage loads < 3s
- [ ] Marketplace loads < 3s
- [ ] Dashboard loads < 3s
- [ ] Images load quickly
- [ ] No blocking resources

### Optimization
- [ ] Images optimized
- [ ] CSS minified in production
- [ ] JS bundled efficiently
- [ ] No console errors
- [ ] No memory leaks

## ✅ User Experience

### Design
- [ ] Consistent styling across pages
- [ ] Dark theme applied everywhere
- [ ] Colors match design system
- [ ] Typography readable
- [ ] Spacing consistent
- [ ] Borders and shadows correct

### Interactions
- [ ] Buttons have hover states
- [ ] Forms provide feedback
- [ ] Loading states show
- [ ] Success messages clear
- [ ] Error messages helpful
- [ ] Transitions smooth

### Responsiveness
- [ ] Mobile (< 768px) works
- [ ] Tablet (768-1024px) works
- [ ] Desktop (> 1024px) optimal
- [ ] Touch targets adequate (44px)
- [ ] Text readable on all sizes

## ✅ Edge Cases

### Error Handling
- [ ] Network errors handled
- [ ] Supabase errors caught
- [ ] Blockchain errors displayed
- [ ] Form validation errors shown
- [ ] 404 for unknown routes (if implemented)

### Empty States
- [ ] No providers in marketplace
- [ ] No products in dashboard
- [ ] No reviews for provider
- [ ] No documents uploaded

### Limits
- [ ] File size limit enforced (10MB)
- [ ] Required documents checked
- [ ] Form field limits respected

## 🚀 Production Readiness

### Before Mainnet
- [ ] All tests passing
- [ ] No console warnings
- [ ] Environment variables secured
- [ ] API keys rotated (if needed)
- [ ] Database backed up
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Analytics implemented

### Documentation
- [ ] SETUP.md reviewed
- [ ] QUICK_START.md tested
- [ ] User guides created
- [ ] FAQ prepared
- [ ] Support contact ready

### Launch Prep
- [ ] Demo video updated
- [ ] Marketing materials ready
- [ ] Social media accounts set
- [ ] Initial providers contacted
- [ ] Support system in place

## 📊 Post-Launch Monitoring

### Week 1
- [ ] Daily error log review
- [ ] User feedback collection
- [ ] Performance monitoring
- [ ] Database query optimization
- [ ] Bug fixes prioritized

### Month 1
- [ ] User analytics review
- [ ] Feature usage data
- [ ] Conversion rates tracked
- [ ] Provider satisfaction survey
- [ ] Buyer satisfaction survey

## ✅ Final Checklist

- [ ] All functional tests passed
- [ ] All security checks passed
- [ ] All performance tests passed
- [ ] All documentation updated
- [ ] Team trained on platform
- [ ] Support processes documented
- [ ] Backup and recovery tested

---

## 🎯 Sign-Off

**Tested by:** _________________
**Date:** _________________
**Build Version:** _________________
**Status:** [ ] Ready for Production  [ ] Needs Work

**Notes:**
_______________________________________________
_______________________________________________
_______________________________________________
