# Jews.bet - Next.js 14 Prediction Market

A production-ready prediction market platform built with Next.js 14, Privy authentication, and Supabase database.

## Features

- Privy authentication (Email, Twitter, Wallet)
- Automatic Solana wallet creation for each user
- Off-chain betting system with instant transactions
- Real-time market updates
- Prize pool distribution to winners
- Full ledger system for transaction history

## Tech Stack

- **Next.js 14** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Privy** for authentication
- **Supabase** for database
- **Solana Web3.js** for future on-chain features

## Quick Start

### 1. Create New Next.js Project

```bash
cd /tmp/cc-agent/60203748/
npx create-next-app@latest jews-bet --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd jews-bet
```

### 2. Install Dependencies

```bash
npm install @privy-io/react-auth @solana/web3.js@1.95.2
npm install @supabase/supabase-js
npm install date-fns
```

### 3. Copy Files

Copy all files from the `NEXTJS_FILES` directory to your new project:

```bash
# From the current directory
cp NEXTJS_FILES/lib_*.ts jews-bet/lib/
cp NEXTJS_FILES/components_*.tsx jews-bet/components/
cp NEXTJS_FILES/app_*.tsx jews-bet/app/
cp NEXTJS_FILES/app_api_*.ts jews-bet/app/api/
# ... and so on
```

File mapping:
- `lib_types.ts` → `lib/types.ts`
- `lib_supabase.ts` → `lib/supabase.ts`
- `lib_solana.ts` → `lib/solana.ts`
- `components_Header.tsx` → `components/Header.tsx`
- `components_PrivyLoginButton.tsx` → `components/PrivyLoginButton.tsx`
- `components_BalanceWidget.tsx` → `components/BalanceWidget.tsx`
- `components_MarketCard.tsx` → `components/MarketCard.tsx`
- `components_BetDialog.tsx` → `components/BetDialog.tsx`
- `app_layout.tsx` → `app/layout.tsx`
- `app_page.tsx` → `app/page.tsx`
- `app_providers.tsx` → `app/providers.tsx`
- `app_globals.css` → `app/globals.css`
- `app_markets_new_page.tsx` → `app/markets/new/page.tsx`
- `app_markets_[id]_page.tsx` → `app/markets/[id]/page.tsx`
- `app_api_bootstrap-user_route.ts` → `app/api/bootstrap-user/route.ts`
- `app_api_me_route.ts` → `app/api/me/route.ts`
- `app_api_fake-deposit_route.ts` → `app/api/fake-deposit/route.ts`
- `app_api_markets_route.ts` → `app/api/markets/route.ts`
- `app_api_markets_[id]_route.ts` → `app/api/markets/[id]/route.ts`
- `app_api_markets_[id]_resolve_route.ts` → `app/api/markets/[id]/resolve/route.ts`
- `app_api_bets_route.ts` → `app/api/bets/route.ts`
- `supabase_migration_ledger.sql` → Copy to Supabase dashboard

### 4. Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TREASURY_PUBLIC_KEY=your_treasury_public_key_here
```

**Get your credentials:**

1. **Privy App ID**: Sign up at [privy.io](https://privy.io) and create an app
2. **Supabase**: Use the existing Supabase instance from the current project
   - URL: From `.env` file in current project
   - Anon Key: From `.env` file in current project

### 5. Database Setup

The existing Supabase database already has most tables. You only need to add the ledger_entries table:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the migration from `supabase_migration_ledger.sql`

### 6. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
jews-bet/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Home page with market list
│   ├── providers.tsx           # Privy provider setup
│   ├── globals.css             # Global styles
│   ├── markets/
│   │   ├── new/
│   │   │   └── page.tsx        # Create new market
│   │   └── [id]/
│   │       └── page.tsx        # Market detail page
│   └── api/
│       ├── bootstrap-user/     # User registration
│       ├── me/                 # Get current user
│       ├── fake-deposit/       # Dev: add balance
│       ├── markets/            # Market CRUD
│       │   └── [id]/
│       │       ├── route.ts    # Get market details
│       │       └── resolve/    # Resolve market
│       └── bets/               # Place bets
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── PrivyLoginButton.tsx    # Login/logout button
│   ├── BalanceWidget.tsx       # User balance display
│   ├── MarketCard.tsx          # Market card component
│   └── BetDialog.tsx           # Bet placement dialog
└── lib/
    ├── types.ts                # TypeScript types
    ├── supabase.ts             # Supabase client
    └── solana.ts               # Solana helpers (stubs)
```

## How It Works

### 1. User Authentication

- Users log in with Privy (email, Twitter, or wallet)
- Privy automatically creates an embedded Solana wallet
- On first login, user data is saved to Supabase

### 2. Off-Chain Balances

- Each user has an off-chain balance stored in the database
- Use the "+1 SOL" button to add test balance (dev only)
- All betting happens off-chain for instant transactions

### 3. Creating Markets

- Navigate to `/markets/new`
- Enter a question, description, and close date
- Market is created with status "OPEN"

### 4. Placing Bets

- On any open market, click "Bet YES" or "Bet NO"
- Enter stake amount
- Stake is deducted from balance and added to prize pool
- Bet is recorded with status "ACTIVE"

### 5. Resolving Markets

- On the market detail page, use admin buttons to resolve
- Click "Resolve YES" or "Resolve NO"
- Winners receive payouts proportional to their stakes
- Formula: `(user_stake / total_winning_stakes) × prize_pool`

## API Routes

### POST /api/bootstrap-user
Creates or retrieves user on first login.

**Body:**
```json
{
  "privyUserId": "string",
  "email": "string",
  "walletAddress": "string"
}
```

### GET /api/me
Gets current user profile.

**Headers:**
```
x-privy-user-id: string
```

### POST /api/fake-deposit
Adds test balance (dev only).

**Body:**
```json
{
  "privyUserId": "string",
  "amount": number
}
```

### POST /api/markets
Creates a new market.

**Body:**
```json
{
  "privyUserId": "string",
  "question": "string",
  "description": "string",
  "closesAt": "ISO date string"
}
```

### GET /api/markets
Lists all open markets with stats.

### GET /api/markets/[id]
Gets market details and all bets.

### POST /api/markets/[id]/resolve
Resolves a market and distributes prizes.

**Body:**
```json
{
  "winningSide": "YES" | "NO"
}
```

### POST /api/bets
Places a bet on a market.

**Body:**
```json
{
  "privyUserId": "string",
  "marketId": "string",
  "side": "YES" | "NO",
  "stake": number
}
```

## Database Schema

### users
- id, privy_id, email, wallet_address, balance, username, created_at, updated_at

### events (markets)
- id, creator_id, title, description, prize_pool, winner_side, status, expires_at, created_at

### bets
- id, event_id, user_id, amount, prediction, status, created_at

### ledger_entries
- id, user_id, kind, amount, meta, created_at

## Future Enhancements

- Real Solana deposits/withdrawals (currently stubbed in `lib/solana.ts`)
- Market fees and platform revenue
- User profiles and statistics
- Market categories and search
- Real-time updates with Supabase subscriptions
- Admin dashboard for market management
- Dispute resolution system

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

MIT
