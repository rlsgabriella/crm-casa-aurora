const colorMap: Record<string, string> = {
  green:  'bg-emerald-900/40 text-emerald-400',
  yellow: 'bg-amber-900/40 text-amber-400',
  red:    'bg-red-900/40 text-red-400',
  gray:   'bg-white/5 text-muted',
  blue:   'bg-blue-900/40 text-blue-400',
  violet: 'bg-violet-900/40 text-violet-400',
}

interface BadgeProps {
  color?: string
  children: React.ReactNode
  className?: string
}

export function Badge({ color = 'gray', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        colorMap[color] || colorMap.gray
      } ${className}`}
    >
      {children}
    </span>
  )
}
