export default function Table({ columns, rows, loading, emptyMessage = 'No records found' }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-4 py-3 font-medium text-slate-600 dark:text-slate-400">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {loading && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                Loading...
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row, i) => (
              <tr key={row.id ?? i} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                    {col.render ? col.render(row) : (row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
