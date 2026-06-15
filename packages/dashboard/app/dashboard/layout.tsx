'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard, Users, Calendar, Armchair, MessageSquare,
  ShoppingCart, Package, DollarSign, UserCog, UtensilsCrossed,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/clientes', icon: Users, label: 'Clientes' },
  { href: '/dashboard/reservas', icon: Calendar, label: 'Reservas' },
  { href: '/dashboard/mesas', icon: Armchair, label: 'Mesas' },
  { href: '/dashboard/atendimento', icon: MessageSquare, label: 'Atendimento' },
  { href: '/dashboard/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/dashboard/estoque', icon: Package, label: 'Estoque' },
  { href: '/dashboard/financeiro', icon: DollarSign, label: 'Financeiro' },
  { href: '/dashboard/equipe', icon: UserCog, label: 'Equipe' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const pathname = usePathname()

  const pageTitle = navItems.find(item =>
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname?.startsWith(item.href) ?? false
  )?.label ?? 'CRM'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col bg-gray-900 text-gray-300 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-800">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <UtensilsCrossed size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">CRM Restaurante</p>
            <p className="text-gray-500 text-xs">Painel interno</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname?.startsWith(href) ?? false
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-700 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-800 flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.firstName || 'Usuário'}</p>
            <p className="text-gray-500 text-xs truncate">{user?.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>CRM</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">{pageTitle}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
