# Jews.bet - Quick Start Guide

## 5-Minute Setup

### Step 1: Create Project (2 min)

```bash
cd /tmp/cc-agent/60203748/
npx create-next-app@latest jews-bet --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd jews-bet
npm install @privy-io/react-auth @solana/web3.js@1.95.2 @supabase/supabase-js date-fns
```

### Step 2: Copy Files (1 min)

See `FILE_MAPPING.md` for exact file locations.

Quick copy (if on Linux/Mac):
```bash
# From jews-bet directory
mkdir -p lib components app/markets/new app/markets/[id]
mkdir -p app/api/bootstrap-user app/api/me app/api/fake-deposit app/api/bets
mkdir -p app/api/markets/[id]/resolve

# Use the copy commands from FILE_MAPPING.md
```

### Step 3: Environment Setup (1 min)

Create `.env.local`:
```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
TREASURY_PUBLIC_KEY=any_solana_pubkey
```

### Step 4: Database Migration (30 sec)

1. Open Supabase dashboard
2. SQL Editor → Run `supabase_migration_ledger.sql`

### Step 5: Run (30 sec)

```bash
npm run dev
```

Visit http://localhost:3000

## Essential Files

### Must Have (23 files):

**Library (3):**
- `lib/types.ts`
- `lib/supabase.ts`
- `lib/solana.ts`

**Components (5):**
- `components/Header.tsx`
- `components/PrivyLoginButton.tsx`
- `components/BalanceWidget.tsx`
- `components/MarketCard.tsx`
- `components/BetDialog.tsx`

**App Pages (6):**
- `app/layout.tsx`
- `app/page.tsx`
- `app/providers.tsx`
- `app/globals.css`
- `app/markets/new/page.tsx`
- `app/markets/[id]/page.tsx`

**API Routes (7):**
- `app/api/bootstrap-user/route.ts`
- `app/api/me/route.ts`
- `app/api/fake-deposit/route.ts`
- `app/api/markets/route.ts`
- `app/api/markets/[id]/route.ts`
- `app/api/markets/[id]/resolve/route.ts`
- `app/api/bets/route.ts`

**Config (2):**
- `tailwind.config.ts`
- `.env.local`

## Test Flow

1. **Login**: Click "Login" → Choose auth method
2. **Add Balance**: Click "+1 SOL" button
3. **Create Market**: "Create Market" → Fill form
4. **Place Bet**: Home → Click "Bet YES/NO" → Enter amount
5. **View Details**: Click market title
6. **Resolve**: Market detail page → "Resolve YES/NO"

## Get Credentials

### Privy App ID
1. Go to https://dashboard.privy.io/
2. Create app
3. Copy App ID

### Supabase
Use existing credentials from:
`/tmp/cc-agent/60203748/project/.env`

## Troubleshooting

| Error | Solution |
|-------|----------|
| Module not found | Check file is in correct location |
| 404 on API routes | Ensure files named `route.ts` |
| Privy error | Check App ID and restart server |
| RLS error | Apply database migration |

## Architecture

```
User Login (Privy)
    ↓
Bootstrap User → Supabase
    ↓
Off-chain Balance
    ↓
Create/Join Markets → Place Bets
    ↓
Resolve Market → Distribute Prizes
    ↓
Ledger Tracking
```

## Key Features

✅ Privy auth with embedded Solana wallets
✅ Off-chain balances for instant transactions
✅ YES/NO prediction markets
✅ Pro-rata prize distribution
✅ Full transaction ledger
✅ Dev deposit button for testing

## Next Steps

1. Customize branding in `tailwind.config.ts`
2. Add real Solana transactions in `lib/solana.ts`
3. Deploy to Vercel
4. Add market categories, user profiles, etc.

## File Structure at a Glance

```
jews-bet/
├── lib/              # Core logic & types
├── components/       # React components
├── app/
│   ├── api/          # API endpoints
│   ├── markets/      # Market pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── providers.tsx # Privy setup
└── .env.local        # Config
```

## Support

- Full docs: `README.md`
- Setup guide: `SETUP_INSTRUCTIONS.md`
- File mapping: `FILE_MAPPING.md`

---

**Ready to build prediction markets? Let's go! 🚀**
