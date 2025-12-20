'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Box,
  Layers,
  Network,
  Database,
  Terminal,
  UploadCloud,
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Namespaces', href: '/namespaces', icon: Layers },
  { name: 'Pods', href: '/pods', icon: Box },
  { name: 'Services', href: '/services', icon: Network },
  { name: 'Storage (PV/PVC)', href: '/storage', icon: Database },
  { name: 'Terminal', href: '/terminal', icon: Terminal },
  { name: 'Deploy Manifest', href: '/deploy', icon: UploadCloud },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/30">
      <div className="flex h-14 items-center border-b px-6 font-bold text-xl tracking-tight">
        KubeNexus
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
