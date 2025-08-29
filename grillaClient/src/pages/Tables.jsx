import { TableList } from '../components/tables/TableList';
import { useQuery, useSubscription } from '@apollo/client';
import { GET_TABLES, GET_TABLES_FOR_FISCAL } from '../graphql/tables';
import {
  TABLE_ADDED,
  TABLE_DELETED,
  USER_TABLE_ASSIGNMENT_UPDATED,
} from '../graphql/subscription';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';

export function Tables() {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const hashBrowser = import.meta.env.VITE_HASH_BROWSER;

  // Determine which query to use based on user role
  const isFiscal = user?.rol === 'fiscal';
  const fiscalTableId = user?.assignedTable?._id;

  // Redirect fiscal users with assigned tables to their specific table
  useEffect(() => {
    if (isFiscal && fiscalTableId) {
      const tableUrl = `${
        hashBrowser === 'true' ? '#/' : '/'
      }mesas/${fiscalTableId}`;
      navigate(tableUrl, { replace: true });
    }
  }, [isFiscal, fiscalTableId, navigate, hashBrowser]);

  const { loading, error, data, refetch } = useQuery(
    isFiscal ? GET_TABLES_FOR_FISCAL : GET_TABLES,
    {
      variables: isFiscal ? { tableId: fiscalTableId } : {},
    }
  );

  const { data: tableAdded } = useSubscription(TABLE_ADDED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });
  const { data: tableDeleted } = useSubscription(TABLE_DELETED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

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
              // User has assigned table - redirect to it
              const tableUrl = `${hashBrowser === 'true' ? '#/' : '/'}mesas/${
                updatedUser.assignedTable._id
              }`;
              navigate(tableUrl, { replace: true });
            }
            // If no assigned table, user can stay on tables list (Fiscal General)
          }
        }
      },
    }
  );

  // Don't render if fiscal user should be redirected
  if (isFiscal && fiscalTableId) {
    return null;
  }

  if (loading) return <span className='loader'></span>;
  if (error) return <p>Error</p>;

  // Determine title based on user type
  const getTitle = () => {
    if (isFiscal) {
      if (fiscalTableId) {
        const tableNumber = user.assignedTable?.number;
        return `Mesa ${tableNumber} - Fiscal Asignado`;
      } else {
        return 'Todas las Mesas - Fiscal General';
      }
    }
    return 'Mesas';
  };
  return data.tables.length ? (
    <div className='bg-zinc-900 shadow-black p-8 h-full w-full'>
      <h1 className='text-4xl font-bold py-2 mb-4 text-center underline underline-offset-4 text-zinc-100'>
        {getTitle()}
      </h1>
      <div className='flex justify-between gap-x-1'>
        <TableList data={data} />
      </div>
    </div>
  ) : (
    <div className='bg-zinc-900 shadow-black p-8 h-full w-full'>
      <h1 className='text-4xl font-bold py-2 mb-4 text-center text-zinc-100'>
        {isFiscal && fiscalTableId
          ? 'Mesa no encontrada'
          : 'Aún no hay mesas cargadas'}
      </h1>
    </div>
  );
}
