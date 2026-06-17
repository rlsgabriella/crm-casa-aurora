'use client'

interface Column {
  key: string
  label: string
  render?: (row: Record<string, any>) => React.ReactNode
}

interface TableProps {
  columns: Column[]
  rows: Record<string, any>[]
  onRowClick?: (row: Record<string, any>) => void
  emptyMessage?: string
}

interface PaginationProps {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function Table({ columns, rows, onRowClick, emptyMessage = 'Nenhum registro encontrado' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr style={{ borderBottom: '1px solid #2A1F1F' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-[10px] font-semibold text-muted uppercase tracking-widest whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-muted text-sm">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={row.id || i}
                onClick={() => onRowClick?.(row)}
                className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-sidebar' : ''}`}
                style={{ borderBottom: '1px solid rgba(42,31,31,0.5)' }}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-foreground">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit)
  if (totalPages <= 1) return null
  return (
    <div
      className="flex items-center justify-between px-4 py-3 text-sm text-muted"
      style={{ borderTop: '1px solid #2A1F1F' }}
    >
      <span>{total} registros</span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded border border-line text-foreground disabled:opacity-30 hover:bg-card transition-colors"
        >
          Anterior
        </button>
        <span className="px-3 py-1 text-muted">{page} / {totalPages}</span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1 rounded border border-line text-foreground disabled:opacity-30 hover:bg-card transition-colors"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
