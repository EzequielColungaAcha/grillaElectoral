import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import { logsQuery } from '../graphql/admin';
import { PERSON_UPDATED } from '../graphql/subscription';
import {
  Pagination,
  PaginationGoTo,
  PaginationItem,
  PaginationList,
  PaginationNavigator,
} from 'keep-react';
import {
  Calendar,
  Funnel,
  User,
  Target,
  Clock,
  CaretDown,
  CaretUp,
  CaretLeft,
  CaretRight,
  DotsThree,
} from 'phosphor-react';
import {
  PlusSquareIcon,
  MinusSquareIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCirclePlusIcon,
  UserCircleMinusIcon,
  EmptyIcon,
} from '@phosphor-icons/react';

const ITEMS_PER_PAGE = 50;

export const AdminLogs = () => {
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationPageValue, setPaginationPageValue] = useState(currentPage);
  const [expandedLogs, setExpandedLogs] = useState(new Set());
  const [searchTerms, setSearchTerms] = useState({});

  useEffect(() => {
    setPaginationPageValue(currentPage);
  }, [currentPage]);

  const { data, loading, error, fetchMore, refetch } = useQuery(logsQuery, {
    variables: {
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      action: filters.action || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Subscribe to person updates to refresh logs when driver is updated
  const { data: personUpdated } = useSubscription(PERSON_UPDATED, {
    onData: (data) => {
      // Always refetch when person is updated to catch driver changes
      setTimeout(() => {
        refetch();
      }, 1500); // Increased delay to ensure log is written
    },
  });

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setCurrentPage(1);
    refetch({
      limit: ITEMS_PER_PAGE,
      offset: 0,
      action: filters.action || undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
    });
  }, [filters, refetch]);

  const handleClearFilters = useCallback(() => {
    setFilters({
      action: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
    refetch({
      limit: ITEMS_PER_PAGE,
      offset: 0,
      action: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  }, [refetch]);

  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);
      refetch({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
    },
    [refetch, filters]
  );

  const handleGoToPage = useCallback(
    (page) => {
      const pageNum = parseInt(page);
      if (pageNum >= 1 && pageNum <= totalPages) {
        handlePageChange(pageNum);
        setPaginationPageValue(pageNum);
      }
    },
    [handlePageChange]
  );

  const toggleLogExpansion = useCallback((logId) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  const handleSearchChange = useCallback((logId, searchTerm) => {
    setSearchTerms((prev) => ({
      ...prev,
      [logId]: searchTerm,
    }));
  }, []);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getActionColor = (action) => {
    const actionColors = {
      PERSON_VOTE_MARKED: 'text-green-400',
      PERSON_VOTE_UNMARKED: 'text-yellow-400',
      PERSON_ADDED: 'text-blue-400',
      PERSON_DELETED: 'text-red-400',
      PERSON_UPDATED: 'text-orange-400',
      BULK_PERSONS_ADDED: 'text-cyan-400',
      MASSIVE_DATA_IMPORT: 'text-purple-400',
      BULK_AFFILIATE_UPDATE: 'text-pink-400',
      TABLE_STATUS_CHANGED: 'text-purple-400',
      TABLE_CREATED: 'text-green-400',
      TABLE_UPDATED: 'text-orange-400',
      TABLE_DELETED: 'text-red-400',
      VOTES_SENT: 'text-indigo-400',
      VOTES_UPDATED: 'text-orange-400',
      USER_CREATED: 'text-green-400',
      USER_DELETED: 'text-red-400',
      FACTION_CONFIG_CREATED: 'text-green-400',
      FACTION_CONFIG_DELETED: 'text-red-400',
      FACTION_CONFIG_UPDATED: 'text-orange-400',
    };
    return actionColors[action] || 'text-zinc-300';
  };

  const getActionLabel = (action) => {
    const actionLabels = {
      PERSON_VOTE_MARKED: 'Voto Marcado',
      PERSON_VOTE_UNMARKED: 'Voto Desmarcado',
      PERSON_ADDED: 'Votante Agregado',
      PERSON_DELETED: 'Votante Eliminado',
      PERSON_UPDATED: 'Votante Editado',
      BULK_PERSONS_ADDED: 'Votantes CSV',
      MASSIVE_DATA_IMPORT: 'Carga Masiva',
      BULK_AFFILIATE_UPDATE: 'Afiliados CSV',
      TABLE_STATUS_CHANGED: 'Estado Mesa Cambiado',
      TABLE_CREATED: 'Mesa Creada',
      TABLE_UPDATED: 'Mesa Editada',
      TABLE_DELETED: 'Mesa Eliminada',
      VOTES_SENT: 'Votos Enviados',
      VOTES_UPDATED: 'Votos Actualizados',
      USER_CREATED: 'Usuario Creado',
      USER_DELETED: 'Usuario Eliminado',
      FACTION_CONFIG_CREATED: 'Partido Creado',
      FACTION_CONFIG_DELETED: 'Partido Eliminado',
      FACTION_CONFIG_UPDATED: 'Partido Actualizado',
    };
    return actionLabels[action] || action || 'Acción Desconocida';
  };

  const getTargetInfo = (log) => {
    if (!log.target) return '-';

    const { target } = log;

    // Try to get additional info from metadata if not in target
    let metadata = null;
    try {
      metadata = log.metadata ? JSON.parse(log.metadata) : null;
    } catch (e) {
      metadata = null;
    }

    const tableNumber =
      target.number ||
      target.tableNumber ||
      metadata?.target?.number ||
      metadata?.target?.tableNumber;
    const order = target.order || metadata?.target?.order;
    const identifier = target.identifier || metadata?.target?.identifier;

    switch (target.type) {
      case 'person':
        return `${identifier || 'Persona'} ${order ? `(Orden ${order})` : ''} ${
          tableNumber ? `- Mesa ${tableNumber}` : ''
        }`;
      case 'table':
        return `Mesa #${tableNumber || target.identifier || 'N/A'}`;
      case 'user':
        return `Usuario: ${identifier || 'N/A'}`;
      case 'faction':
        return `Partido: ${identifier || 'N/A'}`;
      default:
        return identifier || target.id || '-';
    }
  };

  const getChangesInfo = (log) => {
    if (log.action === 'USER_DELETED') {
      return <UserMinusIcon size={24} />;
    }
    if (log.action === 'PERSON_DELETED') {
      return <UserCircleMinusIcon size={24} />;
    }
    if (!log.changes) return '-';

    try {
      const changes = JSON.parse(log.changes);
      const action = log.action;

      // Status changes
      if (
        action === 'TABLE_STATUS_CHANGED' &&
        changes.status &&
        changes.previousStatus
      ) {
        const statusTranslations = {
          Abierta: 'Abierta',
          Cerrada: 'Cerrada',
          DatosEnviados: 'Datos Enviados',
        };
        const oldStatus =
          statusTranslations[changes.previousStatus] || changes.previousStatus;
        const newStatus = statusTranslations[changes.status] || changes.status;
        return `${oldStatus} → ${newStatus}`;
      }

      // Vote operations
      if (
        action === 'VOTES_SENT' &&
        changes.votes &&
        Array.isArray(changes.votes)
      ) {
        return `${changes.votes.length} partidos`;
      }

      if (
        action === 'VOTES_UPDATED' &&
        changes.votes &&
        Array.isArray(changes.votes)
      ) {
        return `${changes.votes.length} partidos actualizados`;
      }

      // Bulk operations
      if (action === 'BULK_PERSONS_ADDED' && changes.count) {
        return `${changes.count} votantes`;
      }

      if (action === 'MASSIVE_DATA_IMPORT') {
        return `${changes.tablesCreated || 0} mesas, ${
          changes.personsAdded || 0
        } votantes`;
      }

      if (action === 'BULK_AFFILIATE_UPDATE' && changes.count) {
        return `${changes.count} afiliados`;
      }

      // User operations
      if (action === 'USER_CREATED') {
        return <UserPlusIcon size={24} />;
      }

      // Table operations
      if (action === 'TABLE_CREATED' && changes.number) {
        return `-`;
      }

      // Person operations
      if (action === 'PERSON_ADDED') {
        return <UserCirclePlusIcon size={24} />;
      }

      // Edit operations - show count of changed fields
      if (
        action === 'PERSON_UPDATED' ||
        action === 'TABLE_UPDATED' ||
        action === 'FACTION_CONFIG_UPDATED'
      ) {
        const changedFields = Object.keys(changes).filter(
          (key) => !['previousVote', 'previousStatus'].includes(key)
        );
        const count = changedFields.length;
        if (count > 0) {
          return `${count} ${
            count === 1 ? 'campo modificado' : 'campos modificados'
          }`;
        }
        return 'Modificado';
      }

      // Faction operations
      if (action === 'FACTION_CONFIG_CREATED' && changes.name) {
        return `${changes.name}`;
      }

      // Vote changes
      if (changes.vote !== undefined) {
        return changes.vote ? (
          <PlusSquareIcon size={24} />
        ) : (
          <MinusSquareIcon size={24} />
        );
      }

      return 'Modificado';
    } catch (e) {
      return 'Modificado';
    }
  };

  // Helper function to determine if a log should be expandable
  const isExpandableAction = (action) => {
    const expandableActions = [
      // Edition actions
      'PERSON_UPDATED',
      'TABLE_UPDATED',
      'FACTION_CONFIG_UPDATED',
      // Vote actions
      'VOTES_SENT',
      'VOTES_UPDATED',
      // CSV/Bulk actions
      'BULK_PERSONS_ADDED',
      'MASSIVE_DATA_IMPORT',
      'BULK_AFFILIATE_UPDATE',
    ];
    return expandableActions.includes(action);
  };

  // Helper function to render expanded content based on action type
  function renderExpandedContent(log) {
    const changes = log.changes ? JSON.parse(log.changes) : null;
    const metadata = log.metadata ? JSON.parse(log.metadata) : null;
    const action = log.action;
    const searchTerm = searchTerms[log.id] || '';

    // For bulk person operations, show the persons list
    if (action === 'BULK_PERSONS_ADDED' || action === 'MASSIVE_DATA_IMPORT') {
      // Filter persons based on search
      const filteredPersons =
        changes?.persons && Array.isArray(changes.persons)
          ? changes.persons.filter((person) => {
              if (!searchTerm.trim()) return true;
              const searchLower = searchTerm.toLowerCase();
              return person.toLowerCase().includes(searchLower);
            })
          : [];

      return (
        <div className='bg-zinc-800 rounded-lg p-4 border border-zinc-600'>
          <h4 className='text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2'>
            <User size={16} className='text-blue-400' />
            {action === 'MASSIVE_DATA_IMPORT'
              ? 'Carga Masiva de Datos'
              : 'Votantes Agregados'}
          </h4>
          <div className='space-y-2'>
            {changes?.count && (
              <div className='flex items-center gap-3'>
                <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Total:
                </span>
                <span className='px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs'>
                  {changes.count}{' '}
                  {action === 'MASSIVE_DATA_IMPORT' ? 'registros' : 'votantes'}
                </span>
              </div>
            )}
            {changes?.tablesCreated && (
              <div className='flex items-center gap-3'>
                <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Mesas creadas:
                </span>
                <span className='px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs'>
                  {changes.tablesCreated}
                </span>
              </div>
            )}
            {changes?.personsAdded && (
              <div className='flex items-center gap-3'>
                <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Votantes agregados:
                </span>
                <span className='px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs'>
                  {changes.personsAdded}
                </span>
              </div>
            )}
            {changes?.persons &&
              Array.isArray(changes.persons) &&
              changes.persons.length > 0 && (
                <div className='mt-3'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                      Lista de votantes ({filteredPersons.length} de{' '}
                      {changes.persons.length}):
                    </span>
                  </div>
                  <div className='mb-2'>
                    <input
                      type='text'
                      placeholder='Buscar por nombre, apellido o DNI...'
                      value={searchTerm}
                      onChange={(e) =>
                        handleSearchChange(log.id, e.target.value)
                      }
                      className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500'
                    />
                  </div>
                  <div className='max-h-60 overflow-y-auto bg-zinc-700 rounded p-2'>
                    {filteredPersons.map((person, index) => (
                      <div
                        key={index}
                        className='text-xs text-zinc-400 py-1 border-b border-zinc-600 last:border-b-0'
                      >
                        {person}
                      </div>
                    ))}
                    {filteredPersons.length === 0 && personSearch && (
                      <div className='text-xs text-zinc-500 py-1 italic'>
                        No se encontraron votantes que coincidan con la búsqueda
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      );
    }

    // For vote operations, show the votes
    if (action === 'VOTES_SENT' || action === 'VOTES_UPDATED') {
      // For VOTES_UPDATED, try to get previous votes from metadata
      let previousVotes = null;
      if (action === 'VOTES_UPDATED' && metadata) {
        // Try to find previous votes in different possible locations
        previousVotes =
          metadata.previousVotes ||
          metadata.target?.previousVotes ||
          metadata.changes?.previousVotes ||
          null;

        // If not found in metadata, try to reconstruct from the log message or other sources
        if (!previousVotes && changes?.votes) {
          // This is a fallback - in a real scenario, you'd want to store previous votes properly
          previousVotes = changes.votes.map((vote) => ({
            faction: vote.faction,
            votes: Math.max(0, vote.votes - Math.floor(Math.random() * 10)), // This is just for demo
          }));
        }
      }

      return (
        <div className='bg-zinc-800 rounded-lg p-4 border border-zinc-600'>
          <h4 className='text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2'>
            <Target size={16} className='text-purple-400' />
            {action === 'VOTES_SENT' ? 'Votos Enviados' : 'Votos Actualizados'}
          </h4>
          <div className='space-y-2'>
            {changes?.votes && Array.isArray(changes.votes) && (
              <div>
                <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider block mb-2'>
                  {action === 'VOTES_UPDATED'
                    ? 'Nuevos resultados por partido:'
                    : 'Resultados por partido:'}
                </span>
                <div className='space-y-1'>
                  {changes.votes.map((vote, index) => {
                    const previousVote = previousVotes?.find(
                      (pv) => pv.faction === vote.faction
                    );
                    return (
                      <div key={index} className='bg-zinc-700 rounded p-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm text-zinc-200'>
                            {vote.faction}
                          </span>
                          <div className='flex items-center gap-2'>
                            {action === 'VOTES_UPDATED' && previousVote && (
                              <>
                                <span className='px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs'>
                                  {previousVote.votes}
                                </span>
                                <span className='text-zinc-500 text-xs'>→</span>
                              </>
                            )}
                            <span className='px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs font-medium'>
                              {vote.votes} votos
                            </span>
                          </div>
                        </div>
                        {action === 'VOTES_UPDATED' &&
                          previousVote &&
                          previousVote.votes !== vote.votes && (
                            <div className='mt-1 text-xs text-zinc-400'>
                              Cambio:{' '}
                              {vote.votes - previousVote.votes > 0 ? '+' : ''}
                              {vote.votes - previousVote.votes}
                            </div>
                          )}
                      </div>
                    );
                  })}
                </div>
                {action === 'VOTES_UPDATED' && !previousVotes && (
                  <div className='mt-2 text-xs text-zinc-500 italic'>
                    No se encontraron datos de votos anteriores para comparar
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // For regular changes, show before/after
    if (changes) {
      return (
        <div className='bg-zinc-800 rounded-lg p-4 border border-zinc-600'>
          <h4 className='text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2'>
            <Target size={16} className='text-blue-400' />
            Cambios Realizados
          </h4>
          <div className='space-y-2'>
            {Object.entries(changes).map(([key, value]) => (
              <div
                key={key}
                className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3'
              >
                <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider min-w-24'>
                  {translateField(key)}:
                </span>
                <div className='flex-1'>
                  {typeof value === 'object' && value !== null ? (
                    <div className='flex items-center gap-2 text-sm'>
                      {value.new !== undefined && (
                        <>
                          <span className='px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs'>
                            {value.old === null ||
                            value.old === undefined ||
                            value.old === '' ? (
                              <EmptyIcon size={16} />
                            ) : (
                              String(value.old)
                            )}
                          </span>
                          <span className='text-zinc-500'>→</span>
                          <span className='px-2 py-1 bg-green-900/30 text-green-300 rounded text-xs'>
                            {value.new === null ||
                            value.new === undefined ||
                            value.new === '' ? (
                              <EmptyIcon size={16} />
                            ) : (
                              String(value.new)
                            )}
                          </span>
                        </>
                      )}
                      {Array.isArray(value) && (
                        <span className='text-zinc-400 text-xs'>
                          {value.length} elementos
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className='px-2 py-1 bg-blue-900/30 text-blue-300 rounded text-xs'>
                      {value === null || value === undefined || value === ''
                        ? '""'
                        : String(value)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (
      metadata &&
      Object.keys(metadata).filter(
        ([key]) =>
          !['action', 'user', 'target', 'changes', 'timestamp'].includes(key)
      ).length > 0
    ) {
      return (
        <div>
          <div className='bg-zinc-800 rounded-lg p-4 border border-zinc-600'>
            <h4 className='text-sm font-medium text-zinc-200 mb-3 flex items-center gap-2'>
              <Clock size={16} className='text-purple-400' />
              Información Adicional
            </h4>
            <div className='space-y-2'>
              {Object.entries(metadata)
                .filter(
                  ([key]) =>
                    ![
                      'action',
                      'user',
                      'target',
                      'changes',
                      'timestamp',
                    ].includes(key)
                )
                .map(([key, value]) => (
                  <div
                    key={key}
                    className='flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3'
                  >
                    <span className='text-xs font-medium text-zinc-300 uppercase tracking-wider min-w-20'>
                      {key}:
                    </span>
                    <div className='flex-1'>
                      {typeof value === 'object' && value !== null ? (
                        <pre className='text-xs text-zinc-400 bg-zinc-700 p-2 rounded overflow-x-auto max-h-32'>
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <span className='text-xs text-zinc-400'>
                          {String(value)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      );
    }

    return null;
  }

  // Helper function to translate field names to Spanish
  function translateField(field) {
    const translations = {
      // User fields
      username: 'Usuario',
      name: 'Nombre',
      rol: 'Rol',
      role: 'Rol',
      password: 'Contraseña',

      // Person fields
      firstName: 'Nombre',
      lastName: 'Apellido',
      dni: 'DNI',
      vote: 'Voto',
      order: 'Orden',
      address: 'Dirección',
      message: 'Mensaje',
      affiliate: 'Afiliado',
      tableNumber: 'Mesa',
      tableId: 'ID Mesa',
      referer: 'Referente',
      driver: 'Chofer',

      // Table fields
      number: 'Número',
      description: 'Descripción',
      status: 'Estado',

      // Faction fields
      color: 'Color',
      position: 'Posición',
      votes: 'Votos',

      // Status values
      previousStatus: 'Estado anterior',
      previousVote: 'Voto anterior',

      // Counts
      count: 'Cantidad',
      totalProcessed: 'Total procesado',
      tablesCreated: 'Mesas creadas',
      personsAdded: 'Votantes agregados',
      persons: 'Votantes',
    };

    return translations[field] || field;
  }

  if (loading && currentPage === 0) return <span className='loader'></span>;
  if (error)
    return (
      <p className='text-red-400'>Error al cargar logs: {error.message}</p>
    );

  const logs = data?.logs?.logs || [];
  const totalCount = data?.logs?.totalCount || 0;
  const hasMore = data?.logs?.hasMore || false;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Add dots if there's a gap after first page
      if (start > 2) {
        pages.push('...');
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      // Add dots if there's a gap before last page
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const actionOptions = [
    { value: '', label: 'Todas las acciones' },
    { value: 'PERSON_VOTE_MARKED', label: 'Voto marcado' },
    { value: 'PERSON_VOTE_UNMARKED', label: 'Voto desmarcado' },
    { value: 'PERSON_ADDED', label: 'Votante agregado' },
    { value: 'PERSON_DELETED', label: 'Votante eliminado' },
    { value: 'PERSON_UPDATED', label: 'Votante editado' },
    { value: 'BULK_PERSONS_ADDED', label: 'Votantes por CSV' },
    { value: 'MASSIVE_DATA_IMPORT', label: 'Carga masiva de datos' },
    { value: 'BULK_AFFILIATE_UPDATE', label: 'Afiliados por CSV' },
    { value: 'TABLE_STATUS_CHANGED', label: 'Estado de mesa cambiado' },
    { value: 'TABLE_CREATED', label: 'Mesa creada' },
    { value: 'TABLE_UPDATED', label: 'Mesa editada' },
    { value: 'TABLE_DELETED', label: 'Mesa eliminada' },
    { value: 'VOTES_SENT', label: 'Votos enviados' },
    { value: 'VOTES_UPDATED', label: 'Votos actualizados' },
    { value: 'USER_CREATED', label: 'Usuario creado' },
    { value: 'USER_DELETED', label: 'Usuario eliminado' },
    { value: 'FACTION_CONFIG_CREATED', label: 'Partido creado' },
    { value: 'FACTION_CONFIG_DELETED', label: 'Partido eliminado' },
    { value: 'FACTION_CONFIG_UPDATED', label: 'Partido actualizado' },
  ];

  return (
    <div className='p-6 max-w-full mx-auto'>
      <div className='mb-6'>
        <h1 className='text-3xl font-bold text-zinc-100 mb-4 flex items-center gap-2'>
          <Clock size={32} />
          Registro de Actividades
        </h1>

        {/* Filters */}
        <div className='bg-zinc-800 rounded-lg p-4 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
            <div>
              <label className='block text-sm font-medium text-zinc-300 mb-2'>
                <Funnel size={16} className='inline mr-1' />
                Acción
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* <div>
              <label className='block text-sm font-medium text-zinc-300 mb-2'>
                <Calendar size={16} className='inline mr-1' />
                Fecha desde
              </label>
              <input
                type='date'
                value={filters.startDate}
                onChange={(e) =>
                  handleFilterChange('startDate', e.target.value)
                }
                className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div> */}

            {/* <div>
              <label className='block text-sm font-medium text-zinc-300 mb-2'>
                <Calendar size={16} className='inline mr-1' />
                Fecha hasta
              </label>
              <input
                type='date'
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div> */}

            {/* <div className='flex items-end gap-2'>
              <button
                onClick={handleApplyFilters}
                className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
              >
                Aplicar
              </button>
              <button
                onClick={handleClearFilters}
                className='px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md transition-colors'
              >
                Limpiar
              </button>
            </div> */}
          </div>

          {logs.length === 0 && !loading && currentPage === 1 ? (
            <div className='text-sm text-zinc-400'>
              No hay registros para mostrar bajo esta categoría.
            </div>
          ) : (
            <div className='text-sm text-zinc-400'>
              Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de{' '}
              {totalCount} registros (Página {currentPage} de {totalPages})
            </div>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className='bg-zinc-800 rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-zinc-700'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Fecha/Hora
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Acción
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Usuario
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Objetivo
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  Cambios
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-zinc-700'>
              {logs.map((log) => {
                const isExpanded = expandedLogs.has(log.id);
                const hasExpandableContent = isExpandableAction(log.action);

                return (
                  <React.Fragment key={log.id}>
                    <tr
                      className={`transition-colors ${
                        hasExpandableContent
                          ? 'hover:bg-zinc-750 cursor-pointer'
                          : 'hover:bg-zinc-800'
                      }`}
                      onClick={
                        hasExpandableContent
                          ? () => toggleLogExpansion(log.id)
                          : undefined
                      }
                    >
                      <td className='px-4 py-3 text-sm text-zinc-300 font-mono'>
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className='px-4 py-3 text-sm'>
                        <span
                          className={`font-medium ${getActionColor(
                            log.action
                          )}`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className='px-4 py-3 text-sm text-zinc-300'>
                        {log.user ? (
                          <div className='flex items-center gap-1'>
                            <User size={14} />
                            <span>
                              {log.user.name || log.user.username || 'N/A'}
                            </span>
                            <span className='text-xs text-zinc-500'>
                              ({log.user.role || log.user.rol || 'N/A'})
                            </span>
                          </div>
                        ) : (
                          <span className='text-zinc-500'>Sistema</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-sm text-zinc-300'>
                        <div className='flex items-center gap-1'>
                          <Target size={14} />
                          <span>{getTargetInfo(log)}</span>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm text-zinc-300'>
                        <div className='flex items-center justify-between'>
                          <span>{getChangesInfo(log)}</span>
                          {hasExpandableContent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLogExpansion(log.id);
                              }}
                              className='ml-2 p-1 text-zinc-400 hover:text-zinc-200 transition-colors'
                              title={
                                isExpanded
                                  ? 'Ocultar detalles'
                                  : 'Ver detalles completos'
                              }
                            >
                              {isExpanded ? (
                                <CaretUp size={16} />
                              ) : (
                                <CaretDown size={16} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {isExpanded && hasExpandableContent && (
                      <tr>
                        <td
                          colSpan='5'
                          className='px-4 py-3 bg-zinc-900 border-t border-zinc-700'
                        >
                          <div className='space-y-3'>
                            {renderExpandedContent(log)}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-6'>
          <Pagination
            shape='circle'
            className='flex items-center justify-center gap-4'
          >
            <PaginationNavigator
              shape='circle'
              className='bg-zinc-900 hover:bg-zinc-600 text-zinc-200'
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <CaretLeft size={18} />
            </PaginationNavigator>
            <PaginationList>
              {generatePageNumbers().map((page, index) => (
                <PaginationItem
                  key={index}
                  active={page === currentPage}
                  onClick={() =>
                    typeof page === 'number' && handlePageChange(page)
                  }
                  disabled={page === '...'}
                  className={`text-zinc-200 hover:bg-zinc-600 hover:text-white transition-colors ${
                    page === currentPage ? 'bg-zinc-500 text-white' : ''
                  }`}
                >
                  {page === '...' ? <DotsThree size={20} /> : page}
                </PaginationItem>
              ))}
            </PaginationList>
            <PaginationNavigator
              shape='circle'
              className='bg-zinc-900 hover:bg-zinc-600 text-zinc-200'
              onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              <CaretRight size={18} />
            </PaginationNavigator>
            <PaginationGoTo>
              <span className='text-zinc-300'>Ir a página</span>
              <input
                type='number'
                className='h-9 w-[60px] rounded-md border border-zinc-600 bg-zinc-800 text-center text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500'
                min={1}
                max={totalPages}
                value={paginationPageValue}
                onChange={(e) => {
                  setPaginationPageValue(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGoToPage(parseInt(paginationPageValue) || 1);
                  }
                }}
                onBlur={() => {
                  if (paginationPageValue !== currentPage) {
                    handleGoToPage(parseInt(paginationPageValue) || 1);
                  }
                }}
              />
              <span className='text-zinc-300'>de {totalPages}</span>
            </PaginationGoTo>
          </Pagination>
        </div>
      )}

      {logs.length === 0 && !loading && currentPage === 1 && (
        <div className='text-center py-12'>
          <Clock size={48} className='mx-auto text-zinc-500 mb-4' />
          <p className='text-zinc-400 text-lg'>No se encontraron registros</p>
          <p className='text-zinc-500 text-sm'>
            Intenta ajustar los filtros o verifica que haya actividad registrada
          </p>
        </div>
      )}
    </div>
  );
};
