interface CardProps {
  children: React.ReactNode
  header?: React.ReactNode
  className?: string
}

export function Card({ children, header, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border ${className}`}
      style={{ background: '#1F1515', borderColor: '#2A1F1F' }}
    >
      {header && (
        <div
          className="px-5 py-4 text-[10px] uppercase tracking-[0.18em] text-muted font-semibold"
          style={{ borderBottom: '1px solid #2A1F1F' }}
        >
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
