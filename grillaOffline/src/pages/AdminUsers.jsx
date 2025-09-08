import React, { useState, useEffect } from 'react';
import { useDB } from '../context/dbContext';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, subscribe, isDBReady } = useDB();

  const loadUsers = async () => {
    if (!isDBReady) return;

    try {
      const usersData = await getAllRecords('users');
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();

    // Subscribe to changes
    const unsubscribeAdded = subscribe('users_added', loadUsers);
    const unsubscribeDeleted = subscribe('users_deleted', loadUsers);

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
    };
  }, [isDBReady]);

  if (loading) return <span className='loader'></span>;

  return (
    <div>
      <div className='flex items-center justify-center mb-5'>
        <p className='text-xl'>Administración de Usuarios - Modo Offline</p>
        <p className='text-sm text-slate-300 ml-4'>
          Solo administradores tienen acceso
        </p>
      </div>
      <div className='h-full w-full px-5 flex flex-col items-center'>
        {users.length === 0 ? (
          <div className='bg-zinc-800 w-full max-w-2xl rounded-lg shadow-lg shadow-black p-4 mb-2 text-center'>
            <p className='text-slate-300'>
              No hay usuarios registrados en la base de datos local.
            </p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className='flex justify-between bg-zinc-800 w-full rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 items-center max-w-2xl'
            >
              <div className='flex flex-col gap-3'>
                <h2 className='text-xl font-medium'>
                  Usuario: {user.username}
                </h2>
                <h2 className='text-xl font-medium'>
                  Nombre/Apellido: {user.name}
                </h2>
                <h2 className='text-xl font-medium'>
                  Rol: <span className='capitalize'>{user.rol}</span>
                </h2>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
