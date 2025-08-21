import React from 'react';
import TableBody from './TableBody';

const Table = ({
  persons,
  loading,
  error,
  onLoadMore,
  isLoadingMore,
  onPersonClick,
  isSearching,
}) => {
  const [data, setData] = React.useState();

  React.useEffect(() => {
    if (!persons || !Array.isArray(persons)) return;
    setData(persons);
  }, [persons]);

  if (error) return <p>Error...</p>;

  // Add safety check for data
  if (!data || !Array.isArray(data)) {
    return (
      <div className='text-center text-zinc-300'>No hay datos disponibles</div>
    );
  }

  return (
    <div className='flex flex-col w-full relative'>
      {(loading || isSearching) && (
        <div className='absolute inset-0 bg-zinc-900 bg-opacity-75 flex items-center justify-center z-10 rounded-lg'>
          <div className='flex flex-col items-center gap-3'>
            <span className='loader'></span>
            <span className='text-zinc-300 text-sm'>
              {isSearching ? 'Buscando...' : 'Cargando...'}
            </span>
          </div>
        </div>
      )}
      <table className='border border-zinc-200'>
        <thead className='sticky top-0 bg-zinc-800'>
          <tr>
            <th
              scope='col'
              className='px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell'
            >
              Mesa
            </th>
            <th
              scope='col'
              className='px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell'
            >
              Orden
            </th>
            <th
              scope='col'
              className='px-5 py-2 font-medium text-white uppercase text-center'
            >
              Apellido
            </th>
            <th
              scope='col'
              className='px-5 py-2 font-medium text-white uppercase text-center'
            >
              Nombre
            </th>
            <th
              scope='col'
              className='px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell'
            >
              DNI
            </th>
            <th
              scope='col'
              className='px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell'
            >
              Voto
            </th>
          </tr>
        </thead>

        <TableBody
          data={data}
          onLoadMore={onLoadMore}
          onPersonClick={onPersonClick}
          loading={loading}
        />
      </table>

      {/* Load more button at the bottom */}
      {onLoadMore && (
        <div className='flex justify-center mt-4'>
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className='px-6 py-3 bg-zinc-600 hover:bg-zinc-500 rounded disabled:opacity-50 text-white'
          >
            {isLoadingMore ? 'Cargando más...' : 'Cargar más registros'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
