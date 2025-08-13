import { useEffect, useState, useMemo } from 'react';
import { useSubscription } from '@apollo/client';
import { useOptimizedQuery } from '../hooks/useOptimizedQuery';
import { radioQuery } from '../graphql/radio';
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
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const Estado = () => {
  const { data, loading, error, refetch } = useOptimizedQuery(radioQuery, {
    fetchPolicy: 'cache-first',
    pollInterval: 15000, // Poll every 15 seconds for real-time updates
  });

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
  const { data: personVoted } = useSubscription(PERSON_VOTED, {
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

  const numberOfTables = useMemo(() => data?.tables?.length || 0, [data]);
  const numberOfAbiertas = useMemo(() => {
    return (
      data?.tables?.filter((table) => table.status === 'Abierta').length || 0
    );
  }, [data]);
  const numberOfCerradas = useMemo(() => {
    return (
      data?.tables?.filter((table) => table.status === 'Cerrada').length || 0
    );
  }, [data]);
  const numberOfDatosEnviados = useMemo(() => {
    return (
      data?.tables?.filter((table) => table.status === 'DatosEnviados')
        .length || 0
    );
  }, [data]);

  if (loading) return <span className='loader'></span>;
  if (error) return <p>Error...</p>;

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
                <div className='text-sm'>
                  {numberOfAbiertas}/{numberOfTables} (
                  {((numberOfAbiertas / numberOfTables) * 100).toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-1 items-center'>
              <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-orange-600'>
                <MdOutlineDrafts />
              </span>
              <div className='font-medium text-white text-center'>
                <div className='text-lg'>Recueto de votos</div>
                <div className='text-sm'>
                  {numberOfCerradas}/{numberOfTables} (
                  {((numberOfCerradas / numberOfTables) * 100).toFixed(2)}%)
                </div>
              </div>
            </div>
            <div className='flex flex-col gap-1 items-center'>
              <span className='p-2 rounded-full text-2xl flex justify-center items-center bg-sky-600'>
                <BsSendCheck className='-translate-x-0.5' />
              </span>
              <div className='font-medium text-white text-center'>
                <div className='text-lg'>Datos Enviados</div>
                <div className='text-sm'>
                  {numberOfDatosEnviados}/{numberOfTables} (
                  {((numberOfDatosEnviados / numberOfTables) * 100).toFixed(2)}
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
                <span
                  className='p-2 flex justify-center items-center bg-sky-600 rounded-full text-2xl cursor-pointer'
                  onClick={() => {
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
                    MySwal.fire({
                      width: 'fit-content',
                      html: (
                        <div className='flex flex-col gap-1 w-full justify-center'>
                          {!!inte.length && (
                            <div className='flex flex-col gap-1 border border-slate-600 py-2 px-5 rounded'>
                              <span className='font-semibold'>
                                Intendencia:
                              </span>
                              <table>
                                <tbody>
                                  {inte.map((i) => (
                                    <tr className='text-center'>
                                      <td className='text-left'>
                                        {i.config.name}
                                      </td>
                                      <td className='px-3'>{i.votes}</td>
                                      <td>
                                        {`(${
                                          isNaN(
                                            (i.votes / totalInteVotes) * 100
                                          )
                                            ? '0.00'
                                            : (
                                                (i.votes / totalInteVotes) *
                                                100
                                              ).toFixed(2)
                                        }%)`}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {!!gobe.length && (
                            <div className='flex flex-col gap-1 border border-slate-600 py-2 px-5 rounded'>
                              <span className='font-semibold'>
                                Gobernación:
                              </span>
                              <table>
                                <tbody>
                                  {gobe.map((i) => (
                                    <tr className='text-center'>
                                      <td className='text-left'>
                                        {i.config.name}
                                      </td>
                                      <td className='px-3'>{i.votes}</td>
                                      <td>
                                        {`(${
                                          isNaN(
                                            (i.votes / totalGobeVotes) * 100
                                          )
                                            ? '0.00'
                                            : (
                                                (i.votes / totalGobeVotes) *
                                                100
                                              ).toFixed(2)
                                        }%)`}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          {!!pres.length && (
                            <div className='flex flex-col gap-1 border border-slate-600 py-2 px-5 rounded'>
                              <span className='font-semibold'>
                                Presidencia:
                              </span>
                              <table>
                                <tbody>
                                  {pres.map((i) => (
                                    <tr className='text-center'>
                                      <td className='text-left'>
                                        {i.config.name}
                                      </td>
                                      <td className='px-3'>{i.votes}</td>
                                      <td>
                                        {`(${
                                          isNaN(
                                            (i.votes / totalPresVotes) * 100
                                          )
                                            ? '0.00'
                                            : (
                                                (i.votes / totalPresVotes) *
                                                100
                                              ).toFixed(2)
                                        }%)`}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ),
                    });
                  }}
                >
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
