# Jews.bet - Next.js 14 Setup Guide

## Step 1: Create New Next.js Project

```bash
cd /tmp/cc-agent/60203748/
npx create-next-app@latest jews-bet --typescript --tailwind --app --no-src-dir --import-alias "@/*"
cd jews-bet
```

When prompted:
- TypeScript? Yes
- ESLint? Yes
- Tailwind CSS? Yes
- `src/` directory? No
- App Router? Yes
- Import alias? Yes (@/*)

## Step 2: Install Dependencies

```bash
npm install @privy-io/react-auth @solana/web3.js@1.95.2
npm install @supabase/supabase-js
npm install date-fns
npm install -D @types/node
```

## Step 3: Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TREASURY_PUBLIC_KEY=your_treasury_public_key_here
```

## Step 4: Supabase Database Setup

The database schema is already created in the current Supabase instance. You'll use the existing tables:
- `users` - user profiles with Solana wallets
- `events` (markets) - prediction markets
- `bets` - user bets on markets

Additional tables needed (see migration files below).

## Step 5: Copy Files

Copy all the files from the code blocks below into your new Next.js project.

## Step 6: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
jews-bet/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers.tsx
│   ├── markets/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── api/
│       ├── bootstrap-user/
│       │   └── route.ts
│       ├── me/
│       │   └── route.ts
│       ├── markets/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── resolve/
│       │           └── route.ts
│       ├── bets/
│       │   └── route.ts
│       └── fake-deposit/
│           └── route.ts
├── components/
│   ├── Header.tsx
│   ├── PrivyLoginButton.tsx
│   ├── BalanceWidget.tsx
│   ├── MarketCard.tsx
│   └── BetDialog.tsx
├── lib/
│   ├── supabase.ts
│   ├── solana.ts
│   └── types.ts
└── supabase/
    └── migrations/
        └── 20251115200000_add_ledger.sql
```

## Files to Create

See code blocks below for each file's content.
