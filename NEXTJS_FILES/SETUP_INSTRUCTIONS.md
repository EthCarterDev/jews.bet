# Complete Setup Instructions for Jews.bet Next.js App

## Step-by-Step Setup

### 1. Create Next.js Project

```bash
cd /tmp/cc-agent/60203748/
npx create-next-app@latest jews-bet --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

Answer the prompts:
- TypeScript? **Yes**
- ESLint? **Yes**
- Tailwind CSS? **Yes**
- `src/` directory? **No**
- App Router? **Yes**
- Import alias? **Yes** (@/*)

### 2. Navigate to Project

```bash
cd jews-bet
```

### 3. Install Dependencies

```bash
npm install @privy-io/react-auth@1.99.1 @solana/web3.js@1.95.2 @supabase/supabase-js@2.57.4 date-fns@3.0.0
```

### 4. Create Directory Structure

```bash
mkdir -p lib components app/markets/new app/markets/[id] app/api/bootstrap-user app/api/me app/api/fake-deposit app/api/markets app/api/markets/[id] app/api/markets/[id]/resolve app/api/bets
```

### 5. Copy Files (Manual Step)

Copy each file from the `NEXTJS_FILES` directory to the corresponding location in your `jews-bet` project:

**Library Files (lib/):**
- `lib_types.ts` → `lib/types.ts`
- `lib_supabase.ts` → `lib/supabase.ts`
- `lib_solana.ts` → `lib/solana.ts`

**Component Files (components/):**
- `components_Header.tsx` → `components/Header.tsx`
- `components_PrivyLoginButton.tsx` → `components/PrivyLoginButton.tsx`
- `components_BalanceWidget.tsx` → `components/BalanceWidget.tsx`
- `components_MarketCard.tsx` → `components/MarketCard.tsx`
- `components_BetDialog.tsx` → `components/BetDialog.tsx`

**App Files (app/):**
- `app_layout.tsx` → `app/layout.tsx`
- `app_page.tsx` → `app/page.tsx`
- `app_providers.tsx` → `app/providers.tsx`
- `app_globals.css` → `app/globals.css`

**Market Pages:**
- `app_markets_new_page.tsx` → `app/markets/new/page.tsx`
- `app_markets_[id]_page.tsx` → `app/markets/[id]/page.tsx`

**API Routes:**
- `app_api_bootstrap-user_route.ts` → `app/api/bootstrap-user/route.ts`
- `app_api_me_route.ts` → `app/api/me/route.ts`
- `app_api_fake-deposit_route.ts` → `app/api/fake-deposit/route.ts`
- `app_api_markets_route.ts` → `app/api/markets/route.ts`
- `app_api_markets_[id]_route.ts` → `app/api/markets/[id]/route.ts`
- `app_api_markets_[id]_resolve_route.ts` → `app/api/markets/[id]/resolve/route.ts`
- `app_api_bets_route.ts` → `app/api/bets/route.ts`

**Config Files (root):**
- Replace `tailwind.config.ts` with `tailwind.config.ts` from NEXTJS_FILES
- Replace `tsconfig.json` with `tsconfig.json` from NEXTJS_FILES
- Replace `next.config.mjs` with `next.config.mjs` from NEXTJS_FILES
- Replace `package.json` dependencies section with `package.json` from NEXTJS_FILES
- Copy `.gitignore` from NEXTJS_FILES

### 6. Setup Environment Variables

Create `.env.local` in the root:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PRIVY_APP_ID=
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
TREASURY_PUBLIC_KEY=
```

**Fill in the values:**

1. **NEXT_PUBLIC_PRIVY_APP_ID**:
   - Go to https://dashboard.privy.io/
   - Create a new app or use existing
   - Copy the App ID

2. **NEXT_PUBLIC_SUPABASE_URL** and **NEXT_PUBLIC_SUPABASE_ANON_KEY**:
   - Use values from the current project's `.env` file
   - Located at `/tmp/cc-agent/60203748/project/.env`

3. **TREASURY_PUBLIC_KEY**:
   - Use any Solana public key (for future use)
   - Or generate one at https://solscan.io/

### 7. Database Migration

Apply the ledger_entries migration:

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `supabase_migration_ledger.sql`
6. Click **Run**

### 8. Run the Application

```bash
npm run dev
```

Visit http://localhost:3000

## Testing the Application

### 1. Login
- Click the "Login" button in the header
- Choose email, Twitter, or wallet
- Complete the authentication flow

### 2. Add Test Balance
- After login, click the "+1 SOL" button next to your balance
- This adds 1 SOL to your account for testing

### 3. Create a Market
- Click "Create Market" in the header
- Fill in:
  - Question: "Will Bitcoin reach $100k by end of 2024?"
  - Description: Optional details
  - Closes At: Pick a future date/time
- Click "Create Market"

### 4. Place Bets
- Go back to the home page
- Find your market or any open market
- Click "Bet YES" or "Bet NO"
- Enter stake amount (e.g., 0.1)
- Click "Place Bet"

### 5. View Market Details
- Click on any market title
- See all bets and statistics
- View the prize pool

### 6. Resolve Market (Admin)
- On the market detail page
- Scroll to the admin section
- Click "Resolve YES" or "Resolve NO"
- Winners receive their payouts automatically

## Troubleshooting

### "NEXT_PUBLIC_PRIVY_APP_ID is not set"
- Make sure `.env.local` exists in the root directory
- Restart the dev server after adding environment variables

### "Failed to bootstrap user" or RLS errors
- Check that the Supabase migration was applied correctly
- Verify RLS policies are enabled on all tables

### "Module not found" errors
- Make sure all files are in the correct directories
- Run `npm install` again to ensure all dependencies are installed

### Privy login not working
- Verify your Privy App ID is correct
- Check that your app URL is whitelisted in Privy dashboard
- For localhost, add `http://localhost:3000` to allowed origins

## Next Steps

1. **Customize Branding**: Update colors in `tailwind.config.ts` and `app/globals.css`
2. **Add Real Deposits**: Implement Solana transactions in `lib/solana.ts`
3. **Deploy**: Deploy to Vercel or your preferred hosting platform
4. **Add Features**: User profiles, market categories, notifications, etc.

## File Checklist

Use this checklist to verify all files are copied:

- [ ] lib/types.ts
- [ ] lib/supabase.ts
- [ ] lib/solana.ts
- [ ] components/Header.tsx
- [ ] components/PrivyLoginButton.tsx
- [ ] components/BalanceWidget.tsx
- [ ] components/MarketCard.tsx
- [ ] components/BetDialog.tsx
- [ ] app/layout.tsx
- [ ] app/page.tsx
- [ ] app/providers.tsx
- [ ] app/globals.css
- [ ] app/markets/new/page.tsx
- [ ] app/markets/[id]/page.tsx
- [ ] app/api/bootstrap-user/route.ts
- [ ] app/api/me/route.ts
- [ ] app/api/fake-deposit/route.ts
- [ ] app/api/markets/route.ts
- [ ] app/api/markets/[id]/route.ts
- [ ] app/api/markets/[id]/resolve/route.ts
- [ ] app/api/bets/route.ts
- [ ] tailwind.config.ts
- [ ] tsconfig.json
- [ ] next.config.mjs
- [ ] .env.local (created, not copied)
- [ ] Supabase migration applied

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure the Supabase migration was applied
4. Check that all files are in the correct locations
