import { useState, useEffect, useCallback } from 'react';
import { useDB } from '../context/dbContext';
import { seats, threshold } from '../config';

export function Escrutinio() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, getRecordsByIndex, subscribe, isDBReady } = useDB();

  const loadData = useCallback(async () => {
    if (!isDBReady) return;

    try {
      const tables = await getAllRecords('tables');
      const allFactions = (await getAllRecords('factions')) || [];
      const allFactionConfigs = (await getAllRecords('factionConfigs')) || [];

      // Create faction chart data
      const factionChartData = allFactionConfigs.map((config) => {
        const configFactions = allFactions.filter(
          (f) => f.configId === config._id
        );
        const totalVotes = configFactions.reduce((sum, f) => sum + f.votes, 0);

        return {
          id: config._id,
          name: config.name,
          color: config.color,
          position: config.position,
          votes: totalVotes,
          percentage: 0,
          seats: 0,
        };
      });

      setData({
        tables,
        factionChartJS: JSON.stringify(factionChartData),
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [isDBReady, getAllRecords]);

  useEffect(() => {
    if (isDBReady) {
      loadData();
    }

    // Subscribe to changes
    const unsubscribeFunctions = [];

    if (isDBReady) {
      unsubscribeFunctions.push(subscribe('factions_updated', loadData));
      unsubscribeFunctions.push(subscribe('factions_added', loadData));
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [isDBReady, subscribe, loadData]);

  if (loading) return <span className='loader'></span>;
  if (!data) return <p>Error...</p>;

  const chartData = JSON.parse(data.factionChartJS);

  const intendencia = chartData.filter((f) => f.position === 'intendencia');
  const gobernacion = chartData.filter((f) => f.position === 'gobernacion');
  const presidencia = chartData.filter((f) => f.position === 'presidencia');

  const totalIntendenciaVotes = intendencia.reduce(
    (acum, pp) => pp.votes + acum,
    0
  );
  intendencia.forEach(
    (pp) =>
      (pp.percentage = ((pp.votes * 100) / totalIntendenciaVotes).toFixed(2))
  );
  intendencia.sort((a, b) => b.votes - a.votes);

  const totalGobernacionVotes = gobernacion.reduce(
    (acum, pp) => pp.votes + acum,
    0
  );
  gobernacion.forEach(
    (pp) =>
      (pp.percentage = ((pp.votes * 100) / totalGobernacionVotes).toFixed(2))
  );
  gobernacion.sort((a, b) => b.votes - a.votes);

  const totalPresidenciaVotes = presidencia.reduce(
    (acum, pp) => pp.votes + acum,
    0
  );
  presidencia.forEach(
    (pp) =>
      (pp.percentage = ((pp.votes * 100) / totalPresidenciaVotes).toFixed(2))
  );
  presidencia.sort((a, b) => b.votes - a.votes);

  const calculateSeats = () => {
    let positivesIntendencia = intendencia.filter(
      (pp) => pp.percentage >= threshold
    ).length;

    for (let i = 0; i < seats; i++) {
      // indice seleccionado
      let indexPP = 0;
      let highValue = 0;

      // Recorremos el numero de partidos validos
      // Solo mientras el valor maximo sea menor que el numero de votos
      for (
        let j = 0;
        j < positivesIntendencia && highValue < intendencia[j].votes;
        j++
      ) {
        // Si el numero de votos dividido en el numero de escaños (+1)
        // es mayor que el valor maximo, lo selecciono
        if (intendencia[j].votes / (intendencia[j].seats + 1) > highValue) {
          highValue = intendencia[j].votes / (intendencia[j].seats + 1);
          indexPP = j;
        }
      }

      // Aumentamos los asientos del partido politico seleccionado
      intendencia[indexPP].seats++;
    }
  };

  totalIntendenciaVotes > 0 && calculateSeats();

  intendencia.sort(function (a, b) {
    return a.name == 'Blancos' ? 1 : 0;
  });
  gobernacion.sort(function (a, b) {
    return a.name == 'Blancos' ? 1 : 0;
  });
  presidencia.sort(function (a, b) {
    return a.name == 'Blancos' ? 1 : 0;
  });

  return (
    <div className='flex flex-col gap-10 justify-evenly text-center'>
      <div className='text-5xl text-center py-4 underline underline-offset-8'>
        Escrutinio
      </div>
      <div>
        <h2 className='text-4xl mb-3'>Intendencia</h2>
        {intendencia.map((candidato, index) => {
          return (
            <div
              key={index}
              className='flex flex-col md:flex-row gap justify-evenly items-center w-full'
            >
              <div className='md:w-4/12 w-full text-2xl md:text-right pr-2 font-semibold'>
                {candidato.name}
              </div>
              <div className='relative md:w-6/12 w-10/12 rounded-full h-6 items-center bg-opacity-80 overflow-hidden bg-slate-600'>
                <div
                  className='h-full transition-all'
                  style={{
                    backgroundColor: `${candidato.color}`,
                    width: `${
                      candidato.percentage == 'NaN' ? '0' : candidato.percentage
                    }%`,
                  }}
                />
                <span className='absolute right-2 -translate-y-1/2 text-white text-xl font-bold top-1/2'>
                  {candidato.votes}
                  {' - '}
                  {candidato.percentage == 'NaN' ? '0' : candidato.percentage}%
                </span>
              </div>
              {candidato.name != 'Blancos' &&
              data.tables.find((e) => !e.factions || e.factions.length === 0) ==
                undefined ? (
                <div className='w-2/12 text-xl'>
                  Escaños: {candidato.seats} / {seats}
                </div>
              ) : (
                <div className='w-2/12' />
              )}
            </div>
          );
        })}
      </div>
      <div>
        <h2 className='text-4xl mb-3'>Gobernación</h2>
        {gobernacion.map((candidato, index) => {
          return (
            <div
              key={index}
              className='flex flex-col md:flex-row gap justify-evenly items-center w-full'
            >
              <div className='md:w-4/12 w-full text-2xl md:text-right pr-2 font-semibold'>
                {candidato.name}
              </div>
              <div className='relative md:w-6/12 w-10/12 rounded-full h-6 items-center bg-opacity-80 overflow-hidden bg-slate-600'>
                <div
                  className='h-full transition-all'
                  style={{
                    backgroundColor: `${candidato.color}`,
                    width: `${
                      candidato.percentage == 'NaN' ? '0' : candidato.percentage
                    }%`,
                  }}
                />
                <span className='absolute right-2 -translate-y-1/2 text-white text-xl font-bold top-1/2'>
                  {candidato.votes}
                  {' - '}
                  {candidato.percentage == 'NaN' ? '0' : candidato.percentage}%
                </span>
              </div>
              <div className='w-2/12'></div>
            </div>
          );
        })}
      </div>
      <div>
        <h2 className='text-4xl mb-3'>Presidencia</h2>
        {presidencia.map((candidato, index) => {
          return (
            <div
              key={index}
              className='flex flex-col md:flex-row gap justify-evenly items-center w-full'
            >
              <div className='md:w-4/12 w-full text-2xl md:text-right pr-2 font-semibold'>
                {candidato.name}
              </div>
              <div className='relative md:w-6/12 w-10/12 rounded-full h-6 items-center bg-opacity-80 overflow-hidden bg-slate-600'>
                <div
                  className='h-full transition-all'
                  style={{
                    backgroundColor: `${candidato.color}`,
                    width: `${
                      candidato.percentage == 'NaN' ? '0' : candidato.percentage
                    }%`,
                  }}
                />
                <span className='absolute right-2 -translate-y-1/2 text-white text-xl font-bold top-1/2'>
                  {candidato.votes}
                  {' - '}
                  {candidato.percentage == 'NaN' ? '0' : candidato.percentage}%
                </span>
              </div>
              <div className='w-2/12'></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
