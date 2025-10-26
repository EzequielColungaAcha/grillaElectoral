import { TableList } from '../components/tables/TableList';
import { useState, useEffect, useCallback } from 'react';
import { useDB } from '../context/dbContext';

export function Tables() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getAllRecords, subscribe, isDBReady } = useDB();

  const loadTables = useCallback(async () => {
    if (!isDBReady) return;

    try {
      setLoading(true);
      const tablesData = (await getAllRecords('tables')) || [];
      const allPersons = (await getAllRecords('persons')) || [];
      const allFactions = (await getAllRecords('factions')) || [];

      // Sort tables by number
      const sortedTables = tablesData.sort((a, b) => a.number - b.number);

      // Get additional data for each table
      const tablesWithData = sortedTables.map((table) => {
        const tablePersons = allPersons.filter((p) => p.tableId === table._id);
        const tableFactions = allFactions.filter(
          (f) => f.tableId === table._id
        );

        return {
          ...table,
          totalPersons: tablePersons.length,
          voted: tablePersons.filter((p) => p.vote).length,
          factions: tableFactions,
        };
      });

      setTables(tablesWithData);
    } catch (err) {
      console.error('Error loading tables:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isDBReady, getAllRecords]);

  useEffect(() => {
    if (isDBReady) {
      loadTables();
    }

    // Subscribe to table changes
    const unsubscribeFunctions = [];

    if (isDBReady) {
      unsubscribeFunctions.push(subscribe('tables_added', loadTables));
      unsubscribeFunctions.push(subscribe('tables_deleted', loadTables));
      unsubscribeFunctions.push(subscribe('tables_updated', loadTables));
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [isDBReady, subscribe, loadTables]);

  if (loading) return <span className='loader'></span>;
  if (error) return <p>Error: {error}</p>;

  return tables.length ? (
    <div className='bg-zinc-900 shadow-black p-8 h-full w-full'>
      <h1 className='text-4xl font-bold py-2 mb-4 text-center underline underline-offset-4 text-slate-100'>
        Mesas
      </h1>
      <div className='flex justify-between gap-x-1'>
        <TableList data={{ tables }} />
      </div>
    </div>
  ) : (
    <div className='bg-zinc-900 shadow-black p-8 h-full w-full'>
      <h1 className='text-4xl font-bold py-2 mb-4 text-center text-slate-100'>
        Aún no hay mesas cargadas
      </h1>
    </div>
  );
}
