import { useEffect, useState, useCallback } from 'react';
import { useDB } from '../context/dbContext';
import { MdOutlineDrafts, MdOutlineHowToVote } from 'react-icons/md';
import { BsSendCheck } from 'react-icons/bs';
import { InfoModal } from '../components/modals/InfoModal';
import { useModal } from '../hooks/useModal';

export const Estado = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getAllRecords, getRecordsByIndex, subscribe, isDBReady } = useDB();
  const {
    isOpen: showTableDetails,
    openModal: openTableDetails,
    closeModal: closeTableDetails,
  } = useModal();
  const [selectedTableData, setSelectedTableData] = useState(null);

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
            factionsCount: (factions || []).length,
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

  const handleTableClick = async (tableId) => {
    try {
      const table = data.tables.find(t => t._id === tableId);
      if (!table || !table.factions?.length) return;

      const allFactionConfigs = await getAllRecords('factionConfigs');
      
      // Get faction configs for this table's factions
      const tableFactions = await Promise.all(
        table.factions.map(async (faction) => {
          const config = allFactionConfigs.find(c => c._id === faction.configId);
          return {
            ...faction,
            config: config || { name: 'Unknown', position: 'unknown' }
          };
        })
      );

      const inte = tableFactions.filter(
        (f) => f.config.position === 'intendencia'
      );
      const totalInteVotes = inte.reduce(
        (total, item) => total + item.votes,
        0
      );
      const gobe = tableFactions.filter(
        (f) => f.config.position === 'gobernacion'
      );
      const totalGobeVotes = gobe.reduce(
        (total, item) => total + item.votes,
        0
      );
      const pres = tableFactions.filter(
        (f) => f.config.position === 'presidencia'
      );
      const totalPresVotes = pres.reduce(
        (total, item) => total + item.votes,
        0
      );

      setSelectedTableData({
        table,
        inte,
        totalInteVotes,
        gobe,
        totalGobeVotes,
        pres,
        totalPresVotes,
      });
      openTableDetails();
    } catch (error) {
      console.error('Error loading table details:', error);
    }
  };

  if (loading) return <span className='loader'></span>;
  if (!data) return <p>Error...</p>;

  return (
    <>
      <div>
        <div className='flex flex-col'>
          <div className='flex flex-wrap'>
            <div className='flex w-64 mx-auto mb-3 flex-col border-2 border-zinc-400 bg-zinc-700 text-center px-4 py-2 shadow-zinc-400 shadow-md rounded'>
              <h1 className='text-zinc-300 text-2xl text-center'>Totales</h1>
              <p className='text-zinc-300 text-xl text-center'>
                {data.personVoted} / {data.personTotal} (
                {isNaN(data.personVoted / data.personTotal)
                  ? '0.00'
                  : ((data.personVoted / data.personTotal) * 100).toFixed(2)}
                %)
              </p>
            </div>
            <div className='flex w-64 mx-auto mb-3 flex-col border-2 border-zinc-400 bg-zinc-700 text-center px-4 py-2 shadow-zinc-400 shadow-md rounded'>
              <h1 className='text-zinc-300 text-2xl text-center'>Hora actual</h1>
              <p className='text-zinc-300 text-xl text-center'>
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
                  <div className='text-md'>
                    (
                    {
                      data.tables.filter(
                        (t) =>
                          t.status === 'Abierta' && (t.factionsCount || 0) < 1
                      ).length
                    }{' '}
                    -{' '}
                    {(
                      (data.tables.filter(
                        (t) =>
                          t.status === 'Abierta' && (t.factionsCount || 0) < 1
                      ).length /
                        data.tables.length) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-orange-600'>
                  <MdOutlineDrafts />
                </span>
                <div className='font-medium text-white text-center'>
                  <div className='text-lg'>Recuento de votos</div>
                  <div className='text-md'>
                    ({data.tables.filter((t) => t.status === 'Cerrada').length} -{' '}
                    {(
                      (data.tables.filter((t) => t.status === 'Cerrada').length /
                        data.tables.length) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-sky-600'>
                  <BsSendCheck className='-translate-x-0.5' />
                </span>
                <div className='font-medium text-white text-center'>
                  <div className='text-lg'>Datos Enviados</div>
                  <div className='text-md'>
                    (
                    {
                      data.tables.filter(
                        (t) =>
                          t.status === 'DatosEnviados' ||
                          (t.status === 'Abierta' && (t.factionsCount || 0) > 0)
                      ).length
                    }{' '}
                    -{' '}
                    {(
                      (data.tables.filter(
                        (t) =>
                          t.status === 'DatosEnviados' ||
                          (t.status === 'Abierta' && (t.factionsCount || 0) > 0)
                      ).length /
                        data.tables.length) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap justify-center gap-2 py-2'>
          {data.tables.map((table) => {
            function statusStyle() {
              if (table.status === 'Abierta' && (table.factionsCount || 0) < 1) {
                return (
                  <span className='p-2 flex justify-center items-center bg-green-600 rounded-full text-2xl'>
                    <MdOutlineHowToVote />
                  </span>
                );
              } else if (table.status === 'Cerrada') {
                return (
                  <span className='p-2 flex justify-center items-center bg-orange-600 rounded-full text-2xl'>
                    <MdOutlineDrafts />
                  </span>
                );
              } else {
                return (
                  <span
                    className='p-2 flex justify-center items-center bg-sky-600 rounded-full text-2xl cursor-pointer'
                    onClick={() => handleTableClick(table._id)}
                  >
                    <BsSendCheck className='-translate-x-0.5' />
                  </span>
                );
              }
            }
            const votePercent = (
              ((table.voted || 0) / (table.totalPersons || 1)) *
              100
            ).toFixed(2);

            return (
              <div
                key={table._id}
                className='flex items-center space-x-4 p-3 bg-zinc-700 rounded-lg'
              >
                {statusStyle()}
                <div className='font-medium'>
                  <div className='text-md'>Mesa {table.number}</div>
                  <div className='text-sm'>
                    {table.voted || 0} / {table.totalPersons || 0} ({' '}
                    {votePercent}% )
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <InfoModal
        isOpen={showTableDetails}
        onClose={closeTableDetails}
        title={`Resultados Mesa ${selectedTableData?.table?.number || ''}`}
        showIcon={false}
      >
        {selectedTableData && (
          <div className='flex flex-col gap-4 w-full justify-center'>
            {!!selectedTableData.inte.length && (
              <div className='flex flex-col gap-2 border border-zinc-300 py-3 px-4 rounded-lg'>
                <span className='font-semibold text-lg text-zinc-200'>
                  Intendencia:
                </span>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <tbody>
                      {selectedTableData.inte.map((i) => (
                        <tr
                          className='text-center border-b border-zinc-200 last:border-b-0'
                          key={i._id}
                        >
                          <td className='text-left py-1 text-zinc-200'>
                            {i.config.name}
                          </td>
                          <td className='px-3 py-1 font-medium text-zinc-200'>
                            {i.votes}
                          </td>
                          <td className='py-1 text-zinc-200'>
                            {`(${
                              isNaN(
                                (i.votes / selectedTableData.totalInteVotes) *
                                  100
                              )
                                ? '0.00'
                                : (
                                    (i.votes /
                                      selectedTableData.totalInteVotes) *
                                    100
                                  ).toFixed(2)
                            }%)`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!!selectedTableData.gobe.length && (
              <div className='flex flex-col gap-2 border border-zinc-300 py-3 px-4 rounded-lg'>
                <span className='font-semibold text-lg text-zinc-200'>
                  Gobernación:
                </span>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <tbody>
                      {selectedTableData.gobe.map((i) => (
                        <tr
                          className='text-center border-b border-zinc-200 last:border-b-0'
                          key={i._id}
                        >
                          <td className='text-left py-1 text-zinc-200'>
                            {i.config.name}
                          </td>
                          <td className='px-3 py-1 font-medium text-zinc-200'>
                            {i.votes}
                          </td>
                          <td className='py-1 text-zinc-200'>
                            {`(${
                              isNaN(
                                (i.votes / selectedTableData.totalGobeVotes) *
                                  100
                              )
                                ? '0.00'
                                : (
                                    (i.votes /
                                      selectedTableData.totalGobeVotes) *
                                    100
                                  ).toFixed(2)
                            }%)`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!!selectedTableData.pres.length && (
              <div className='flex flex-col gap-2 border border-zinc-300 py-3 px-4 rounded-lg'>
                <span className='font-semibold text-lg text-zinc-200'>
                  Presidencia:
                </span>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <tbody>
                      {selectedTableData.pres.map((i) => (
                        <tr
                          className='text-center border-b border-zinc-200 last:border-b-0'
                          key={i._id}
                        >
                          <td className='text-left py-1 text-zinc-200'>
                            {i.config.name}
                          </td>
                          <td className='px-3 py-1 font-medium text-zinc-200'>
                            {i.votes}
                          </td>
                          <td className='py-1 text-zinc-200'>
                            {`(${
                              isNaN(
                                (i.votes / selectedTableData.totalPresVotes) *
                                  100
                              )
                                ? '0.00'
                                : (
                                    (i.votes /
                                      selectedTableData.totalPresVotes) *
                                    100
                                  ).toFixed(2)
                            }%)`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </InfoModal>
    </>
  );
};