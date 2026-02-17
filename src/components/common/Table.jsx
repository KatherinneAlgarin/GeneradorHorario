import React from 'react';
import '../../styles/Table.css'; 
const Table = ({ columns = [], data = [], actions }) => {

  if (!columns || !data) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando datos...</div>;
  }

  return (
    <div className="table-responsive">
      <table className="admin-table">
        <thead>
          <tr>
            {/* Encabezados dinámicos */}
            {columns.map((col, index) => (
              <th key={index}>
                {col.header}
              </th>
            ))}
            {/* Encabezado fijo para acciones si existen */}
            {actions && <th className="text-center">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {/* Celdas dinámicas */}
                {columns.map((col, colIndex) => (
                  <td key={`${rowIndex}-${colIndex}`}>
                    {/* Renderizado condicional: Usa función render si existe (para badges, etc.), sino texto plano */}
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
                
                {/* Celda de acciones */}
                {actions && (
                  <td>
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length + (actions ? 1 : 0)} 
                className="text-center"
                style={{ padding: '30px', color: '#888' }}
              >
                No hay registros para mostrar
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;