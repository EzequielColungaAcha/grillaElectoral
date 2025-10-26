import { useState, useEffect } from 'react';
import { useDB } from '../context/dbContext';

export const AdminFactions = () => {
  const [factionConfigs, setFactionConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, subscribe, isDBReady } = useDB();

  const loadFactionConfigs = async () => {
    if (!isDBReady) return;

    try {
      const configs = await getAllRecords('factionConfigs');
      setFactionConfigs(configs);
    } catch (error) {
      console.error('Error loading faction configs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFactionConfigs();

    // Subscribe to changes
    const unsubscribeAdded = subscribe(
      'factionConfigs_added',
      loadFactionConfigs
    );
    const unsubscribeDeleted = subscribe(
      'factionConfigs_deleted',
      loadFactionConfigs
    );
    const unsubscribeUpdated = subscribe(
      'factionConfigs_updated',
      loadFactionConfigs
    );

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
      unsubscribeUpdated();
    };
  }, [isDBReady]);

  if (loading) return <span className='loader' />;

  const intendencia = factionConfigs.filter(
    (f) => f.position === 'intendencia'
  );
  const gobernacion = factionConfigs.filter(
    (f) => f.position === 'gobernacion'
  );
  const presidencia = factionConfigs.filter(
    (f) => f.position === 'presidencia'
  );

  return (
    <div>
      <div className='flex items-center justify-center mb-5'>
        <p className='text-xl'>Administración de Partidos - Modo Offline</p>
      </div>
      <div className='flex justify-evenly'>
        <div className='w-1/3 text-center'>
          <h2 className='mb-2 text-2xl'>Intendencia</h2>
          <div className='h-full w-full px-5 flex flex-col items-center'>
            {intendencia.map((config) => (
              <div
                key={config._id}
                className='flex justify-between bg-zinc-800 w-full rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 max-w-lg items-center'
              >
                <div className='flex flex-col gap-3'>
                  <h2 className='text-xl font-medium'>{config.name}</h2>
                  <div
                    className='w-48 h-6'
                    style={{ backgroundColor: config.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='w-1/3 text-center'>
          <h2 className='mb-2 text-2xl'>Gobernación</h2>
          <div className='h-full w-full px-5 flex flex-col items-center'>
            {gobernacion.map((config) => (
              <div
                key={config._id}
                className='flex justify-between bg-zinc-800 w-full rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 max-w-lg items-center'
              >
                <div className='flex flex-col gap-3'>
                  <h2 className='text-xl font-medium'>{config.name}</h2>
                  <div
                    className='w-48 h-6'
                    style={{ backgroundColor: config.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className='w-1/3 text-center'>
          <h2 className='mb-2 text-2xl'>Presidencia</h2>
          <div className='h-full w-full px-5 flex flex-col items-center'>
            {presidencia.map((config) => (
              <div
                key={config._id}
                className='flex justify-between bg-zinc-800 w-full rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 max-w-lg items-center'
              >
                <div className='flex flex-col gap-3'>
                  <h2 className='text-xl font-medium'>{config.name}</h2>
                  <div
                    className='w-48 h-6'
                    style={{ backgroundColor: config.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
