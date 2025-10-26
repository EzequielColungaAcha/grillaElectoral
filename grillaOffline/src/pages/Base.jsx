import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useDB } from '../context/dbContext.jsx';
import { MdOutlineHowToVote, MdOutlineDrafts } from 'react-icons/md';
import { BsSendCheck } from 'react-icons/bs';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Table from '../components/spectatorComps/Table.jsx';

const MySwal = withReactContent(Swal);

export const Base = () => {
  const [search, setSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('all');
  const [voteSearch, setVoteSearch] = useState('all');
  const [affiliateSearch, setAffiliateSearch] = useState('all');
  const [persons, setPersons] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getAllRecords, subscribe, isDBReady } = useDB();

  const loadData = useCallback(async () => {
    if (!isDBReady) return;

    try {
      setLoading(true);
      const [personsData, tablesData] = await Promise.all([
        getAllRecords('persons'),
        getAllRecords('tables'),
      ]);
      setPersons(personsData || []);
      setTables(tablesData || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [isDBReady, getAllRecords]);

  useEffect(() => {
    if (isDBReady) {
      loadData();
    }

    // Subscribe to data changes
    const unsubscribeFunctions = [];

    if (isDBReady) {
      const events = [
        'persons_added',
        'persons_updated',
        'persons_deleted',
        'tables_added',
        'tables_updated',
        'tables_deleted',
      ];

      events.forEach((event) => {
        const unsubscribe = subscribe(event, loadData);
        unsubscribeFunctions.push(unsubscribe);
      });
    }

    // Cleanup subscriptions
    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [isDBReady, subscribe, loadData]);

  const clearPersonFilter = () => {
    setSearch('');
  };
  if (loading) return <span className='loader'></span>;
  if (error) return <p>Error: {error}</p>;

  // !!!!!!!!!!!!!!!!!!!!!!! Filter !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  let filteredPersons = persons?.filter((person) => {
    if (search === '' && voteSearch === 'all' && affiliateSearch === 'all') {
      return person;
    } else if (
      search === '' &&
      voteSearch === 'vote' &&
      affiliateSearch === 'all'
    ) {
      return person.vote == true;
    } else if (
      search === '' &&
      voteSearch === 'noVote' &&
      affiliateSearch === 'all'
    ) {
      return person.vote == false;
    } else if (
      search === '' &&
      voteSearch === 'all' &&
      affiliateSearch === 'affiliate'
    ) {
      return person.affiliate == true;
    } else if (
      search === '' &&
      voteSearch === 'vote' &&
      affiliateSearch === 'affiliate'
    ) {
      return person.affiliate == true && person.vote == true;
    } else if (
      search === '' &&
      voteSearch === 'noVote' &&
      affiliateSearch === 'affiliate'
    ) {
      return person.affiliate == true && person.vote == false;
    } else {
      return (
        person.firstName.toLowerCase().includes(search) ||
        person.lastName.toLowerCase().includes(search) ||
        person.dni.toLowerCase().includes(search)
      );
    }
  });

  selectedSearch != 'all' &&
    !search &&
    (filteredPersons = filteredPersons.filter((person) => {
      if (person.tableNumber == selectedSearch) {
        return person;
      }
    }));

  // Filtrar las personas de la mesa
  // !!!!!!!!!!!!!!!!!!!!!!! Filter End!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  return (
    <div className='flex flex-col justify-center items-center gap-5'>
      <div className='text-center flex flex-col'>
        <label>
          Filtro por persona:
          <br />
          <small>(El filtro por persona anula los demás filtros)</small>
        </label>
        <div className='flex items-center gap-2 mt-2'>
          <input
            className='border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 focus:bg-slate-700 focus:border-slate-200 flex-1'
            type='text'
            placeholder='Nombre, Apellido o DNI'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value.toLowerCase());
            }}
          />
          {search && (
            <button
              onClick={clearPersonFilter}
              className='bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded border-2 border-red-600'
              title='Limpiar filtro'
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className='flex flex-col gap-2 md:flex-row'>
        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por mesas:</label>
          <select
            className='border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 cursor-pointer hover:bg-slate-500 hover:border-slate-200 disabled:pointer-events-none'
            style={{
              appearance: 'none',
              backgroundImage:
                "url(\"data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6,9 12,15 18,9'></polyline></svg>\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 8px center',
              backgroundSize: '16px',
              paddingRight: '32px',
            }}
            onChange={(e) => {
              setSelectedSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value='all'>Todas las mesas</option>
            {tables
              .filter((table) => {
                // Count persons for this table
                const tablePersons = persons.filter(
                  (p) =>
                    p.tableId === table._id || p.tableNumber === table.number
                );
                return tablePersons.length > 0;
              })
              .sort((a, b) => a.number - b.number)
              .map((table) => (
                <option key={table._id} value={table.number}>
                  Mesa #{table.number}
                </option>
              ))}
          </select>
        </div>
        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por votación:</label>
          <select
            className='border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 cursor-pointer hover:bg-slate-500 hover:border-slate-200 disabled:pointer-events-none'
            onChange={(e) => {
              setVoteSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value='all'>Todos los votantes</option>
            <option value='vote'>Ya Votaron</option>
            <option value='noVote'>Aún No Votaron</option>
          </select>
        </div>
        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por afiliado:</label>
          <select
            className='border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 cursor-pointer hover:bg-slate-500 hover:border-slate-200 disabled:pointer-events-none'
            onChange={(e) => {
              setAffiliateSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value='all'>Todos los votantes</option>
            <option value='affiliate'>Afiliados</option>
          </select>
        </div>
      </div>
      <Table persons={filteredPersons} loading={loading} error={error} />
    </div>
  );
};
