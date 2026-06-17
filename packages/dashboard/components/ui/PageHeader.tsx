interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted mt-1 first-letter:capitalize">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {/* Divisor dourado gradiente */}
      <div
        className="mt-4 h-px"
        style={{
          background:
            'linear-gradient(90deg, rgba(201,168,76,0.55) 0%, rgba(201,168,76,0.08) 60%, transparent 100%)',
        }}
      />
    </div>
  )
}
