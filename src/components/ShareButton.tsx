'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-accent transition-colors text-sm"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          已复制
        </>
      ) : (
        <>
          <Link2 className="h-4 w-4" />
          复制链接
        </>
      )}
    </button>
  );
}
