import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

export function Nav() {
  return (
    <nav className="flex items-center space-x-4">
      <Link
        href="/chat"
        className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Chat</span>
      </Link>
    </nav>
  );
} 