import { useEffect, useState } from 'react';
import { useQuery, useSubscription, useLazyQuery } from '@apollo/client';
import { radioQuery } from '../graphql/radio';
import { gql } from '@apollo/client';
import { MdOutlineDrafts, MdOutlineHowToVote } from 'react-icons/md';
import { BsSendCheck } from 'react-icons/bs';
import {
  PERSON_ADDED,
  PERSON_DELETED,
  PERSON_VOTED,
  TABLE_ADDED,
  TABLE_CHANGED,
  TABLE_DELETED,
} from '../graphql/subscription';
import { InfoModal } from '../components/modals/InfoModal';
import { useModal } from '../hooks/useModal';
import { toast } from 'keep-react';
import { useLocation } from 'react-router-dom';

// Separate query for table details modal
const GET_TABLE_DETAILS = gql`
  query GetTableDetails($tableId: ID!) {
    table(_id: $tableId) {
      _id
      number
      factions {
        _id
        votes
        config {
          _id
          name
          color
          position
        }
      }
    }
  }
`;
export const Estado = () => {
  const { data, loading, error, refetch } = useQuery(radioQuery);
  const [getTableDetails] = useLazyQuery(GET_TABLE_DETAILS);
  const {
    isOpen: showTableDetails,
    openModal: openTableDetails,
    closeModal: closeTableDetails,
  } = useModal();
  const [selectedTableData, setSelectedTableData] = useState(null);
  const location = useLocation();
  const isInPrensa = location.pathname === '/prensa';

  const { data: personAdded } = useSubscription(PERSON_ADDED, {
    onData: (data) => {
      console.log(data);
    },
  });
  const { data: personDeleted } = useSubscription(PERSON_DELETED, {
    onData: (data) => {
      console.log(data);
    },
  });
  const { data: personVotedData } = useSubscription(PERSON_VOTED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });
  const { data: tableAdded } = useSubscription(TABLE_ADDED, {
    onData: (data) => {
      console.log(data);
    },
  });
  const { data: tableChanged } = useSubscription(TABLE_CHANGED, {
    onData: (dot) => {},
  });

  const { data: tableChangedWithToast } = useSubscription(TABLE_CHANGED, {
    onData: (data) => {
      // Only show toast if not in Prensa page (to avoid duplicate toasts)
      if (!isInPrensa) {
        const changedTable = data.data.data.tableChange;
        if (changedTable) {
          if (changedTable.status === 'Cerrada') {
            toast.info(`Mesa ${changedTable.number} cerrada`);
          } else if (changedTable.status === 'DatosEnviados') {
            toast.info(`Mesa ${changedTable.number} - Datos enviados`);
          }
        }
      }
    },
  });

  const { data: tableDeleted } = useSubscription(TABLE_DELETED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

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
  if (error) return <p>Error...</p>;

  // Add null checks for data
  const tables = data?.tablesWithCounts || [];
  const personTotal = data?.personTotal || 0;
  const personVoted = data?.personVoted || 0;

  const handleTableClick = async (tableId) => {
    try {
      const { data: tableData } = await getTableDetails({
        variables: { tableId },
      });

      if (!tableData?.table?.factions?.length) return;

      const table = tableData.table;
      const inte = table.factions.filter(
        (f) => f.config.position == 'intendencia'
      );
      const totalInteVotes = inte.reduce(
        (total, item) => total + item.votes,
        0
      );
      const gobe = table.factions.filter(
        (f) => f.config.position == 'gobernacion'
      );
      const totalGobeVotes = gobe.reduce(
        (total, item) => total + item.votes,
        0
      );
      const pres = table.factions.filter(
        (f) => f.config.position == 'presidencia'
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

  return (
    <>
      <div>
        <div className='flex flex-col'>
          <div className='flex flex-wrap'>
            <div className='flex w-64 mx-auto mb-3 flex-col border-2 border-zinc-400 bg-zinc-700 text-center px-4 py-2 shadow-zinc-400 shadow-md rounded'>
              <h1 className='text-zinc-300 text-2xl text-center'>Totales</h1>
              <p className='text-zinc-300 text-xl text-center'>
                {personVoted} / {personTotal} (
                {isNaN(personVoted / personTotal)
                  ? '0.00'
                  : ((personVoted / personTotal) * 100).toFixed(2)}
                %)
              </p>
            </div>
            <div className='flex w-64 mx-auto mb-3 flex-col border-2 border-zinc-400 bg-zinc-700 text-center px-4 py-2 shadow-zinc-400 shadow-md rounded'>
              <h1 className='text-zinc-300 text-2xl text-center'>
                Hora actual
              </h1>
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
                      tables.filter(
                        (t) =>
                          t.status === 'Abierta' && (t.factionsCount || 0) < 1
                      ).length
                    }{' '}
                    -{' '}
                    {(
                      (tables.filter(
                        (t) =>
                          t.status === 'Abierta' && (t.factionsCount || 0) < 1
                      ).length /
                        tables.length) *
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
                    ({tables.filter((t) => t.status === 'Cerrada').length} -{' '}
                    {(
                      (tables.filter((t) => t.status === 'Cerrada').length /
                        tables.length) *
                      100
                    ).toFixed(1)}
                    %)
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-1 items-center'>
                <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-sky-600'>
                  <BsSendCheck className='-tranzinc-x-0.5' />
                </span>
                <div className='font-medium text-white text-center'>
                  <div className='text-lg'>Datos Enviados</div>
                  <div className='text-md'>
                    (
                    {
                      tables.filter(
                        (t) =>
                          t.status === 'DatosEnviados' ||
                          (t.status === 'Abierta' && (t.factionsCount || 0) > 0)
                      ).length
                    }{' '}
                    -{' '}
                    {(
                      (tables.filter(
                        (t) =>
                          t.status === 'DatosEnviados' ||
                          (t.status === 'Abierta' && (t.factionsCount || 0) > 0)
                      ).length /
                        tables.length) *
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
          {tables.map((table) => {
            function statusStyle() {
              if (
                table.status === 'Abierta' &&
                (table.factionsCount || 0) < 1
              ) {
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
                    <BsSendCheck className='-tranzinc-x-0.5' />
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
