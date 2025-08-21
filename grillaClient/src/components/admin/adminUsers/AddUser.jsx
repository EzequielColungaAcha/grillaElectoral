import { useMutation } from '@apollo/client';
import { ImUserPlus } from 'react-icons/im';
import { ADD_USER } from '../../../graphql/users';
import { useState } from 'react';
import { FormModal } from '../../modals/FormModal';
import { toast } from 'keep-react';
import { useNavigate } from 'react-router-dom';

export const AddUser = ({ firstUser }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addUser] = useMutation(ADD_USER);

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await addUser({
        variables: {
          registerInput: {
            username: formData.username,
            name: formData.name,
            password: formData.password,
            rol: firstUser ? 'admin' : formData.rol,
          },
        },
      });

      if (response.data.registerUser._id) {
        toast.success('Usuario creado correctamente');
        setShowModal(false);
        if (firstUser) {
          navigate('/');
        }
      }
    } catch (error) {
      toast.error('Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = firstUser
    ? [{ value: 'admin', label: 'Admin' }]
    : [
        { value: 'fiscal', label: 'Fiscal' },
        { value: 'prensa', label: 'Prensa' },
        { value: 'base', label: 'Base' },
        { value: 'admin', label: 'Admin' },
      ];

  const formFields = [
    { name: 'username', label: 'Usuario', type: 'text', required: true },
    { name: 'name', label: 'Apellido y Nombre', type: 'text', required: true },
    { name: 'password', label: 'Contraseña', type: 'password', required: true },
    {
      name: 'rol',
      label: 'Permisos',
      type: 'select',
      options: roleOptions,
      required: true,
    },
  ];

  return (
    <>
      <button
        className='p-3 bg-zinc-600 rounded flex items-center gap-2 disabled:hidden hover:bg-zinc-500'
        onClick={() => setShowModal(true)}
      >
        <ImUserPlus className='text-xl fill-white' /> Añadir Usuario
      </button>

      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        title='Añadir Usuario'
        fields={formFields}
        loading={loading}
        submitText='Crear'
      />
    </>
  );
};
