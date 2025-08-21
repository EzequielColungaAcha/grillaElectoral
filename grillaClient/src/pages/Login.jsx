import { useState, useContext } from 'react';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/users';
import { AuthContext } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'keep-react';

export const Login = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    username: '',
    password: '',
  });

  const onChange = (event) => {
    // Clear errors when user starts typing
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const [loginUser, { loading }] = useMutation(LOGIN_MUTATION, {
    update(_, { data: { loginUser: userData } }) {
      context.login(userData);
      toast.success('Sesión iniciada correctamente');
      navigate('/');
    },
    onError(err) {
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        setErrors({ message: err.graphQLErrors[0].message });
      } else if (err.networkError) {
        setErrors({ message: 'Error de conexión' });
      } else {
        setErrors({ message: err.message || 'Error desconocido' });
      }
    },
    variables: { loginInput: values },
  });

  const onSubmit = (event) => {
    event.preventDefault();
    // Clear errors when submitting
    setErrors({});
    loginUser();
  };

  return (
    <div className='flex justify-center h-screen items-center'>
      <div className='bg-zinc-800 w-full max-w-md p-8 rounded-lg shadow-lg'>
        <h1 className='text-2xl font-bold mb-6 text-center text-white'>
          Iniciar Sesión
        </h1>
        <form onSubmit={onSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Usuario
            </label>
            <input
              type='text'
              name='username'
              value={values.username}
              onChange={onChange}
              className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-300 mb-2'>
              Contraseña
            </label>
            <input
              type='password'
              name='password'
              value={values.password}
              onChange={onChange}
              className='w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200'
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          {errors.message === 'Incorrect Usuario o Contraseña' ? (
            <p className='text-red-400 text-sm text-center'>
              Usuario o Contraseña Inconrrectos
            </p>
          ) : (
            <p className='text-red-400 text-sm text-center'>{errors.message}</p>
          )}
        </form>
      </div>
    </div>
  );
};
