import { useEffect, useState, useCallback } from 'react';
import { useDB } from '../context/dbContext';
import { MdOutlineDrafts, MdOutlineHowToVote } from 'react-icons/md';
import { BsSendCheck } from 'react-icons/bs';

export const Estado = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, getRecordsByIndex, subscribe, isDBReady } = useDB();

  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  const loadData = useCallback(async () => {
    if (!isDBReady) return;

    try {
      const tables = await getAllRecords('tables');
      const allPersons = await getAllRecords('persons');

      const tablesWithData = await Promise.all(
        tables.map(async (table) => {
          const persons = allPersons.filter((p) => p.tableId === table._id);
          const factions = await getRecordsByIndex(
            'factions',
            'tableId',
            table._id
          );

          return {
            ...table,
            totalPersons: persons.length,
            voted: persons.filter((p) => p.vote).length,
            factions: factions || [],
          };
        })
      );

      // Sort tables by number
      tablesWithData.sort((a, b) => a.number - b.number);

      const personTotal = allPersons.length;
      const personVoted = allPersons.filter((p) => p.vote).length;

      setData({
        tables: tablesWithData,
        personTotal,
        personVoted,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [isDBReady, getAllRecords, getRecordsByIndex]);

  useEffect(() => {
    if (isDBReady) {
      loadData();
    }

    // Subscribe to changes
    const unsubscribeFunctions = [];

    if (isDBReady) {
      unsubscribeFunctions.push(subscribe('persons_updated', loadData));
      unsubscribeFunctions.push(subscribe('tables_updated', loadData));
    }

    return () => {
      unsubscribeFunctions.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [isDBReady, subscribe, loadData]);

  useEffect(() => {
    const update = () => {
      const date = new Date();
      let hour = date.getHours();
      setHour(hour);
      setMinute(String(date.getMinutes()).padStart(2, '0'));
      setSecond(String(date.getSeconds()).padStart(2, '0'));
    };

    update();

    const interval = setInterval(() => {
      update();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <span className='loader'></span>;
  if (!data) return <p>Error...</p>;

  return (
    <div>
      <div className='flex flex-col'>
        <div className='flex flex-wrap'>
          <div className='flex w-64 mx-auto mb-3 flex-col border-2 border-slate-400 bg-slate-700 text-center px-4 py-2 shadow-slate-400 shadow-md rounded'>
            <h1 className='text-slate-300 text-2xl text-center'>Totales</h1>
            <p className='text-slate-300 text-xl text-center'>
              {data.personVoted} / {data.personTotal} (
              {isNaN(data.personVoted / data.personTotal)
                ? '0.00'
                : ((data.personVoted / data.personTotal) * 100).toFixed(2)}
              %)
            </p>
          </div>
          <div className='flex w-64 mx-auto mb-3 flex-col border-2 border-slate-400 bg-slate-700 text-center px-4 py-2 shadow-slate-400 shadow-md rounded'>
            <h1 className='text-slate-300 text-2xl text-center'>Hora actual</h1>
            <p className='text-slate-300 text-xl text-center'>
              {`${hour}:${minute}:${second}`}
            </p>
          </div>
        </div>
        <div className='flex flex-col items-center'>
          <div className='flex flex-wrap w-full justify-evenly my-3'>
            <div className='flex flex-col gap-1 items-center'>
              <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-green-600'>
                <MdOutlineHowToVote />
              </span>
              <div className='font-medium text-white text-center'>
                <div className='text-lg'>Mesa Abierta</div>
              </div>
            </div>
            <div className='flex flex-col gap-1 items-center'>
              <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-orange-600'>
                <MdOutlineDrafts />
              </span>
              <div className='font-medium text-white text-center'>
                <div className='text-lg'>Recueto de votos</div>
              </div>
            </div>
            <div className='flex flex-col gap-1 items-center'>
              <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-sky-600'>
                <BsSendCheck className='-translate-x-0.5' />
              </span>
              <div className='font-medium text-white text-center'>
                <div className='text-lg'>Datos Enviados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-wrap justify-center gap-2 py-2'>
        {data.tables.map((table) => {
          function statusStyle() {
            if (table.status == 'Abierta' && table.factions.length < 1) {
              return (
                <span className='p-2 flex justify-center items-center bg-green-600 rounded-full text-2xl'>
                  <MdOutlineHowToVote />
                </span>
              );
            } else if (table.status == 'Cerrada') {
              return (
                <span className='p-2 flex justify-center items-center bg-orange-600 rounded-full text-2xl'>
                  <MdOutlineDrafts />
                </span>
              );
            } else {
              return (
                <span className='p-2 flex justify-center items-center bg-sky-600 rounded-full text-2xl'>
                  <BsSendCheck className='-translate-x-0.5' />
                </span>
              );
            }
          }
          const votePercent = (
            (table.voted / table.totalPersons) *
            100
          ).toFixed(2);

          return (
            <div
              key={table._id}
              className='flex items-center space-x-4 p-3 bg-slate-700 rounded-lg'
            >
              {statusStyle()}
              <div className='font-medium'>
                <div className='text-md'>Mesa {table.number}</div>
                <div className='text-sm'>
                  {table.voted} / {table.totalPersons} ( {votePercent}% )
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
