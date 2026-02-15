'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, FileText, Settings, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Daftar Item', href: '/items', icon: Package },
    { name: 'Kasir / POS', href: '/sales', icon: ShoppingCart },
    { name: 'Riwayat Transaksi', href: '/sales/history', icon: Receipt },
    { name: 'Laporan', href: '/reports/inventory', icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-card/50 backdrop-blur-xl border-r border-border">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    NicoPOS
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                isActive
                                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            )}
                        >
                            <Icon className={cn('w-5 h-5', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-accent-foreground')} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-border">
                <button className="flex items-center gap-3 w-full px-4 py-3 text-muted-foreground hover:text-foreground transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Pengaturan</span>
                </button>
            </div>
        </div>
    );
}
