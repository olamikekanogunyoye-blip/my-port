/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Filmic 404 Not Found Page
 */

import React from 'react';
import { KeyLogo } from '../components/ui/KeyLogo';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0B0C] text-[#F1EEE6] flex flex-col justify-between p-6 sm:p-12">
      <header>
        <KeyLogo size="md" />
      </header>

      <main className="max-w-2xl my-auto py-12">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#C9A24D] mb-4">
          Error 404 // Reel Missing
        </p>
        <h1 className="font-h1 font-bold text-[#F1EEE6] mb-6">
          SCENE NOT FOUND
        </h1>
        <p className="text-base sm:text-lg text-[#8A877F] leading-relaxed mb-8 max-w-lg">
          The sequence you requested does not exist or has been cut from the final reel.
        </p>
        <Button variant="primary" size="md" href="/" icon={<ArrowLeft size={16} />} iconPosition="left">
          Return to Beginning
        </Button>
      </main>

      <footer className="border-t border-[rgba(241,238,230,0.08)] pt-6 font-mono text-[11px] text-[#8A877F] flex justify-between items-center">
        <span>KEY OF DAVID</span>
        <span>CODE: 404_NOT_FOUND</span>
      </footer>
    </div>
  );
}
