import { useState, useCallback, useMemo } from 'react';
import {
  useQuery,
  useSubscription,
  useLazyQuery,
  useApolloClient,
} from '@apollo/client';
import {
  GET_PERSONS_PAGINATED,
  GET_PERSONS_COUNT,
  GET_TABLES_WITH_COUNTS,
} from '../graphql/persons.js';
import {
  TABLE_CHANGED,
  PERSON_VOTED,
  PERSON_UPDATED,
  PERSON_ADDED,
  PERSON_DELETED,
  TABLE_ADDED,
  TABLE_DELETED,
  MULTIPLE_PERSONS_ADDED,
} from '../graphql/subscription.js';
import { MdOutlineHowToVote, MdOutlineDrafts } from 'react-icons/md';
import { BsSendCheck } from 'react-icons/bs';
import Table from '../components/spectatorComps/Table.jsx';
import { InfoModal } from '../components/modals/InfoModal';
import { FormModal } from '../components/modals/FormModal';
import { UPDATE_PERSON } from '../graphql/persons';
import { useMutation } from '@apollo/client';
import { useContext } from 'react';
import { AuthContext } from '../context/authContext';
import { PRIVACY } from '../config';
import { toast } from 'keep-react';
import React from 'react';

const ITEMS_PER_PAGE = 50;
const SEARCH_DEBOUNCE_MS = 800;

export const Base = () => {
  const client = useApolloClient();
  const { user } = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('all');
  const [voteSearch, setVoteSearch] = useState('all');
  const [affiliateSearch, setAffiliateSearch] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [allPersons, setAllPersons] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [showLoadAllOption, setShowLoadAllOption] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lastRefetchTime, setLastRefetchTime] = useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [showEditDriverModal, setShowEditDriverModal] = useState(false);

  const [updatePerson] = useMutation(UPDATE_PERSON, {});

  // Debounce search input
  React.useEffect(() => {
    if (searchInput === debouncedSearch) return;

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput.toLowerCase().trim());
      setIsSearching(false);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchInput, debouncedSearch]);

  // Load tables with counts for the filter dropdown
  const {
    data: tablesData,
    loading: tablesLoading,
    error: tablesError,
  } = useQuery(GET_TABLES_WITH_COUNTS);

  // Build query variables based on current filters
  const queryVariables = React.useMemo(() => {
    const variables = {
      limit: selectedSearch === 'all' ? ITEMS_PER_PAGE : 10000, // Load all for specific table
      offset: currentPage * ITEMS_PER_PAGE,
    };

    // If there's a person search, ignore all other filters and search through all data
    if (debouncedSearch) {
      variables.search = debouncedSearch;
      variables.limit = 10000; // Load more results for search
      variables.offset = 0; // Reset offset for search
      return variables; // Return early, ignoring other filters
    }

    // Apply other filters only when there's no person search
    if (selectedSearch !== 'all') {
      variables.tableNumber = parseInt(selectedSearch);
      variables.limit = 10000; // Override limit for specific table
      variables.offset = 0; // Reset offset for specific table
    }

    if (voteSearch === 'vote') {
      variables.vote = true;
    } else if (voteSearch === 'noVote') {
      variables.vote = false;
    }

    if (affiliateSearch === 'affiliate') {
      variables.affiliate = true;
    }

    return variables;
  }, [
    selectedSearch,
    currentPage,
    voteSearch,
    affiliateSearch,
    debouncedSearch,
  ]);

  // Main persons query with pagination
  const {
    data: personsData,
    loading: dataLoading,
    error,
    refetch,
    fetchMore,
  } = useQuery(GET_PERSONS_PAGINATED, {
    variables: queryVariables,
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (currentPage === 0 || selectedSearch !== 'all') {
        setAllPersons(data?.persons?.persons || []);
      } else {
        setAllPersons((prev) => [...prev, ...(data?.persons?.persons || [])]);
      }
      setHasMore(data?.persons?.hasMore || false);
      setTotalCount(data?.persons?.totalCount || 0);

      // Show "Load All" option only when "all tables" is selected and there's more data
      setShowLoadAllOption(
        selectedSearch === 'all' && (data?.persons?.hasMore || false)
      );
    },
  });

  // Combine loading states
  const loading = dataLoading || isSearching;

  // Reset pagination when filters change
  const handleFilterChange = React.useCallback(() => {
    setCurrentPage(0);
    setAllPersons([]);
    setLoadingAll(false);
    refetch(queryVariables);
  }, [refetch, queryVariables]);

  // Effect to refetch when debounced search changes
  React.useEffect(() => {
    if (debouncedSearch !== searchInput.toLowerCase().trim()) return;
    handleFilterChange();
  }, [debouncedSearch, handleFilterChange]);

  // Load more data
  const loadMore = React.useCallback(() => {
    if (hasMore && !dataLoading && selectedSearch === 'all') {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      fetchMore({
        variables: {
          ...queryVariables,
          offset: nextPage * ITEMS_PER_PAGE,
        },
      });
    }
  }, [
    hasMore,
    dataLoading,
    selectedSearch,
    currentPage,
    fetchMore,
    queryVariables,
  ]);

  // Load all data at once
  const loadAllData = React.useCallback(async () => {
    setLoadingAll(true);
    try {
      const { data } = await refetch({
        ...queryVariables,
        limit: totalCount, // Load all remaining data
        offset: 0,
      });
      setAllPersons(data?.persons?.persons || []);
      setHasMore(false);
      setShowLoadAllOption(false);
    } catch (error) {
      console.error('Error loading all data:', error);
    } finally {
      setLoadingAll(false);
    }
  }, [refetch, queryVariables, totalCount]);

  // Handle search input change
  const handleSearchChange = React.useCallback((e) => {
    setSearchInput(e.target.value);
  }, []);

  // Handle filter changes
  const handleTableFilterChange = React.useCallback((value) => {
    setSelectedSearch(value);
    setCurrentPage(0);
    setAllPersons([]);
    setLoadingAll(false);
  }, []);

  const handleVoteFilterChange = React.useCallback((value) => {
    setVoteSearch(value);
    setCurrentPage(0);
    setAllPersons([]);
    setLoadingAll(false);
  }, []);

  const handleAffiliateFilterChange = React.useCallback((value) => {
    setAffiliateSearch(value);
    setCurrentPage(0);
    setAllPersons([]);
    setLoadingAll(false);
  }, []);

  // Throttled refetch function to prevent excessive API calls
  const throttledRefetch = React.useCallback(() => {
    const now = Date.now();
    if (now - lastRefetchTime > 2000) {
      // Only refetch once every 2 seconds
      setLastRefetchTime(now);
      refetch();
    }
  }, [refetch, lastRefetchTime]);

  // Update person in cache instead of full refetch
  const updatePersonInCache = React.useCallback((updatedPerson) => {
    setAllPersons((prevPersons) =>
      prevPersons.map((person) =>
        person._id === updatedPerson._id ? updatedPerson : person
      )
    );
  }, []);

  // Helper function to show vote toast
  const showVoteToast = React.useCallback((person, voteStatus) => {
    const message = `Mesa: ${person.tableNumber}, Orden: ${person.order}, ${person.firstName} ${person.lastName}`;

    if (voteStatus) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, []);

  // Add person to cache instead of full refetch
  const addPersonToCache = React.useCallback(
    (newPerson) => {
      // If there's a person search, only check search criteria
      if (debouncedSearch) {
        const matchesSearchFilter =
          newPerson.firstName.toLowerCase().includes(debouncedSearch) ||
          newPerson.lastName.toLowerCase().includes(debouncedSearch) ||
          newPerson.dni.includes(debouncedSearch);

        if (matchesSearchFilter) {
          setAllPersons((prevPersons) => {
            const exists = prevPersons.some((p) => p._id === newPerson._id);
            if (!exists) {
              return [...prevPersons, newPerson].sort((a, b) => {
                if (a.tableNumber !== b.tableNumber) {
                  return a.tableNumber - b.tableNumber;
                }
                return a.order - b.order;
              });
            }
            return prevPersons;
          });
          setTotalCount((prev) => prev + 1);
        }
      } else {
        // Apply all filters when there's no person search
        const matchesTableFilter =
          selectedSearch === 'all' ||
          newPerson.tableNumber === parseInt(selectedSearch);
        const matchesVoteFilter =
          voteSearch === 'all' ||
          (voteSearch === 'vote' && newPerson.vote) ||
          (voteSearch === 'noVote' && !newPerson.vote);
        const matchesAffiliateFilter =
          affiliateSearch === 'all' ||
          (affiliateSearch === 'affiliate' && newPerson.affiliate);

        if (matchesTableFilter && matchesVoteFilter && matchesAffiliateFilter) {
          setAllPersons((prevPersons) => {
            const exists = prevPersons.some((p) => p._id === newPerson._id);
            if (!exists) {
              return [...prevPersons, newPerson].sort((a, b) => {
                if (a.tableNumber !== b.tableNumber) {
                  return a.tableNumber - b.tableNumber;
                }
                return a.order - b.order;
              });
            }
            return prevPersons;
          });
          setTotalCount((prev) => prev + 1);
        }
      }
    },
    [selectedSearch, voteSearch, affiliateSearch, debouncedSearch]
  );

  // Update the UI to show when person search is active
  const isPersonSearchActive = debouncedSearch.trim() !== '';

  // Remove person from cache instead of full refetch
  const removePersonFromCache = React.useCallback((deletedPersonId) => {
    setAllPersons((prevPersons) =>
      prevPersons.filter((person) => person._id !== deletedPersonId)
    );
    setTotalCount((prev) => Math.max(0, prev - 1));
  }, []);

  const { data: voted } = useSubscription(PERSON_VOTED, {
    onData: (data) => {
      const updatedPerson = data.data.data.personVoted;
      if (updatedPerson) {
        // Show toast notification for vote change
        showVoteToast(updatedPerson, updatedPerson.vote);
        updatePersonInCache(updatedPerson);
      }
    },
  });

  const { data: tableChanged } = useSubscription(TABLE_CHANGED);

  const { data: tableChangedWithToast } = useSubscription(TABLE_CHANGED, {
    onData: (data) => {
      const changedTable = data.data.data.tableChange;
      if (changedTable) {
        if (changedTable.status === 'Cerrada') {
          toast.info(`Mesa ${changedTable.number} cerrada`);
        } else if (changedTable.status === 'DatosEnviados') {
          toast.success(`Mesa ${changedTable.number} - Datos enviados`);
        }
      }
    },
  });

  const { data: personAdded } = useSubscription(PERSON_ADDED, {
    onData: (data) => {
      const newPerson = data.data.data.personAdded;
      if (newPerson) {
        addPersonToCache(newPerson);
      }
    },
  });

  const { data: personGeneralUpdate } = useSubscription(PERSON_UPDATED, {
    onData: (data) => {
      const updatedPerson = data.data.data.personUpdated;
      if (updatedPerson) {
        updatePersonInCache(updatedPerson);
        // Update selectedPerson if it's the same person being viewed
        if (selectedPerson && selectedPerson._id === updatedPerson._id) {
          setSelectedPerson(updatedPerson);
        }
      }
    },
  });

  const { data: tableAdded } = useSubscription(TABLE_ADDED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: tableDeleted } = useSubscription(TABLE_DELETED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: personDeleted } = useSubscription(PERSON_DELETED, {
    onData: (data) => {
      const deletedPerson = data.data.data.personDeleted;
      if (deletedPerson) {
        removePersonFromCache(deletedPerson._id);
      }
    },
  });

  const { data: multiplePersonsAdded } = useSubscription(
    MULTIPLE_PERSONS_ADDED,
    {
      onData: (data) => {
        // For bulk operations, we need to refetch but throttle it
        setTimeout(() => {
          setCurrentPage(0);
          setAllPersons([]);
          throttledRefetch();
        }, 1000);
      },
    }
  );

  // Show initial loader only when there's no data and we're loading
  if (error) return <p>Error...</p>;
  if (tablesError) return <p>Error loading tables...</p>;

  // Use the paginated data directly since filtering is now done server-side
  const filteredPersons = allPersons;

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setShowPersonModal(true);
  };

  const handleEditDriver = () => {
    setShowPersonModal(false);
    setShowEditDriverModal(true);
  };

  const handleDriverSubmit = async (formData) => {
    try {
      await updatePerson({
        variables: {
          id: selectedPerson._id,
          driver: formData.driver,
          // Add other required fields to ensure proper update
          firstName: selectedPerson.firstName,
          lastName: selectedPerson.lastName,
          dni: selectedPerson.dni,
          vote: selectedPerson.vote,
          order: selectedPerson.order,
          address: selectedPerson.address,
          message: selectedPerson.message,
          affiliate: selectedPerson.affiliate,
          referer: selectedPerson.referer,
          tableNumber: selectedPerson.tableNumber,
        },
      });
      toast.success('Chofer actualizado correctamente');
      setShowEditDriverModal(false);
    } catch (error) {
      toast.error('Error al actualizar chofer');
    }
  };

  const canEditDriver = PRIVACY.base.includes(user?.rol);

  return (
    <div className='flex flex-col justify-center items-center gap-5'>
      <label className='text-center flex flex-col'>
        Filtro por persona:
        <br />
        <small
          className={
            isPersonSearchActive ? 'text-yellow-400 font-semibold' : ''
          }
        >
          (El filtro por persona anula los demás filtros)
        </small>
        <div className='relative'>
          <input
            className='border-zinc-500 mt-2 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 focus:bg-zinc-700 focus:border-zinc-200'
            type='text'
            placeholder='Nombre, Apellido o DNI'
            value={searchInput}
            onChange={handleSearchChange}
          />
          {isSearching && (
            <div className='absolute right-3 top-1/2 transform -tranzinc-y-1/2 mt-1'>
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-400'></div>
            </div>
          )}
        </div>
      </label>

      <div className='flex flex-col gap-2 md:flex-row'>
        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por mesas:</label>
          <select
            className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
              isPersonSearchActive ? 'opacity-50' : ''
            }`}
            value={selectedSearch}
            onChange={(e) => handleTableFilterChange(e.target.value)}
            disabled={isPersonSearchActive}
          >
            <option value='all'>Todas las mesas</option>
            {tablesData?.tablesWithCounts
              ?.filter((table) => table.totalPersons > 0)
              ?.map((table) => (
                <option key={table._id} value={table.number}>
                  Mesa #{table.number}
                </option>
              )) || []}
          </select>
        </div>

        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por votación:</label>
          <select
            className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
              isPersonSearchActive ? 'opacity-50' : ''
            }`}
            value={voteSearch}
            onChange={(e) => handleVoteFilterChange(e.target.value)}
            disabled={isPersonSearchActive}
          >
            <option value='all'>Todos los votantes</option>
            <option value='vote'>Ya Votaron</option>
            <option value='noVote'>Aún No Votaron</option>
          </select>
        </div>

        <div className='flex flex-col justify-center text-center gap-1'>
          <label>Filtro por afiliado:</label>
          <select
            className={`border-zinc-500 disabled:opacity-20 bg-zinc-800 border-2 py-2 px-5 cursor-pointer hover:bg-zinc-500 hover:border-zinc-200 disabled:pointer-events-none ${
              isPersonSearchActive ? 'opacity-50' : ''
            }`}
            value={affiliateSearch}
            onChange={(e) => handleAffiliateFilterChange(e.target.value)}
            disabled={isPersonSearchActive}
          >
            <option value='all'>Todos los votantes</option>
            <option value='affiliate'>Afiliados</option>
          </select>
        </div>
      </div>

      {/* Results Section */}
      <div className='text-center text-zinc-300'>
        {isPersonSearchActive ? (
          <>
            Resultados de búsqueda: {filteredPersons.length} registros
            encontrados
            {(isSearching || dataLoading) && (
              <div className='text-sm text-zinc-400 mt-1'>
                {isSearching ? 'Buscando...' : 'Cargando...'}
              </div>
            )}
            <div className='mt-2'>
              <button
                onClick={() => {
                  setSearchInput('');
                  setDebouncedSearch('');
                }}
                className='px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded'
              >
                Limpiar búsqueda
              </button>
            </div>
          </>
        ) : selectedSearch === 'all' ? (
          <>
            Mostrando {filteredPersons.length} de {totalCount} registros
            {(isSearching || dataLoading) && (
              <div className='text-sm text-zinc-400 mt-1'>
                {isSearching ? 'Buscando...' : 'Cargando...'}
              </div>
            )}
            <div className='flex gap-4 mt-2 justify-center'>
              {hasMore && !isSearching && (
                <button
                  onClick={loadMore}
                  disabled={dataLoading}
                  className='px-4 py-2 bg-zinc-600 hover:bg-zinc-500 rounded disabled:opacity-50'
                >
                  {dataLoading ? 'Cargando...' : 'Cargar más'}
                </button>
              )}
              {showLoadAllOption && !isSearching && (
                <button
                  onClick={loadAllData}
                  disabled={loadingAll}
                  className='px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50'
                >
                  {loadingAll
                    ? 'Cargando todos...'
                    : `Cargar todos (${totalCount} registros)`}
                </button>
              )}
            </div>
          </>
        ) : (
          <button
            onClick={() => handleTableFilterChange('all')}
            className='px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded'
          >
            Volver a todas las mesas
          </button>
        )}
      </div>

      <Table
        persons={filteredPersons}
        loading={dataLoading && currentPage === 0 && allPersons.length === 0}
        isSearching={isSearching}
        error={error}
        onPersonClick={handlePersonClick}
        onLoadMore={
          selectedSearch === 'all' && hasMore && !isSearching ? loadMore : null
        }
        isLoadingMore={dataLoading && currentPage > 0}
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
            <div>
              <span className='font-semibold'>Comentario:</span>{' '}
              {selectedPerson.message || '-'}
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
    </div>
  );
};
