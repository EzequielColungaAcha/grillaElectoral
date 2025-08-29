import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_TABLE } from '../graphql/tables.js';
import {
  TABLE_CHANGED,
  PERSON_ADDED,
  PERSON_DELETED,
  USER_TABLE_ASSIGNMENT_UPDATED,
} from '../graphql/subscription.js';
import { PersonFormModal } from '../components/form/ReactHookForm.jsx';
import {
  ButtonCloseTable,
  ButtonBackToTables,
} from '../components/tables/Buttons.jsx';
import { StatusCerrada } from '../components/tables/tableDetails/StatusCerrada.jsx';
import { StatusDatosEnviados } from '../components/tables/tableDetails/StatusDatosEnviados.jsx';
import PersonsTable from '../components/persons/PersonsTable.jsx';
import { Hash } from 'phosphor-react';
import { InputIcon, Input } from 'keep-react';
import { AuthContext } from '../context/authContext.jsx';
import { useContext } from 'react';

export function TableDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useContext(AuthContext);
  const hashBrowser = import.meta.env.VITE_HASH_BROWSER;

  const { data, loading, error, refetch } = useQuery(GET_TABLE, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
  });

  const { data: personDeleted } = useSubscription(PERSON_DELETED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: personAdded } = useSubscription(PERSON_ADDED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: tableChanged } = useSubscription(TABLE_CHANGED);

  // Subscribe to user table assignment updates
  const { data: userTableAssignmentUpdated } = useSubscription(
    USER_TABLE_ASSIGNMENT_UPDATED,
    {
      onData: (data) => {
        const updatedUser = data.data.data.userTableAssignmentUpdated;

        if (updatedUser && user && updatedUser._id === user.user_id) {
          // Update the user data in context
          updateUser({
            assignedTable: updatedUser.assignedTable,
          });

          // Check if user should be redirected
          if (user.rol === 'fiscal') {
            if (updatedUser.assignedTable) {
              // User has assigned table - check if they're on the wrong table
              if (updatedUser.assignedTable._id !== params.id) {
                const tableUrl = `${hashBrowser === 'true' ? '#/' : '/'}mesas/${
                  updatedUser.assignedTable._id
                }`;
                navigate(tableUrl, { replace: true });
              }
            } else {
              // User became Fiscal General - redirect to all tables
              const tablesUrl = `${hashBrowser === 'true' ? '#/' : '/'}mesas`;
              navigate(tablesUrl, { replace: true });
            }
          }
        }
      },
    }
  );

  const [search, setSearch] = useState('');

  if (loading) return <span className='loader'></span>;
  if (error) return navigate('/');

  const filteredPersons = data.table.persons.filter((person) => {
    return search === '' ? person : person.order == search;
  });

  if (data.table.status == 'Abierta') {
    const totalVotes = data.table.persons.filter(
      (person) => person.vote == true
    ).length;
    const personsLength = data.table.persons.length;
    const votePercent = ((totalVotes / personsLength) * 100).toFixed(2);
    return (
      <div className='bg-zinc-800 shadow-lg shadow-black p-2 h-full w-full'>
        <div className='flex justify-between items-center'>
          <ButtonBackToTables />
          <ButtonCloseTable table={data.table} search={setSearch} />
        </div>
        <div className='bg-zinc-900 mb-2 p-10 flex flex-col rounded-lg justify-between max-w-2xl m-auto'>
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
                  <h1 className='text-3xl'>Mesa {data.table.number}</h1>
                  <small>
                    {data.table.description ? data.table.description : ''}
                  </small>
                  <h2 className='text-lg'>
                    {totalVotes} / {personsLength} (
                    {isNaN(votePercent) ? '0.00' : votePercent}
                    %)
                  </h2>
                </div>
              </div>
              <div>
                <PersonFormModal
                  tableId={data.table._id}
                  tableNumber={data.table.number}
                />
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
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value.toLowerCase());
                  }}
                  placeholder='Nro de Orden'
                  className='ps-11 bg-zinc-800 text-zinc-200 focus-visible:ring-0 focus-visible:ring-offset-1 focus-visible:ring-zinc-500'
                />
                <InputIcon>
                  <Hash size={19} color='#AFBACA' />
                </InputIcon>
              </fieldset>
            </form>
          </div>
        </div>
        <PersonsTable persons={filteredPersons} />
        <div className='flex justify-center mt-5'>
          <ButtonCloseTable table={data.table} search={setSearch} />
        </div>
      </div>
    );
  } else if (
    data.table.status == 'Cerrada' &&
    data.table.factions.length == 0
  ) {
    return <StatusCerrada table={data.table} />;
  } else {
    return <StatusDatosEnviados table={data.table} />;
  }
}
