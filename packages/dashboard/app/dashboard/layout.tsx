'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser, UserButton } from '@clerk/nextjs'
import {
  LayoutDashboard, Users, Calendar, Armchair, MessageSquare,
  ShoppingCart, Package, DollarSign, UserCog,
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',            icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/clientes',   icon: Users,           label: 'Clientes' },
  { href: '/dashboard/reservas',   icon: Calendar,        label: 'Reservas' },
  { href: '/dashboard/mesas',      icon: Armchair,        label: 'Mesas' },
  { href: '/dashboard/atendimento',icon: MessageSquare,   label: 'Atendimento' },
  { href: '/dashboard/pedidos',    icon: ShoppingCart,    label: 'Pedidos' },
  { href: '/dashboard/estoque',    icon: Package,         label: 'Estoque' },
  { href: '/dashboard/financeiro', icon: DollarSign,      label: 'Financeiro' },
  { href: '/dashboard/equipe',     icon: UserCog,         label: 'Equipe' },
]

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  gerente: 'Gerente',
  garcom: 'Garçom',
  atendente: 'Atendente',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const pathname = usePathname()
  const role = user?.publicMetadata?.role as string | undefined

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className="w-60 flex flex-col shrink-0"
        style={{ background: '#1A1010', borderRight: '1px solid rgba(201,168,76,0.18)' }}
      >
        {/* Logo */}
        <div className="px-5 pt-7 pb-5">
          <p className="font-display text-[1.4rem] font-semibold text-foreground leading-snug tracking-wide">
            Casa Aurora
          </p>
          <p className="text-[9px] uppercase tracking-[0.28em] text-accent font-semibold mt-1">
            Admin
          </p>
        </div>

        {/* Separador dourado */}
        <div className="mx-5 h-px" style={{ background: 'rgba(201,168,76,0.22)' }} />

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive =
              href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname?.startsWith(href) ?? false

            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-card'
                }`}
                style={isActive ? { background: '#2A1510' } : undefined}
              >
                {/* Barra lateral ativa */}
                {isActive && (
                  <span
                    className="absolute left-0 inset-y-1.5 w-[3px] rounded-r-full"
                    style={{ background: '#C0603A' }}
                  />
                )}
                <Icon size={17} className={isActive ? 'text-accent' : ''} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Rodapé — usuário */}
        <div
          className="px-4 py-4 flex items-center gap-3"
          style={{ borderTop: '1px solid #2A1F1F' }}
        >
          <UserButton appearance={{ elements: { avatarBox: 'w-8 h-8' } }} />
          <div className="min-w-0 flex-1">
            <p className="text-foreground text-sm font-medium truncate leading-tight">
              {user?.firstName || 'Usuário'}
            </p>
            {role && (
              <span
                className="inline-block text-[9px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded font-semibold mt-0.5"
                style={{ background: 'rgba(123,31,58,0.28)', color: '#C0603A' }}
              >
                {roleLabels[role] || role}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-y-auto p-6 bg-bg">
        {children}
      </main>
    </div>
  )
}
