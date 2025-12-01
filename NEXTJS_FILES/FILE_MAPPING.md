# File Mapping Guide

This document shows exactly where each file should be copied in your Next.js project.

## Directory Structure

```
jews-bet/
├── .env.local                          (create from .env.local.example)
├── .gitignore                          ← .gitignore
├── next.config.mjs                     ← next.config.mjs
├── package.json                        ← package.json (merge dependencies)
├── tailwind.config.ts                  ← tailwind.config.ts
├── tsconfig.json                       ← tsconfig.json
├── README.md                           ← README.md
├── app/
│   ├── globals.css                     ← app_globals.css
│   ├── layout.tsx                      ← app_layout.tsx
│   ├── page.tsx                        ← app_page.tsx
│   ├── providers.tsx                   ← app_providers.tsx
│   ├── api/
│   │   ├── bootstrap-user/
│   │   │   └── route.ts                ← app_api_bootstrap-user_route.ts
│   │   ├── me/
│   │   │   └── route.ts                ← app_api_me_route.ts
│   │   ├── fake-deposit/
│   │   │   └── route.ts                ← app_api_fake-deposit_route.ts
│   │   ├── bets/
│   │   │   └── route.ts                ← app_api_bets_route.ts
│   │   └── markets/
│   │       ├── route.ts                ← app_api_markets_route.ts
│   │       └── [id]/
│   │           ├── route.ts            ← app_api_markets_[id]_route.ts
│   │           └── resolve/
│   │               └── route.ts        ← app_api_markets_[id]_resolve_route.ts
│   └── markets/
│       ├── new/
│       │   └── page.tsx                ← app_markets_new_page.tsx
│       └── [id]/
│           └── page.tsx                ← app_markets_[id]_page.tsx
├── components/
│   ├── Header.tsx                      ← components_Header.tsx
│   ├── PrivyLoginButton.tsx            ← components_PrivyLoginButton.tsx
│   ├── BalanceWidget.tsx               ← components_BalanceWidget.tsx
│   ├── MarketCard.tsx                  ← components_MarketCard.tsx
│   └── BetDialog.tsx                   ← components_BetDialog.tsx
└── lib/
    ├── types.ts                        ← lib_types.ts
    ├── supabase.ts                     ← lib_supabase.ts
    └── solana.ts                       ← lib_solana.ts
```

## Copy Commands

If you're on Linux/Mac, you can use these commands from the NEXTJS_FILES directory:

```bash
# Navigate to your new project
cd /tmp/cc-agent/60203748/jews-bet

# Create directories
mkdir -p lib components
mkdir -p app/api/bootstrap-user app/api/me app/api/fake-deposit app/api/bets
mkdir -p app/api/markets/[id]/resolve
mkdir -p app/markets/new app/markets/[id]

# Copy lib files
cp ../project/NEXTJS_FILES/lib_types.ts lib/types.ts
cp ../project/NEXTJS_FILES/lib_supabase.ts lib/supabase.ts
cp ../project/NEXTJS_FILES/lib_solana.ts lib/solana.ts

# Copy component files
cp ../project/NEXTJS_FILES/components_Header.tsx components/Header.tsx
cp ../project/NEXTJS_FILES/components_PrivyLoginButton.tsx components/PrivyLoginButton.tsx
cp ../project/NEXTJS_FILES/components_BalanceWidget.tsx components/BalanceWidget.tsx
cp ../project/NEXTJS_FILES/components_MarketCard.tsx components/MarketCard.tsx
cp ../project/NEXTJS_FILES/components_BetDialog.tsx components/BetDialog.tsx

# Copy app files
cp ../project/NEXTJS_FILES/app_layout.tsx app/layout.tsx
cp ../project/NEXTJS_FILES/app_page.tsx app/page.tsx
cp ../project/NEXTJS_FILES/app_providers.tsx app/providers.tsx
cp ../project/NEXTJS_FILES/app_globals.css app/globals.css

# Copy market pages
cp ../project/NEXTJS_FILES/app_markets_new_page.tsx app/markets/new/page.tsx
cp ../project/NEXTJS_FILES/app_markets_[id]_page.tsx app/markets/[id]/page.tsx

# Copy API routes
cp ../project/NEXTJS_FILES/app_api_bootstrap-user_route.ts app/api/bootstrap-user/route.ts
cp ../project/NEXTJS_FILES/app_api_me_route.ts app/api/me/route.ts
cp ../project/NEXTJS_FILES/app_api_fake-deposit_route.ts app/api/fake-deposit/route.ts
cp ../project/NEXTJS_FILES/app_api_bets_route.ts app/api/bets/route.ts
cp ../project/NEXTJS_FILES/app_api_markets_route.ts app/api/markets/route.ts
cp ../project/NEXTJS_FILES/app_api_markets_[id]_route.ts app/api/markets/[id]/route.ts
cp ../project/NEXTJS_FILES/app_api_markets_[id]_resolve_route.ts app/api/markets/[id]/resolve/route.ts

# Copy config files
cp ../project/NEXTJS_FILES/tailwind.config.ts tailwind.config.ts
cp ../project/NEXTJS_FILES/tsconfig.json tsconfig.json
cp ../project/NEXTJS_FILES/next.config.mjs next.config.mjs
cp ../project/NEXTJS_FILES/.gitignore .gitignore
cp ../project/NEXTJS_FILES/README.md README.md

# Create .env.local from example
cp ../project/NEXTJS_FILES/.env.local.example .env.local
```

## Manual Steps After Copying

### 1. Edit package.json

Open `package.json` and update the dependencies section to match:

```json
{
  "dependencies": {
    "@privy-io/react-auth": "^1.99.1",
    "@solana/web3.js": "^1.95.2",
    "@supabase/supabase-js": "^2.57.4",
    "date-fns": "^3.0.0",
    "next": "14.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

Then run:
```bash
npm install
```

### 2. Edit .env.local

Open `.env.local` and fill in your actual values:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRIVY_APP_ID=clxyz123...          # From Privy dashboard
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...        # From Supabase dashboard
TREASURY_PUBLIC_KEY=SoLxxx...                  # Any Solana public key
```

### 3. Apply Database Migration

1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy contents of `supabase_migration_ledger.sql`
4. Run the query

### 4. Run the App

```bash
npm run dev
```

## Verification Checklist

After copying all files, verify:

- [ ] All 32 files are in the correct locations
- [ ] No TypeScript errors when running `npm run dev`
- [ ] `.env.local` exists and has all required values
- [ ] Can access http://localhost:3000
- [ ] Login button appears in the header
- [ ] Database migration has been applied

## Common Issues

### Issue: "Cannot find module '@/lib/types'"
**Solution:** Make sure the file is at `lib/types.ts` (not `lib_types.ts`)

### Issue: "Route handlers must be placed in the route handler folder"
**Solution:** API routes must be named `route.ts`, not `route.tsx`

### Issue: API routes return 404
**Solution:** Check that API route files are in the correct nested folders

### Issue: "Module not found: Can't resolve 'date-fns'"
**Solution:** Run `npm install date-fns`

### Issue: Environment variables not loading
**Solution:**
1. Restart the dev server
2. Make sure `.env.local` is in the root directory
3. Variables must start with `NEXT_PUBLIC_` for client-side access

## File Count Summary

- **3** lib files
- **5** component files
- **4** app root files
- **2** market page files
- **7** API route files
- **6** config files
- **4** documentation files

**Total: 31 files**

Plus the Supabase migration SQL file to be applied manually.
