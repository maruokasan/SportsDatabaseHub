// src/components/ui/DataTable.jsx
import { Search } from 'lucide-react';
import SkeletonBlock from './SkeletonBlock';

export default function DataTable({
  title = 'Data Table',
  columns = [],
  rows = [],
  isLoading,
  searchPlaceholder = 'Search table…',
  onSearch,
  emptyState = 'No rows found.'
}) {
  return (
    <section className="rounded-panel border border-shell-border bg-shell-surface p-5 shadow-panel">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-lg">{title}</h3>
        {onSearch ? (
          <label className="flex items-center gap-2 rounded-full border border-shell-border bg-shell-raised px-3 py-1.5 text-sm text-text-muted focus-within:border-accent">
            <Search size={16} />
            <input
              type="search"
              placeholder={searchPlaceholder}
              onChange={(event) => onSearch?.(event.target.value)}
              className="bg-transparent text-text-primary focus-visible:outline-none"
            />
          </label>
        ) : null}
      </div>

      <div className="hidden max-h-[420px] overflow-auto rounded-panel border border-shell-border lg:block">
        <table className="min-w-full divide-y divide-shell-border text-sm">
          <thead className="bg-shell-raised/40 text-xs uppercase tracking-[0.2em] text-text-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 text-left font-medium ${column.align === 'right' ? 'text-right' : 'text-left'} ${
                    column.pinned ? 'sticky left-0 bg-shell-raised/80 backdrop-blur' : ''
                  }`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-shell-border/60 text-text-primary">
            {isLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="odd:bg-shell-surface even:bg-shell-raised/20">
                    <td colSpan={columns.length} className="px-4 py-4">
                      <SkeletonBlock height={16} />
                    </td>
                  </tr>
                ))
              : null}

            {!isLoading && !rows.length ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-text-muted">
                  {emptyState}
                </td>
              </tr>
            ) : null}

            {!isLoading &&
              rows.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex} className="odd:bg-shell-surface even:bg-shell-raised/10">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-4 text-sm ${column.align === 'right' ? 'text-right' : 'text-left'} ${
                        column.pinned ? 'sticky left-0 bg-shell-surface' : ''
                      }`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={`card-skeleton-${index}`} height={80} />)
          : null}
        {!isLoading && !rows.length ? (
          <p className="text-center text-text-muted">{emptyState}</p>
        ) : null}
        {!isLoading &&
          rows.map((row, rowIndex) => (
            <article key={row.id ?? rowIndex} className="rounded-panel border border-shell-border/70 bg-shell-raised p-4">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center justify-between border-b border-shell-border/40 py-2 last:border-b-0">
                  <span className="text-xs uppercase tracking-wide text-text-muted">{column.label}</span>
                  <span className="text-sm text-text-primary">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
            </article>
          ))}
      </div>
    </section>
  );
}
