import { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useDB } from '../context/dbContext.jsx';
import Table from '../components/spectatorComps/Table.jsx';
import { MultiFileTable } from '../components/spectatorComps/MultiFileTable.jsx';
import { InfoModal } from '../components/modals/InfoModal';
import { FormModal } from '../components/modals/FormModal';
import { useState as useStateHook } from 'react';
import { PRIVACY } from '../config';
import { useAuth } from '../context/simpleAuthContext';

export const Base = () => {
  const { user } = useAuth();
  const [importMode, setImportMode] = useState('single');
  const [multiFileData, setMultiFileData] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('all');
  const [voteSearch, setVoteSearch] = useState('all');
  const [affiliateSearch, setAffiliateSearch] = useState('all');
  const [refererSearch, setRefererSearch] = useState('all');
  const [persons, setPersons] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);
  const [showEditMessageModal, setShowEditMessageModal] = useState(false);
  const [availableReferers, setAvailableReferers] = useState([]);

  const { getAllRecords, subscribe, isDBReady, updateRecord, getRecord } = useDB();

  // Check import mode on component mount
  useEffect(() => {
    const mode = localStorage.getItem('importMode') || 'single';
    setImportMode(mode);
  }, []);

  const loadMultiFileData = useCallback(async () => {
    if (!isDBReady || importMode !== 'multi-file') return;

    try {
      const multiFileRecord = await getRecord('multiFileImport', 'multi_file_data');
      if (multiFileRecord) {
        setMultiFileData(multiFileRecord);
      }
    } catch (error) {
      console.error('Error loading multi-file data:', error);
    }
  }, [isDBReady, importMode, getRecord]);
  const loadData = useCallback(async () => {
    if (!isDBReady || importMode === 'multi-file') return;

    try {
      setLoading(true);
      const [personsData, tablesData] = await Promise.all([
        getAllRecords('persons'),
        getAllRecords('tables'),
      ]);
      setPersons(personsData || []);
      setTables(tablesData || []);
      
      // Extract unique referers from affiliates
      const referers = (personsData || [])
        .filter((person) => person.affiliate && person.referer && person.referer.trim() !== '')
        .map((person) => person.referer.trim())
        .filter((referer, index, array) => array.indexOf(referer) === index)
        .sort();
      setAvailableReferers(referers);
      
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  }, [isDBReady, getAllRecords, importMode]);

  useEffect(() => {
    if (isDBReady && importMode === 'single') {
      loadData();
    } else if (isDBReady && importMode === 'multi-file') {
      loadMultiFileData();
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
  }, [isDBReady, subscribe, loadData, loadMultiFileData, importMode]);

  // If multi-file mode, render different component
  if (importMode === 'multi-file') {
    if (!multiFileData) {
      return <span className='loader'></span>;
    }
    
    return (
      <div className='flex flex-col justify-center items-center gap-5'>
        <div className='text-center mb-4'>
          <h1 className='text-3xl font-bold text-zinc-100 mb-2'>Historial de Votación</h1>
          <p className='text-zinc-300'>
            Datos importados de {multiFileData.fileMetadata?.length || 0} archivos
          </p>
          <div className='flex flex-wrap justify-center gap-2 mt-2'>
            {multiFileData.fileMetadata?.map((file, index) => (
              <span key={index} className='px-2 py-1 bg-zinc-700 rounded text-xs'>
                {(() => {
                  const date = new Date(file.date);
                  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                })()}
              </span>
            ))}
          </div>
        </div>
        
        <MultiFileTable 
          persons={multiFileData.persons || []} 
          fileMetadata={multiFileData.fileMetadata || []}
          search={search}
          setSearch={setSearch}
        />
      </div>
    );
  }
  const clearPersonFilter = () => {
    setSearch('');
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setShowPersonModal(true);
  };

  const handleEditDriver = () => {
    setShowPersonModal(false);
    setShowEditDriverModal(true);
  };

  const handleEditMessage = () => {
    setShowPersonModal(false);
    setShowEditMessageModal(true);
  };

  const handleDriverSubmit = async (formData) => {
    try {
      await updateRecord('persons', {
        ...selectedPerson,
        driver: formData.driver,
      });
      setShowEditDriverModal(false);
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  const handleMessageSubmit = async (formData) => {
    try {
      await updateRecord('persons', {
        ...selectedPerson,
        message: formData.message,
      });
      setShowEditMessageModal(false);
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const canEditDriver = PRIVACY.base.includes(user?.rol);

  if (loading) return <span className='loader'></span>;
  if (error) return <p>Error: {error}</p>;

  // !!!!!!!!!!!!!!!!!!!!!!! Filter !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  let filteredPersons = persons?.filter((person) => {
    if (search === '' && voteSearch === 'all' && affiliateSearch === 'all') {
      return person;
    } else if (
      search === '' &&
      voteSearch === 'voted' &&
      affiliateSearch === 'all'
    ) {
      return person.vote == true;
    } else if (
      search === '' &&
      voteSearch === 'notVoted' &&
      affiliateSearch === 'all'
    ) {
      return person.vote == false;
    } else if (
      search === '' &&
      voteSearch === 'all' &&
      affiliateSearch === 'affiliate'
    ) {
      const matchesRefererFilter =
        refererSearch === 'all' || person.referer === refererSearch;
      return person.affiliate == true && matchesRefererFilter;
    } else if (
      search === '' &&
      voteSearch === 'voted' &&
      affiliateSearch === 'affiliate'
    ) {
      const matchesRefererFilter =
        refererSearch === 'all' || person.referer === refererSearch;
      return person.affiliate == true && person.vote == true && matchesRefererFilter;
    } else if (
      search === '' &&
      voteSearch === 'notVoted' &&
      affiliateSearch === 'affiliate'
    ) {
      const matchesRefererFilter =
        refererSearch === 'all' || person.referer === refererSearch;
      return person.affiliate == true && person.vote == false && matchesRefererFilter;
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
      <label className='text-center flex flex-col'>
          Filtro por persona:
          <br />
          <small>(El filtro por persona anula los demás filtros)</small>
        <div className='relative'>
          <input
            className='border-zinc-500 mt-2 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 focus:bg-zinc-700 focus:border-zinc-200'
            type='text'
            placeholder='Nombre, Apellido o DNI'
            value={search}
            onChange={(e) => {
              setSearch(e.target.value.toLowerCase());
            }}
          />
        </div>
      </label>

      <div className='flex flex-col gap-2 md:flex-row'>
        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por mesas:</label>
          <select
            className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
              search ? 'opacity-50' : ''
            }`}
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
            className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
              search ? 'opacity-50' : ''
            }`}
            onChange={(e) => {
              setVoteSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value='all'>Todos los votantes</option>
            <option value='voted'>Ya Votaron</option>
            <option value='notVoted'>Aún No Votaron</option>
          </select>
        </div>
        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por afiliado:</label>
          <select
            className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
              search ? 'opacity-50' : ''
            }`}
            onChange={(e) => {
              setAffiliateSearch(e.target.value);
              // Reset referer filter when affiliate filter changes
              if (e.target.value !== 'affiliate') {
                setRefererSearch('all');
              }
            }}
            disabled={search}
          >
            <option value='all'>Todos los votantes</option>
            <option value='affiliate'>Afiliados</option>
          </select>
        </div>

        {affiliateSearch === 'affiliate' && (
          <div className='flex flex-col justify-center text-center gap-1'>
            <label>Filtro por referente:</label>
            <select
              className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
                search ? 'opacity-50' : ''
              }`}
              value={refererSearch}
              onChange={(e) => setRefererSearch(e.target.value)}
              disabled={search}
            >
              <option value='all'>Todos los referentes</option>
              {availableReferers.map((referer) => (
                <option key={referer} value={referer}>
                  {referer}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className='text-center text-zinc-300'>
        {search ? (
          <>
            Resultados de búsqueda: {filteredPersons.length} registros
            encontrados
            <div className='mt-2'>
              <button
                onClick={clearPersonFilter}
                className='px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded'
              >
                Limpiar búsqueda
              </button>
            </div>
          </>
        ) : selectedSearch === 'all' ? (
          <>
            Mostrando {filteredPersons.length} registros
          </>
        ) : (
          <button
            onClick={() => setSelectedSearch('all')}
            className='px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded'
          >
            Volver a todas las mesas
          </button>
        )}
      </div>

      <Table
        persons={filteredPersons}
        loading={loading}
        error={error}
        onPersonClick={handlePersonClick}
      />

      {/* Person Details Modal */}
      <InfoModal
        isOpen={showPersonModal}
        onClose={() => {
          setShowPersonModal(false);
          setSelectedPerson(null);
        }}
        title='Información del Votante'
      >
        {selectedPerson && (
          <div className='flex flex-col gap-3'>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <span className='font-semibold'>Mesa:</span>{' '}
                <span className='uppercase'>{selectedPerson.tableNumber}</span>
              </div>
              <div>
                <span className='font-semibold'>Orden:</span>{' '}
                <span className='uppercase'>{selectedPerson.order}</span>
              </div>
              <div>
                <span className='font-semibold'>Nombre:</span>{' '}
                <span className='uppercase'>{selectedPerson.firstName}</span>
              </div>
              <div>
                <span className='font-semibold'>Apellido:</span>{' '}
                <span className='uppercase'>{selectedPerson.lastName}</span>
              </div>
              <div>
                <span className='font-semibold'>DNI:</span> {selectedPerson.dni}
              </div>
              <div>
                <span className='font-semibold'>Voto:</span>{' '}
                {selectedPerson.vote ? 'Votó' : 'No votó'}
              </div>
            </div>
            <div>
              <span className='font-semibold'>Dirección:</span>{' '}
              {selectedPerson.address || '-'}
            </div>
            <div>
              <span className='font-semibold'>Afiliado:</span>{' '}
              {selectedPerson.affiliate ? 'Sí' : 'No'}
            </div>
            <div>
              <span className='font-semibold'>Referente:</span>{' '}
              {selectedPerson.referer || '-'}
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <span className='font-semibold'>Chofer:</span>{' '}
                {selectedPerson.driver || '-'}
              </div>
              {canEditDriver && (
                <button
                  onClick={handleEditDriver}
                  className='px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm'
                >
                  Editar Chofer
                </button>
              )}
            </div>
            <div className='flex items-center justify-between'>
              <div>
                <span className='font-semibold'>Comentario:</span>{' '}
                {selectedPerson.message || '-'}
              </div>
              {canEditDriver && (
                <button
                  onClick={handleEditMessage}
                  className='px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm'
                >
                  Editar Comentario
                </button>
              )}
            </div>
          </div>
        )}
      </InfoModal>

      {/* Edit Driver Modal */}
      <FormModal
        isOpen={showEditDriverModal}
        onClose={() => {
          setShowEditDriverModal(false);
          setSelectedPerson(null);
        }}
        onSubmit={handleDriverSubmit}
        title='Editar Chofer'
        fields={[
          {
            name: 'driver',
            label: 'Chofer',
            type: 'text',
            defaultValue: selectedPerson?.driver || '',
          },
        ]}
        submitText='Guardar'
      />

      {/* Edit Message Modal */}
      <FormModal
        isOpen={showEditMessageModal}
        onClose={() => {
          setShowEditMessageModal(false);
          setSelectedPerson(null);
        }}
        onSubmit={handleMessageSubmit}
        title='Editar Comentario'
        fields={[
          {
            name: 'message',
            label: 'Comentario',
            type: 'text',
            defaultValue: selectedPerson?.message || '',
          },
        ]}
        submitText='Guardar'
      />
    </div>
  );
};
