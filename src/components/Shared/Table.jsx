import './Table.css';

export default function Table({ columns, data, emptyMessage = 'No hay datos disponibles', renderRow, footer }) {
    return (
        <div className="table-wrapper">
            <div className="table-scroll">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={col.width ? { width: col.width } : {}}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="table-empty">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            data.map((row, index) => renderRow(row, index))
                        )}
                    </tbody>
                </table>
            </div>
            {footer && <div className="table-footer">{footer}</div>}
        </div>
    );
}
