'use client'

export function Input({ label, error, id, className = '', ...props }) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`border rounded-lg px-3 py-2 text-sm text-gray-900 bg-white outline-none transition-colors
          ${error ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-100'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
