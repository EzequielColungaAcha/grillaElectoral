import { Clock } from '../components/clock/Clock';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/simpleAuthContext';
import { useDB } from '../context/dbContext';

export const Home = () => {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const [userTutorial, setUserTutorial] = useState('');
  const [importInfo, setImportInfo] = useState(null);
  const { getAllRecords, isDBReady } = useDB();

  const loadImportInfo = useCallback(async () => {
    if (!isDBReady) return;

    try {
      // Try to get export info from the dedicated store
      const exportInfoRecords = await getAllRecords('exportInfo');
      if (exportInfoRecords && exportInfoRecords.length > 0) {
        const exportInfo = exportInfoRecords[0];
        setImportInfo({
          month: exportInfo.exportMonth,
          year: exportInfo.exportYear,
          day: exportInfo.exportDay,
        });
      } else {
        // Fallback: Check if there's any data imported by looking for tables
        const tables = await getAllRecords('tables');
        if (tables && tables.length > 0) {
          const firstTable = tables[0];
          if (firstTable.createdAt) {
            const importDate = new Date(firstTable.createdAt);
            setImportInfo({
              month: importDate.getMonth() + 1,
              year: importDate.getFullYear(),
              day: importDate.getDate(),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading import info:', error);
    }
  }, [isDBReady, getAllRecords]);

  useEffect(() => {
    loadImportInfo();
  }, [loadImportInfo]);

  const videos = [
    { user: 'admin', url: '/' },
    { user: 'fiscal', url: 'https://youtu.be/pk0vQucgIQw' },
    { user: 'base', url: 'https://youtu.be/_fhmEUihmHU' },
    { user: 'prensa', url: 'https://youtu.be/5nGGK8fw97g' },
  ];

  useEffect(() => {
    setUserTutorial(videos.find((e) => e.user == user?.rol)?.url || '/');
  }, []);

  return (
    <div className='text-center text-zinc-200 h-full pt-16 flex flex-col justify-center items-center'>
      <h1 className='uppercase text-4xl mb-10'>Grilla electoral {year}</h1>
      <Clock />
      <div className='flex flex-col items-center justify-center mt-10'>
        <h4 className='w-fit text-xl text-justify px-1'>
          Bienvenido/a <span className='text-lime-400'>Administrador</span>.
        </h4>
        <h4 className='w-fit text-xl text-center px-1'>
          Aplicación para visualizar una base de datos estática exportada por la
          versión online.
        </h4>
        {importInfo && (
          <h5 className='w-fit text-lg text-center px-1 mt-4 text-zinc-300'>
            Datos importados: {importInfo.day}/{importInfo.month}/
            {importInfo.year}
          </h5>
        )}
      </div>
    </div>
  );
};
