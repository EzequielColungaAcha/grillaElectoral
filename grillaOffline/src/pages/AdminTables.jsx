import { useState, useEffect } from 'react';
import { useDB } from '../context/dbContext';

export const AdminTables = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, subscribe, isDBReady } = useDB();

  const loadTables = async () => {
    if (!isDBReady) return;

    try {
      const tablesData = await getAllRecords('tables');
      setTables(tablesData.sort((a, b) => a.number - b.number));
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();

    // Subscribe to changes
    const unsubscribeAdded = subscribe('tables_added', loadTables);
    const unsubscribeDeleted = subscribe('tables_deleted', loadTables);
    const unsubscribeUpdated = subscribe('tables_updated', loadTables);

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
      unsubscribeUpdated();
    };
  }, [isDBReady]);

  if (loading) return <span className='loader'></span>;

  return (
    <div>
      <div className='flex items-center justify-center mb-5 gap-3'>
        <p className='text-xl'>Administración de Mesas - Modo Offline</p>
      </div>
      <div className='h-full w-full px-5 flex flex-col items-center'>
        {tables.map((table) => (
          <div
            key={table._id}
            className='bg-zinc-800 w-full max-w-2xl rounded-lg shadow-lg shadow-black p-4 mb-2'
          >
            <h2 className='text-xl font-medium'>Mesa {table.number}</h2>
            {table.description && (
              <p className='text-slate-300'>Descripción: {table.description}</p>
            )}
            <p>Estado: {table.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
