import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../../context/dbContext';
import { useAuth } from '../../context/simpleAuthContext';
import { URL } from '../../config';
import { Calendar, Users } from '@phosphor-icons/react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { importData } = useDB();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importMode, setImportMode] = useState('single'); // 'single' or 'multi'
  const [multiFileLoading, setMultiFileLoading] = useState(false);
  const [multiFileError, setMultiFileError] = useState('');

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
        setError(
          'El archivo JSON no tiene el formato correcto o está corrupto.'
        );
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

  const handleMultiFileImport = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate all files are JSON
    const invalidFiles = files.filter((file) => !file.name.endsWith('.json'));
    if (invalidFiles.length > 0) {
      setMultiFileError('Todos los archivos deben ser JSON válidos.');
      return;
    }

    setMultiFileLoading(true);
    setMultiFileError('');

    try {
      const allPersonsData = [];
      const fileMetadata = [];

      // Process each file
      for (const file of files) {
        const fileContent = await readFileAsText(file);
        const jsonData = JSON.parse(fileContent);

        // Extract date from filename or use file modification date
        const dateMatch = file.name.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        let fileDate;
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          fileDate = `${year}-${month.padStart(2, '0')}-${day.padStart(
            2,
            '0'
          )}`;
        } else {
          fileDate = new Date(file.lastModified).toISOString().split('T')[0];
        }

        fileMetadata.push({
          filename: file.name,
          date: fileDate,
          displayDate: new Date(fileDate).toLocaleDateString('es-AR'),
        });

        // Extract persons from all tables
        if (jsonData.tables && Array.isArray(jsonData.tables)) {
          jsonData.tables.forEach((table) => {
            if (table.persons && Array.isArray(table.persons)) {
              table.persons.forEach((person) => {
                allPersonsData.push({
                  ...person,
                  fileDate: fileDate,
                  filename: file.name,
                });
              });
            }
          });
        }
      }

      // Group persons by DNI and merge voting history
      const personsMap = new Map();

      allPersonsData.forEach((person) => {
        const key = person.dni;
        if (!personsMap.has(key)) {
          personsMap.set(key, {
            dni: person.dni,
            firstName: person.firstName,
            lastName: person.lastName,
            tableNumber: person.tableNumber,
            order: person.order,
            votingHistory: [],
          });
        }

        const existingPerson = personsMap.get(key);
        existingPerson.votingHistory.push({
          date: person.fileDate,
          filename: person.filename,
          voted: person.vote,
          updatedAt: person.updatedAt,
        });
      });

      // Sort voting history by date
      personsMap.forEach((person) => {
        person.votingHistory.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );
      });

      // Store the processed data
      const multiFileData = {
        persons: Array.from(personsMap.values()),
        fileMetadata: fileMetadata.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
        importDate: new Date().toISOString(),
        importType: 'multi-file',
      };

      // Store in a special collection for multi-file imports
      await importData({ multiFileImport: multiFileData });

      // Set a flag to indicate multi-file mode
      localStorage.setItem('importMode', 'multi-file');

      login();
      navigate(URL);
    } catch (error) {
      console.error('Error importing multi-file data:', error);
      setMultiFileError(
        'Error al procesar los archivos. Verifica que todos sean JSON válidos.'
      );
    } finally {
      setMultiFileLoading(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
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

            {/* Import Mode Selection */}
            <div className='mb-6'>
              <div className='flex justify-center gap-4 mb-4'>
                <button
                  onClick={() => setImportMode('single')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    importMode === 'single'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-500 text-zinc-200 hover:bg-zinc-600'
                  }`}
                >
                  <Users size={20} className='inline mr-2' />
                  Importación Completa
                </button>
                <button
                  onClick={() => setImportMode('multi')}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    importMode === 'multi'
                      ? 'bg-zinc-700 text-white'
                      : 'bg-zinc-500 text-zinc-200 hover:bg-zinc-600'
                  }`}
                >
                  <Calendar size={20} className='inline mr-2' />
                  Historial de Votación
                </button>
              </div>
            </div>

            <div className='divide-y divide-gray-200'>
              <div className='py-3 px-5 text-base leading-6 space-y-4 text-zinc-50 sm:text-lg sm:leading-7'>
                {importMode === 'single' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <div className='text-center mb-6'>
                      <p className='text-zinc-200 mb-4'>
                        Selecciona múltiples archivos JSON para ver el historial
                        de votación.
                      </p>
                      <p className='text-zinc-300 text-sm mb-6'>
                        Los archivos deben tener fechas en el nombre (ej:
                        datos-8-9-2025.json) o se usará la fecha de modificación
                        del archivo.
                      </p>
                    </div>

                    <div className='relative flex flex-col items-center'>
                      <label
                        htmlFor='multiJsonFiles'
                        className={`cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white rounded-md px-6 py-3 transition-colors ${
                          multiFileLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        {multiFileLoading
                          ? 'Procesando...'
                          : 'Seleccionar archivos JSON'}
                      </label>
                      <input
                        id='multiJsonFiles'
                        type='file'
                        accept='.json'
                        multiple
                        onChange={handleMultiFileImport}
                        disabled={multiFileLoading}
                        className='hidden'
                      />
                    </div>

                    {multiFileError && (
                      <div className='text-center mt-4'>
                        <p className='text-red-400 text-sm'>{multiFileError}</p>
                      </div>
                    )}

                    {multiFileLoading && (
                      <div className='flex justify-center mt-4'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
                      </div>
                    )}

                    <div className='text-center mt-6'>
                      <p className='text-zinc-300 text-xs'>
                        Solo se mostrará la página Base con historial de
                        votación por fechas.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
