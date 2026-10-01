import './DataTable.css';

export default function DataTable({ columns, rows, loading, emptyMessage = 'No records found', scrollable = false, maxHeight = '500px', fullWidth = false, onRowClick }) {
  return (
    <div
      className={`data-table-container ${fullWidth ? 'data-table-container-full-width' : 'data-table-container-fit-width'}`}
      style={scrollable ? { maxHeight } : undefined}
    >
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width ? { width: col.width } : undefined}
                className={`data-table-header-cell ${scrollable ? 'data-table-header-cell-sticky' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="data-table-body">
          {loading && (
            <tr>
              <td colSpan={columns.length} className="data-table-empty-cell">
                Loading...
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="data-table-empty-cell">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`data-table-row ${onRowClick ? 'data-table-row-clickable' : ''} ${i % 2 === 1 ? 'data-table-row-odd' : 'data-table-row-even'}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="data-table-cell">
                    {col.render ? col.render(row, i) : (row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
