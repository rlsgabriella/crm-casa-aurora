export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      {Icon && (
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
          <Icon size={28} />
        </div>
      )}
      <div>
        <p className="font-semibold text-gray-700 text-base">{title}</p>
        {description && <p className="text-sm text-gray-400 mt-1 max-w-xs">{description}</p>}
      </div>
      {action}
    </div>
  )
}
