'use client'

import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  delta?: number
  icon: LucideIcon
  accentColor?: string
  loading?: boolean
}

export function StatCard({
  title,
  value,
  delta,
  icon: Icon,
  accentColor = '#C0603A',
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-line rounded-xl p-5 animate-pulse">
        <div className="h-3 w-20 bg-line rounded mb-5" />
        <div className="h-8 w-16 bg-line rounded mb-3" />
        <div className="h-2.5 w-28 bg-line rounded" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-line rounded-xl p-5 relative overflow-hidden">
      {/* Eyebrow */}
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted font-semibold mb-3">
        {title}
      </p>

      {/* Valor em Playfair Display */}
      <p className="font-display text-[2rem] font-semibold leading-none text-foreground mb-2">
        {value}
      </p>

      {/* Delta opcional */}
      {delta !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            delta >= 0 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(delta)}% vs ontem</span>
        </div>
      )}

      {/* Ícone de destaque */}
      <div
        className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center"
        style={{ background: `${accentColor}22`, color: accentColor }}
      >
        <Icon size={18} />
      </div>
    </div>
  )
}
