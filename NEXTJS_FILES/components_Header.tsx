'use client';

import Link from 'next/link';
import PrivyLoginButton from './PrivyLoginButton';

export default function Header() {
  return (
    <header className="border-b border-gray-800 bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-[#d4af37]">Jews</span>
            <span className="text-white">.bet</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/markets/new"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Create Market
            </Link>
            <PrivyLoginButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
