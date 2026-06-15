export function Card({ children, header, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {header && (
        <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  )
}
