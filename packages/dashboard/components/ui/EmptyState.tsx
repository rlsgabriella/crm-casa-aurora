import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {Icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(192,96,58,0.12)', color: '#C0603A' }}
        >
          <Icon size={26} />
        </div>
      )}
      <div>
        <p className="font-semibold text-foreground text-base">{title}</p>
        {description && (
          <p className="text-sm text-muted mt-1 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
