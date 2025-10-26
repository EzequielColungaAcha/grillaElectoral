import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../context/dbContext';
import { AddUser } from '../components/admin/adminUsers/AddUser';
import { Login } from '../components/login/Login';
import { URL } from '../config';

export const Register = () => {
  const [usersCount, setUsersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { countRecords, isDBReady } = useDB();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUsers = async () => {
      if (!isDBReady) return;

      try {
        const count = await countRecords('users');
        setUsersCount(count);
      } catch (error) {
        console.error('Error checking users:', error);
        navigate(URL);
      } finally {
        setLoading(false);
      }
    };

    checkUsers();
  }, [isDBReady, countRecords, navigate]);

  if (loading) return <span className='loader'></span>;

  if (usersCount === 0) {
    return (
      <div>
        <div className='flex items-center justify-center mt-10'>
          <AddUser firstUser={true} />
        </div>
      </div>
    );
  } else {
    return <Login />;
  }
};
