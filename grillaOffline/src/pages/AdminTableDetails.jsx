import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDB } from '../context/dbContext';
import { URL } from '../config';

export function AdminTableDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getRecord, getRecordsByIndex, isDBReady } = useDB();

  const loadTable = async () => {
    if (!isDBReady || !params.id) return;

    try {
      const tableData = await getRecord('tables', params.id);
      if (!tableData) {
        navigate(`${URL}/admin/tables`);
        return;
      }

      const persons = await getRecordsByIndex('persons', 'tableId', params.id);

      setTable({
        ...tableData,
        persons: persons.sort((a, b) => a.order - b.order),
      });
    } catch (error) {
      console.error('Error loading table:', error);
      navigate(`${URL}/admin/tables`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTable();
  }, [params.id, isDBReady]);

  if (loading) return <span className='loader'></span>;
  if (!table) return navigate(`${URL}/admin/tables`);

  return (
    <div className='rounded-lg shadow-lg shadow-black p-2 h-full w-full'>
      <div className='bg-zinc-900 mb-2 p-10 max-w-2xl m-auto'>
        <h1 className='text-3xl'>Mesa {table.number}</h1>
        {table.description && <p>{table.description}</p>}
        <p>Estado: {table.status}</p>
        <p>Total personas: {table.persons.length}</p>
        <p>Votaron: {table.persons.filter((p) => p.vote).length}</p>
      </div>

      <div className='flex items-center justify-center'>
        <table className='w-fit'>
          <thead>
            <tr>
              <th className='border-b-2 border-white p-2 w-16'>Orden</th>
              <th className='border-b-2 border-white p-2 w-64'>Apellido/s</th>
              <th className='border-b-2 border-white p-2 w-64'>Nombre/s</th>
              <th className='border-b-2 border-white p-2 w-32'>DNI</th>
              <th className='border-b-2 border-white p-2 w-40'>Votó?</th>
            </tr>
          </thead>
          <tbody>
            {table.persons.map((person) => (
              <tr
                key={person._id}
                className='mb-2 items-center text-center border-2 border-white'
              >
                <td
                  className={`px-1 ${
                    person.vote ? 'bg-green-800' : 'bg-red-800'
                  }`}
                >
                  {person.order}
                </td>
                <td
                  className={`px-1 uppercase ${
                    person.vote ? 'bg-green-800' : 'bg-red-800'
                  }`}
                >
                  {person.lastName}
                </td>
                <td
                  className={`px-1 uppercase ${
                    person.vote ? 'bg-green-800' : 'bg-red-800'
                  }`}
                >
                  {person.firstName}
                </td>
                <td
                  className={`px-1 ${
                    person.vote ? 'bg-green-800' : 'bg-red-800'
                  }`}
                >
                  {person.dni}
                </td>
                <td
                  className={`px-1 my-2 py-1 ${
                    person.vote ? 'bg-green-800' : 'bg-red-800'
                  }`}
                >
                  {person.vote ? 'Votó' : 'No votó'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
