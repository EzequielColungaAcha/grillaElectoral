import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Calendar } from '@phosphor-icons/react';

export const MultiFileTable = ({
  persons,
  fileMetadata,
  search,
  setSearch,
}) => {
  const [sortBy, setSortBy] = useState('lastName'); // 'lastName', 'firstName', 'dni', 'tableNumber'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Filter and sort persons
  const filteredAndSortedPersons = useMemo(() => {
    let filtered = persons;

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = persons.filter(
        (person) =>
          person.firstName.toLowerCase().includes(searchLower) ||
          person.lastName.toLowerCase().includes(searchLower) ||
          person.dni.includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle numeric sorting for tableNumber
      if (sortBy === 'tableNumber') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else {
        // Handle string sorting
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [persons, search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const renderVotingBadges = (votingHistory) => {
    return (
      <div className='flex flex-wrap gap-1'>
        {votingHistory.map((vote, index) => {
          const fileInfo = fileMetadata.find((f) => f.date === vote.date);
          const date = new Date(vote.date);
          const displayDate = `${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;

          // Get voting time if available
          let votingTime = '';
          if (vote.voted && vote.updatedAt) {
            try {
              let ts = Number(vote.updatedAt);

              // If it's in seconds, convert to ms
              if (ts < 1e12) {
                ts = ts * 1000;
              }

              const voteDate = new Date(ts);

              if (!isNaN(voteDate.getTime())) {
                votingTime = voteDate.toLocaleTimeString('es-AR', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                  timeZone: 'America/Argentina/Buenos_Aires',
                });
              }
            } catch (error) {
              console.log('error parsing', error);
            }
          }

          return (
            <div key={index} className='flex flex-col items-center gap-1'>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  vote.voted
                    ? 'bg-green-800 text-green-200'
                    : 'bg-red-800 text-red-200'
                }`}
                title={`${
                  fileInfo
                    ? fileInfo.displayDate
                    : new Date(vote.date).toLocaleDateString('es-AR')
                } - ${vote.voted ? 'Votó' : 'No votó'}`}
              >
                {vote.voted ? <CheckCircle size={12} /> : <XCircle size={12} />}
                <span>{displayDate}</span>
              </div>
              <div className='h-4 flex items-center justify-center'>
                {votingTime && (
                  <span className='text-xs text-zinc-400'>{votingTime}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className='w-full max-w-7xl'>
      {/* Search */}
      <div className='mb-6 flex justify-center'>
        <div className='relative max-w-md w-full'>
          <input
            type='text'
            placeholder='Buscar por nombre, apellido o DNI...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full px-4 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-500'
          />
        </div>
      </div>

      {/* Results count */}
      <div className='text-center mb-4 text-zinc-300'>
        {search ? (
          <>
            Resultados de búsqueda: {filteredAndSortedPersons.length} de{' '}
            {persons.length} registros
            <button
              onClick={() => setSearch('')}
              className='ml-4 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm'
            >
              Limpiar búsqueda
            </button>
          </>
        ) : (
          `Mostrando ${filteredAndSortedPersons.length} registros`
        )}
      </div>

      {/* Table */}
      <div className='bg-zinc-800 rounded-lg overflow-hidden shadow-lg'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-zinc-700'>
              <tr>
                <th
                  className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-600'
                  onClick={() => handleSort('lastName')}
                >
                  Apellido {getSortIcon('lastName')}
                </th>
                <th
                  className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-600'
                  onClick={() => handleSort('firstName')}
                >
                  Nombre {getSortIcon('firstName')}
                </th>
                <th
                  className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider cursor-pointer hover:bg-zinc-600'
                  onClick={() => handleSort('dni')}
                >
                  DNI {getSortIcon('dni')}
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider'>
                  <Calendar size={16} className='inline mr-1' />
                  Historial de Votación
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-zinc-700'>
              {filteredAndSortedPersons.map((person, index) => (
                <tr
                  key={`${person.dni}-${index}`}
                  className='hover:bg-zinc-750'
                >
                  <td className='px-4 py-3 text-sm text-zinc-300 uppercase'>
                    {person.lastName}
                  </td>
                  <td className='px-4 py-3 text-sm text-zinc-300 uppercase'>
                    {person.firstName}
                  </td>
                  <td className='px-4 py-3 text-sm text-zinc-300'>
                    {person.dni}
                  </td>
                  <td className='px-4 py-3'>
                    {renderVotingBadges(person.votingHistory)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedPersons.length === 0 && (
        <div className='text-center py-12'>
          <p className='text-zinc-400 text-lg'>No se encontraron registros</p>
          {search && (
            <p className='text-zinc-500 text-sm mt-2'>
              Intenta con otros términos de búsqueda
            </p>
          )}
        </div>
      )}
    </div>
  );
};
