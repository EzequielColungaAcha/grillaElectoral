import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDB } from '../context/dbContext';
import { FormModal } from '../components/form/ReactHookForm.jsx';
import {
  ButtonCloseTable,
  ButtonBackToTables,
} from '../components/tables/Buttons.jsx';
import { StatusCerrada } from '../components/tables/tableDetails/StatusCerrada.jsx';
import { StatusDatosEnviados } from '../components/tables/tableDetails/StatusDatosEnviados.jsx';
import PersonsTable from '../components/persons/PersonsTable.jsx';
import { URL } from '../config.js';
import { Hash } from '@phosphor-icons/react';
import { useAuth } from '../context/simpleAuthContext.jsx';

export function TableDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const { getRecord, getRecordsByIndex, getAllRecords, subscribe, isDBReady } =
    useDB();

  const loadTable = async () => {
    if (!isDBReady || !params.id) return;

    try {
      setLoading(true);
      const tableData = await getRecord('tables', params.id);

      if (!tableData) {
        console.error('Table not found with ID:', params.id);
        navigate(URL);
        return;
      }

      // Load persons using tableId index (matching server resolver logic)
      let persons = await getRecordsByIndex('persons', 'tableId', params.id);

      // If no persons found by tableId, log for debugging
      if (!persons || persons.length === 0) {
        console.log('No persons found for tableId:', params.id);
        console.log('Searching all persons to debug...');

        // Get all persons to debug the issue
        const allPersons = await getAllRecords('persons');
        console.log('All persons in database:', allPersons);
        console.log('Looking for persons with tableId matching:', params.id);

        // Filter manually to see if there's a data type mismatch
        const matchingPersons = allPersons.filter((p) => {
          console.log(
            `Person ${p._id}: tableId = "${
              p.tableId
            }" (type: ${typeof p.tableId}), comparing to "${
              params.id
            }" (type: ${typeof params.id})`
          );
          return (
            p.tableId === params.id ||
            p.tableId?.toString() === params.id ||
            p.tableId === params.id.toString()
          );
        });

        persons = matchingPersons;
        console.log('Matching persons found:', persons);
      }

      const factions = await getRecordsByIndex(
        'factions',
        'tableId',
        params.id
      );

      // Sort persons by order
      const sortedPersons = (persons || []).sort((a, b) => a.order - b.order);

      setTable({
        ...tableData,
        persons: sortedPersons,
        factions: factions || [],
        totalPersons: persons.length,
        voted: persons.filter((p) => p.vote).length,
      });
    } catch (err) {
      console.error('Error loading table:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTable();

    // Subscribe to changes
    const unsubscribePersonAdded = subscribe('persons_added', loadTable);
    const unsubscribePersonDeleted = subscribe('persons_deleted', loadTable);
    const unsubscribePersonUpdated = subscribe('persons_updated', loadTable);
    const unsubscribeTableUpdated = subscribe('tables_updated', loadTable);

    return () => {
      if (typeof unsubscribePersonAdded === 'function')
        unsubscribePersonAdded();
      if (typeof unsubscribePersonDeleted === 'function')
        unsubscribePersonDeleted();
      if (typeof unsubscribePersonUpdated === 'function')
        unsubscribePersonUpdated();
      if (typeof unsubscribeTableUpdated === 'function')
        unsubscribeTableUpdated();
    };
  }, [params.id, isDBReady]);

  if (loading) return <span className='loader'></span>;
  if (error) {
    console.error('TableDetails error:', error);
    return <div>Error loading table: {error}</div>;
  }
  if (!table) return navigate(URL);

  const filteredPersons = table.persons.filter((person) => {
    return search === '' ? person : person.order == search;
  });

  if (table.status === 'Abierta') {
    const totalVotes = table.persons.filter(
      (person) => person.vote === true
    ).length;
    const personsLength = table.persons.length;
    const votePercent = ((totalVotes / personsLength) * 100).toFixed(2);

    return (
      <div className='bg-zinc-800 shadow-lg shadow-black p-2 h-full w-full'>
        <div className='flex justify-between items-center'>
          {!user.assignedTable ? <ButtonBackToTables /> : <div></div>}
          <ButtonCloseTable table={table} search={setSearch} />
        </div>
        <div className='bg-zinc-900 mb-2 p-10 flex flex-col justify-between max-w-2xl m-auto'>
          <div>
            <div className='flex justify-evenly items-center w-full gap-5'>
              <div className='text-center'>
                <div
                  className='radial-progress text-center font-medium'
                  style={{
                    '--value': `${votePercent}`,
                    '--size': '10rem',
                    '--thickness': '2px',
                  }}
                >
                  <h1 className='text-3xl'>Mesa {table.number}</h1>
                  <small>{table.description ? table.description : ''}</small>
                  <h2 className='text-lg'>
                    {totalVotes} / {personsLength} (
                    {isNaN(votePercent) ? '0.00' : votePercent}
                    %)
                  </h2>
                </div>
              </div>
              <div>
                <FormModal tableId={table._id} tableNumber={table.number} />
              </div>
            </div>
          </div>
          <div className='flex justify-center items-center mb-2'>
            <form
              className='search-box'
              autoComplete='off'
              autoSave='off'
              onSubmit={(e) => e.preventDefault()}
            >
              <label className='block mb-2 text-sm font-medium text-white text-center'>
                Búsqueda por número de orden
              </label>
              <fieldset className='relative max-w-md'>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value.toLowerCase());
                  }}
                  placeholder='Nro de Orden'
                  className='ps-11 bg-zinc-800 text-zinc-200 border border-zinc-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-500'
                />
                <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                  <Hash size={19} color='#AFBACA' />
                </div>
              </fieldset>
            </form>
          </div>
        </div>
        {table.persons.length === 0 ? (
          <div className='text-center text-zinc-200 p-8'>
            <p>No hay personas cargadas en esta mesa.</p>
            <p>Total de personas encontradas: {table.totalPersons}</p>
          </div>
        ) : (
          <PersonsTable persons={filteredPersons} />
        )}
        <div className='flex justify-center mt-5'>
          <ButtonCloseTable table={table} search={setSearch} />
        </div>
      </div>
    );
  } else if (table.status === 'Cerrada' && table.factions.length === 0) {
    return <StatusCerrada table={table} />;
  } else {
    return <StatusDatosEnviados table={table} />;
  }
}
