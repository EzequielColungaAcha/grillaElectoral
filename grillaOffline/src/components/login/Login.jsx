import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../../context/dbContext';
import { useAuth } from '../../context/simpleAuthContext';
import { URL } from '../../config';


export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { importData } = useDB();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Por favor selecciona un archivo JSON válido.');
      return;
    }

    setLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate JSON structure
        if (!jsonData.tables || !Array.isArray(jsonData.tables)) {
          throw new Error('Estructura de archivo inválida');
        }

        await importData(jsonData);

        login();
        navigate(URL);
      } catch (error) {
        console.error('Error importing data:', error);
        setError('El archivo JSON no tiene el formato correcto o está corrupto.');
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError('No se pudo leer el archivo seleccionado.');
      setLoading(false);
    };

    reader.readAsText(file);
  };

  return (
    <div className='h-full w-full py-3 flex flex-col justify-center sm:py-3'>
      <div className='relative py-3 sm:max-w-xl sm:mx-auto'>
        <div className='relative px-4 py-10 bg-zinc-600 shadow-md sm:rounded-3xl sm:p-10 border-2 border-zinc-400 shadow-zinc-400'>
          <div className='max-w-md mx-auto'>
            <div>
              <h1 className='text-2xl font-semibold text-zinc-100 mb-5 text-center'>
                Grilla Electoral - Modo Offline
              </h1>
            </div>
            <div className='divide-y divide-gray-200'>
              <div className='py-3 px-5 text-base leading-6 space-y-4 text-zinc-50 sm:text-lg sm:leading-7'>
                <div className='text-center mb-6'>
                  <p className='text-zinc-200 mb-4'>
                    Para acceder al sistema, importa un archivo JSON con los
                    datos electorales.
                  </p>
                  <p className='text-zinc-300 text-sm mb-6'>
                    El archivo debe ser exportado desde la versión online de
                    Grilla Electoral.
                  </p>
                </div>

                <div className='relative flex flex-col items-center'>
                  <label
                    htmlFor='jsonFile'
                    className={`cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white rounded-md px-6 py-3 transition-colors ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Importando...' : 'Seleccionar archivo JSON'}
                  </label>
                  <input
                    id='jsonFile'
                    type='file'
                    accept='.json'
                    onChange={handleFileImport}
                    disabled={loading}
                    className='hidden'
                  />
                </div>

                {error && (
                  <div className='text-center mt-4'>
                    <p className='text-red-400 text-sm'>{error}</p>
                  </div>
                )}

                {loading && (
                  <div className='flex justify-center mt-4'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
                  </div>
                )}

                <div className='text-center mt-6'>
                  <p className='text-zinc-300 text-xs'>
                    Una vez importado correctamente, tendrás acceso completo
                    como administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
