import React from 'react';
import ReactExport from 'react-excel-exportz';
import { useState, useEffect } from 'react';
import { useDB } from '../context/dbContext';
import { RiFileExcel2Line } from 'react-icons/ri';

export const Export = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, getRecordsByIndex, importData, isDBReady } = useDB();

  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const loadData = async () => {
    if (!isDBReady) return;

    try {
      const tables = await getAllRecords('tables');
      const tablesWithData = await Promise.all(
        tables.map(async (table) => {
          const persons = await getRecordsByIndex(
            'persons',
            'tableId',
            table._id
          );
          const factions = await getRecordsByIndex(
            'factions',
            'tableId',
            table._id
          );

          return {
            ...table,
            persons: persons.sort((a, b) => a.order - b.order),
            factions,
          };
        })
      );

      setData({ tables: tablesWithData });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isDBReady]);

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          await importData(jsonData);
          await loadData();
          alert('Datos importados correctamente');
        } catch (error) {
          console.error('Error importing data:', error);
          alert('Error al importar los datos');
        }
      };
      reader.readAsText(file);
    }
  };

  if (loading) return <span className='loader'></span>;
  if (!data) return <p>Error</p>;

  const persons = [];
  data?.tables?.forEach((table) => {
    table.persons.forEach((person) => {
      const newPerson = {
        order: person.order,
        firstName: person.firstName,
        lastName: person.lastName,
        dni: person.dni,
        vote: person.vote,
        table: person.tableNumber,
        affiliate: person.affiliate,
        message: person.message,
      };
      persons.push(newPerson);
    });
  });

  const result = { persons };
  const singleSheetFile = (
    <ExcelFile
      filename={`Datos Grilla Electoral (unificado) ${day}-${month}-${year}`}
      element={
        <button className='p-3 mt-5 bg-slate-600 rounded flex items-center gap-2 hover:bg-slate-500'>
          Descargar Archivo Unificado
        </button>
      }
    >
      <ExcelSheet data={result.persons} name={`Datos ${day}-${month}-${year}`}>
        <ExcelColumn label='Mesa' value='table' />
        <ExcelColumn label='Orden' value='order' />
        <ExcelColumn label='Nombre' value='firstName' />
        <ExcelColumn label='Apellido' value='lastName' />
        <ExcelColumn label='DNI' value='dni' />
        <ExcelColumn
          label='Voto'
          value={(col) => (col.vote ? 'Votó' : 'No Votó')}
        />
        <ExcelColumn
          label='Afiliado'
          value={(col) => (col.affiliate ? 'Si' : 'No')}
        />
        <ExcelColumn label='Mensaje' value='message' />
      </ExcelSheet>
    </ExcelFile>
  );

  const multipleSheetFile = (
    <ExcelFile
      filename={`Datos Grilla Electoral (hojas) ${day}-${month}-${year}`}
      element={
        <button className='p-3 mt-5 bg-slate-600 rounded flex items-center gap-2 hover:bg-slate-500'>
          Descargar Archivo
        </button>
      }
    >
      {data?.tables?.map((table) => (
        <ExcelSheet
          key={table._id}
          data={table.persons}
          name={`Mesa ${table.number}`}
        >
          <ExcelColumn label='Orden' value='order' />
          <ExcelColumn label='Nombre' value='firstName' />
          <ExcelColumn label='Apellido' value='lastName' />
          <ExcelColumn label='DNI' value='dni' />
          <ExcelColumn
            label='Voto'
            value={(col) => (col.vote ? 'Votó' : 'No Votó')}
          />
          <ExcelColumn
            label='Afiliado'
            value={(col) => (col.affiliate ? 'Si' : 'No')}
          />
          <ExcelColumn label='Mensaje' value='message' />
        </ExcelSheet>
      ))}
    </ExcelFile>
  );

  return (
    <div className='flex flex-col gap-5 justify-center items-center mt-10'>
      <div className='flex justify-center items-center w-full h-1/2'>
        <div className='w-1/2 flex flex-col items-center text-center justify-center'>
          <h2>Archivo con las mesas separadas por hojas.</h2>
          <div className='text-3xl mt-2'>
            <RiFileExcel2Line />
          </div>
          <div className='flex items-center justify-center'>
            {multipleSheetFile}
          </div>
        </div>
        <div className='w-1/2 flex flex-col items-center text-center justify-center'>
          <h2>Archivo con todos los datos en una única hoja.</h2>
          <div className='text-3xl mt-2'>
            <RiFileExcel2Line />
          </div>
          <div className='flex items-center justify-center'>
            {singleSheetFile}
          </div>
        </div>
      </div>
    </div>
  );
};
