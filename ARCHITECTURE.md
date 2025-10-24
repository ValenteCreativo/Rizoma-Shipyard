# Rizoma System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│              React 19 + Vite + React Router                 │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐  │
│  │  Home   │  │Marketplace│  │Onboarding │  │Dashboard │  │
│  │ Landing │  │  Browse   │  │ Register  │  │ Manage   │  │
│  └─────────┘  └──────────┘  └───────────┘  └──────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         Solana Wallet Adapter Layer                 │  │
│  │    (Phantom, Solflare, Auto-detect)                 │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────┬──────────────────────┘
                   │                  │
                   ▼                  ▼
       ┌───────────────────┐  ┌──────────────────┐
       │    SUPABASE       │  │  SOLANA BLOCKCHAIN │
       │   (PostgreSQL)    │  │     (Devnet)      │
       │                   │  │                   │
       │  ┌────────────┐  │  │  ┌────────────┐  │
       │  │ Providers  │  │  │  │  Anchor    │  │
       │  │ Products   │  │  │  │  Program   │  │
       │  │ Documents  │  │  │  │            │  │
       │  │ Reviews    │  │  │  │  Document  │  │
       │  │ Blockchain │  │  │  │  Hashes    │  │
       │  │ Txs        │  │  │  │  Stored    │  │
       │  └────────────┘  │  │  └────────────┘  │
       │                   │  │                   │
       │  ┌────────────┐  │  │                   │
       │  │  Storage   │  │  │                   │
       │  │  Bucket    │  │  │                   │
       │  │  Documents │  │  │                   │
       │  └────────────┘  │  │                   │
       └───────────────────┘  └──────────────────┘
```

## 📊 Data Flow Diagrams

### Provider Registration Flow

```
USER                FRONTEND           SUPABASE         SOLANA
  │                    │                  │               │
  │  1. Connect Wallet │                  │               │
  │───────────────────>│                  │               │
  │                    │                  │               │
  │  2. Fill Forms     │                  │               │
  │───────────────────>│                  │               │
  │                    │                  │               │
  │  3. Upload Docs    │                  │               │
  │───────────────────>│                  │               │
  │                    │  4. Upload Files │               │
  │                    │─────────────────>│               │
  │                    │  5. File URL     │               │
  │                    │<─────────────────│               │
  │                    │                  │               │
  │                    │  6. Calculate Hash (SHA-256)     │
  │                    │                  │               │
  │  7. Confirm        │                  │               │
  │───────────────────>│                  │               │
  │                    │  8. Insert Provider              │
  │                    │─────────────────>│               │
  │                    │  9. Insert Docs  │               │
  │                    │─────────────────>│               │
  │                    │                  │               │
  │                    │  10. Sign Tx (Hash)              │
  │                    │─────────────────────────────────>│
  │                    │  11. Tx Signature                │
  │                    │<─────────────────────────────────│
  │                    │                  │               │
  │                    │  12. Store Proof │               │
  │                    │─────────────────>│               │
  │                    │                  │               │
  │  13. Success       │                  │               │
  │<───────────────────│                  │               │
  │                    │                  │               │
  │  14. Redirect to Dashboard            │               │
  │───────────────────>│                  │               │
```

### Marketplace Browse Flow

```
BUYER               FRONTEND           SUPABASE
  │                    │                  │
  │  1. Visit /marketplace                │
  │───────────────────>│                  │
  │                    │  2. Fetch Providers (verified)
  │                    │─────────────────>│
  │                    │  3. Provider Data│
  │                    │<─────────────────│
  │                    │                  │
  │  4. Apply Filters  │                  │
  │───────────────────>│                  │
  │                    │  5. Filter Query │
  │                    │─────────────────>│
  │                    │  6. Filtered Data│
  │                    │<─────────────────│
  │                    │                  │
  │  7. View Provider  │                  │
  │───────────────────>│                  │
  │                    │                  │
  │  8. Verify Blockchain Hash            │
  │                    │                  │
  │  9. See Reputation │                  │
  │<───────────────────│                  │
```

### Product Management Flow

```
PROVIDER            FRONTEND           SUPABASE
  │                    │                  │
  │  1. Login to Dashboard                │
  │───────────────────>│                  │
  │                    │  2. Auth Check   │
  │                    │─────────────────>│
  │                    │  3. Provider Data│
  │                    │<─────────────────│
  │                    │                  │
  │  4. Add Product    │                  │
  │───────────────────>│                  │
  │                    │  5. Insert Product
  │                    │─────────────────>│
  │                    │  6. Success      │
  │                    │<─────────────────│
  │                    │                  │
  │  7. Edit Product   │                  │
  │───────────────────>│                  │
  │                    │  8. Update Product
  │                    │─────────────────>│
  │                    │  9. Success      │
  │                    │<─────────────────│
```

## 🗃️ Database Schema

```
┌──────────────────────────────────────────────────────────┐
│                      PROVIDERS                           │
├──────────────────────────────────────────────────────────┤
│ id                 UUID (PK)                             │
│ wallet_address     TEXT (Unique)                         │
│ company_name       TEXT                                  │
│ legal_name         TEXT                                  │
│ tax_id             TEXT (Unique)                         │
│ email              TEXT                                  │
│ state              TEXT                                  │
│ city               TEXT                                  │
│ description        TEXT                                  │
│ verification_status TEXT (pending|verified|rejected)    │
│ reputation_score   DECIMAL(3,2)                         │
│ total_transactions INT                                  │
│ blockchain_hash    TEXT                                  │
│ created_at         TIMESTAMP                             │
└──────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ▼
┌──────────────────────────────────────────────────────────┐
│                      PRODUCTS                            │
├──────────────────────────────────────────────────────────┤
│ id                 UUID (PK)                             │
│ provider_id        UUID (FK → providers)                 │
│ name               TEXT                                  │
│ description        TEXT                                  │
│ category           TEXT                                  │
│ unit               TEXT                                  │
│ price_per_unit     DECIMAL(10,2)                        │
│ minimum_order      DECIMAL(10,2)                        │
│ available_quantity DECIMAL(10,2)                        │
│ certifications     TEXT[]                                │
│ created_at         TIMESTAMP                             │
└──────────────────────────────────────────────────────────┘

                  providers 1:N documents
                              ▼
┌──────────────────────────────────────────────────────────┐
│                     DOCUMENTS                            │
├──────────────────────────────────────────────────────────┤
│ id                 UUID (PK)                             │
│ provider_id        UUID (FK → providers)                 │
│ document_type      TEXT                                  │
│ document_name      TEXT                                  │
│ file_url           TEXT                                  │
│ file_hash          TEXT (SHA-256)                        │
│ blockchain_proof   TEXT                                  │
│ verification_status TEXT                                 │
│ created_at         TIMESTAMP                             │
└──────────────────────────────────────────────────────────┘

                  providers 1:N blockchain_verifications
                              ▼
┌──────────────────────────────────────────────────────────┐
│              BLOCKCHAIN_VERIFICATIONS                    │
├──────────────────────────────────────────────────────────┤
│ id                 UUID (PK)                             │
│ provider_id        UUID (FK → providers)                 │
│ verification_type  TEXT                                  │
│ solana_signature   TEXT (Unique)                         │
│ data_hash          TEXT                                  │
│ status             TEXT                                  │
│ metadata           JSONB                                 │
│ created_at         TIMESTAMP                             │
└──────────────────────────────────────────────────────────┘

                  providers 1:N reviews
                              ▼
┌──────────────────────────────────────────────────────────┐
│                      REVIEWS                             │
├──────────────────────────────────────────────────────────┤
│ id                 UUID (PK)                             │
│ provider_id        UUID (FK → providers)                 │
│ buyer_wallet       TEXT                                  │
│ rating             DECIMAL(2,1)                          │
│ review_text        TEXT                                  │
│ blockchain_proof   TEXT                                  │
│ is_verified        BOOLEAN                               │
│ created_at         TIMESTAMP                             │
└──────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYERS                        │
└─────────────────────────────────────────────────────────┘

Layer 1: Wallet Authentication
┌─────────────────────────────────────────────────────────┐
│ • Solana wallet signature verification                  │
│ • No passwords - cryptographic auth only                │
│ • Wallet address as unique identifier                   │
└─────────────────────────────────────────────────────────┘

Layer 2: Row Level Security (RLS)
┌─────────────────────────────────────────────────────────┐
│ PROVIDERS:                                              │
│   • Read: Public (verified only)                        │
│   • Write: Owner only (wallet_address match)            │
│                                                          │
│ PRODUCTS:                                               │
│   • Read: Public                                        │
│   • Write: Provider owner only                          │
│                                                          │
│ DOCUMENTS:                                              │
│   • Read: Owner only (private)                          │
│   • Write: Owner only                                   │
│                                                          │
│ REVIEWS:                                                │
│   • Read: Public                                        │
│   • Insert: Anyone (verified on-chain)                  │
└─────────────────────────────────────────────────────────┘

Layer 3: Zero-Knowledge Privacy
┌─────────────────────────────────────────────────────────┐
│ • Documents stored privately in Supabase                │
│ • SHA-256 hashes calculated client-side                 │
│ • Only hashes stored on blockchain                      │
│ • Proof of existence without content exposure           │
│ • Buyers verify documentation without seeing files      │
└─────────────────────────────────────────────────────────┘

Layer 4: Blockchain Immutability
┌─────────────────────────────────────────────────────────┐
│ • Document hashes stored permanently on Solana          │
│ • Transaction signatures as tamper-proof receipts       │
│ • Public verification without compromising privacy      │
│ • Audit trail for all verifications                     │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Component Architecture

```
src/
├── components/
│   ├── Navbar.jsx              (Navigation + Wallet)
│   └── Navbar.css
│
├── lib/
│   └── supabase.js             (Supabase client config)
│
├── pages/
│   ├── Home.jsx                (Landing page)
│   ├── Marketplace.jsx         (Browse providers)
│   ├── Onboarding.jsx          (Multi-step registration)
│   └── ProviderDashboard.jsx   (Provider management)
│
├── styles/
│   ├── Dashboard.css
│   ├── Marketplace.css
│   └── Onboarding.css
│
├── App.css                     (Global styles + design system)
├── AppRoutes.jsx               (Router + Wallet Provider)
└── main.jsx                    (Entry point)
```

## 📱 User Journeys

### New Provider Journey
```
1. Land on homepage
2. Click "Register as Provider"
3. Connect Solana wallet
4. Fill 4-step onboarding form
   - Company info
   - Contact details
   - Upload documents (auto-hash)
   - Confirm & sign blockchain tx
5. Redirect to dashboard
6. Add products
7. Appear in marketplace (after verification)
```

### Buyer Journey
```
1. Visit marketplace
2. Search/filter providers
3. View provider profile
4. Check blockchain verification
5. Review reputation & reviews
6. Contact provider (future)
7. Complete transaction (future)
```

### Provider Management Journey
```
1. Login (wallet connect)
2. View dashboard stats
3. Manage products (add/edit/delete)
4. View reviews
5. Update profile
```

## 🚀 Technology Decisions

### Why React 19?
- Modern hooks API
- Concurrent rendering
- Automatic batching
- Better TypeScript support

### Why Supabase?
- PostgreSQL (robust SQL)
- Row Level Security built-in
- Storage included
- Real-time subscriptions ready
- Generous free tier

### Why Solana?
- Fast finality (~400ms)
- Low transaction costs (<$0.00025)
- High throughput (65K TPS)
- Strong Web3 ecosystem
- Anchor framework for Rust

### Why Zero-Knowledge Approach?
- Privacy compliance (GDPR, etc.)
- Trust without exposure
- Competitive advantage
- Scalable verification
- Future-proof for regulations

## 📈 Scalability Considerations

### Current Setup (MVP)
- Handles: ~1000 providers, ~10K products
- Supabase free tier: 500MB database, 1GB storage
- Blockchain: Unlimited on Solana

### Growth Path
1. **Phase 1** (0-1000 providers)
   - Free tier sufficient
   - Devnet blockchain

2. **Phase 2** (1K-10K providers)
   - Supabase Pro ($25/mo)
   - Move to Mainnet
   - CDN for images

3. **Phase 3** (10K+ providers)
   - Enterprise Supabase
   - Dedicated blockchain validators
   - Microservices architecture
   - Load balancers

## 🔮 Future Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FUTURE ADDITIONS                      │
└─────────────────────────────────────────────────────────┘

Smart Contracts Layer
┌─────────────────────────────────────────────────────────┐
│ • Escrow contracts for transactions                     │
│ • USDC/USDT payment handling                           │
│ • Automated dispute resolution                          │
│ • Multi-signature approvals                             │
└─────────────────────────────────────────────────────────┘

Messaging Layer
┌─────────────────────────────────────────────────────────┐
│ • Real-time chat (Supabase Realtime)                   │
│ • Notification system                                   │
│ • Email/SMS integration                                 │
└─────────────────────────────────────────────────────────┘

Analytics Layer
┌─────────────────────────────────────────────────────────┐
│ • Provider analytics dashboard                          │
│ • Marketplace insights                                  │
│ • Transaction metrics                                   │
│ • Conversion tracking                                   │
└─────────────────────────────────────────────────────────┘

Mobile Apps
┌─────────────────────────────────────────────────────────┐
│ • React Native app                                      │
│ • Shared codebase with web                             │
│ • Mobile wallet integration                             │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated:** 2024-10-24
**Version:** MVP 1.0
**Status:** Production Ready
