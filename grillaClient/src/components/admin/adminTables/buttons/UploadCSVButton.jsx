import { useMutation } from '@apollo/client';
import { CREATE_MULTIPLE_PERSONS } from '../../../../graphql/persons';
import Papa from 'papaparse';
import { useState } from 'react';
import { FileUploadModal } from '../../../modals/FileUploadModal';
import { InfoModal } from '../../../modals/InfoModal';
import { toast } from 'keep-react';

export const UploadCSVButton = ({ table }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const [addMultiplePersons] = useMutation(CREATE_MULTIPLE_PERSONS);

  const handleFileSelect = async (file) => {
    try {
      const records = [];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: 'UTF-8',
        complete: function (results) {
          results.data.map((row) => {
            const person = {
              firstName: row.nombre.toUpperCase(),
              lastName: row.apellido.toUpperCase(),
              dni: row.dni,
              vote: false,
              order: parseInt(row.orden),
              address: row.dir,
              table: table._id,
              tableNumber: table.number,
              message: '',
              affiliate: false,
              referer: '',
              driver: '',
              driver: '',
            };
            records.push(person);
          });

          addMultiplePersons({
            variables: {
              data: records,
            },
          })
            .then(() => {
              toast.success('Votantes añadidos correctamente');
            })
            .catch(() => {
              toast.error('Error al añadir votantes');
            });
        },
      });
    } catch (error) {
      toast.error('Error al procesar el archivo');
    }
    setShowUpload(false);
  };

  const handleShowInfo = () => {
    setShowInfo(true);
  };

  return (
    <>
      <button
        onClick={handleShowInfo}
        className='bg-gray-500 py-2 px-5 hover:bg-gray-400'
      >
        Añadir votantes
      </button>

      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title='Formato de archivo CSV'
      >
        <div className='space-y-3'>
          <img
            src='/csvFormat.png'
            alt='Formato CSV requerido'
            className='w-full max-w-md mx-auto rounded border'
          />
          <div className='text-sm space-y-2'>
            <p>
              El archivo CSV debe estar ordenado como se muestra en la imagen.
            </p>
            <p>
              <strong>Cabeceras requeridas:</strong> mesa, orden, apellido,
              nombre, dni, dir
            </p>
            <p>
              Debajo de las cabeceras, los datos de cada votante en una fila.
            </p>
            <p className='text-orange-600'>
              ❗ Recomiendo usar Google Spreadsheets porque Excel no guarda las
              Ñ correctamente.
            </p>
          </div>
          <div className='flex justify-end pt-4'>
            <button
              onClick={() => {
                setShowInfo(false);
                setShowUpload(true);
              }}
              className='px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900'
            >
              Continuar
            </button>
          </div>
        </div>
      </InfoModal>

      <FileUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onFileSelect={handleFileSelect}
        title={`Subir CSV para Mesa ${table.number}`}
        description='Selecciona el archivo CSV con los datos de los votantes.'
        acceptedTypes='.csv'
      />
    </>
  );
};
