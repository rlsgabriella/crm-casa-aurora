'use client'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`rounded-lg px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted/40 ${
          error
            ? 'border border-red-500/50 bg-red-950/20 focus:border-red-400'
            : 'border border-line bg-sidebar focus:border-accent'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
