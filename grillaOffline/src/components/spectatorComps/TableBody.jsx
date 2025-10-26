import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import throttle from 'lodash.throttle';
import { InfoModal } from '../modals/InfoModal';
import { useModal } from '../../hooks/useModal';

const TableBody = ({ data = [] }) => {
  const [displayStart, setDisplayStart] = useState(0);
  const [displayEnd, setDisplayEnd] = useState(0);
  const [rowHeight, setRowHeight] = useState(32); // measured later
  const [viewportRows, setViewportRows] = useState(50); // recalculated
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { isOpen: showPersonModal, openModal, closeModal } = useModal();

  const tbodyRef = useRef(null);
  const probeRowRef = useRef(null);

  const cols = 6; // update if you change columns

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    openModal();
  };

  // Measure actual row height (includes padding/classes)
  useLayoutEffect(() => {
    if (probeRowRef.current) {
      const h = probeRowRef.current.getBoundingClientRect().height || 32;
      setRowHeight(Math.max(24, Math.round(h)));
    }
  }, [data.length]);

  // Compute rows per viewport (with overscan)
  useEffect(() => {
    const compute = () => {
      const vh =
        typeof window !== 'undefined'
          ? window.innerHeight || document.documentElement.clientHeight || 0
          : 800;
      const rows = Math.ceil((vh * 3) / Math.max(1, rowHeight)); // 1x above + 1x below
      setViewportRows(rows);
      setDisplayEnd((prev) =>
        prev === 0 ? Math.min(rows, data.length) : prev
      );
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [rowHeight, data.length]);

  const setDisplayPositions = (pageScrollY) => {
    if (!tbodyRef.current) return;
    const tbodyTop =
      tbodyRef.current.getBoundingClientRect().top + window.scrollY;
    const relativeScroll = Math.max(0, pageScrollY - tbodyTop);

    const start = Math.max(
      0,
      Math.floor(relativeScroll / rowHeight) - Math.floor(viewportRows / 3)
    );
    const end = Math.min(data.length, start + viewportRows);

    setDisplayStart(start);
    setDisplayEnd(end);
  };

  // Page scroll listener
  useEffect(() => {
    const onScroll = throttle(() => {
      setDisplayPositions(window.scrollY);
    }, 80);

    setDisplayPositions(window.scrollY); // initial
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowHeight, viewportRows, data.length]);

  const rows = useMemo(() => {
    const out = [];

    // Top spacer (must have a <td> for height to apply)
    out.push(
      <tr key='startRowFiller' aria-hidden='true'>
        <td
          colSpan={cols}
          style={{ height: displayStart * rowHeight, padding: 0 }}
        />
      </tr>
    );

    for (let i = displayStart; i < displayEnd; i++) {
      const row = data[i];
      if (!row) continue;

      const voted = !!row.vote;

      // Format voting time if available
      let voteTime = '';
      if (voted && row.updatedAt) {
        try {
          const date = new Date(row.updatedAt);
          if (!isNaN(date.getTime())) {
            voteTime = date.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });
          }
        } catch (error) {
          // Keep voteTime empty if parsing fails
        }
      }

      const base =
        'px-5 text-center py-2 whitespace-nowrap text-sm font-medium text-white';
      const bg = voted
        ? 'bg-green-800 hover:bg-green-700'
        : 'bg-red-800 hover:bg-red-700';

      out.push(
        <tr
          key={i}
          className='h-8 group cursor-pointer'
          onClick={() => handlePersonClick(row)}
          ref={i === displayStart ? probeRowRef : null} // measure first rendered row
        >
          <td className={`hidden md:table-cell ${base} ${bg}`}>
            {row.tableNumber}
          </td>
          <td className={`hidden md:table-cell ${base} ${bg}`}>{row.order}</td>
          <td className={`${base} ${bg}`}>{row.lastName}</td>
          <td className={`${base} ${bg}`}>{row.firstName}</td>
          <td className={`hidden md:table-cell ${base} ${bg}`}>{row.dni}</td>
          <td className={`hidden md:table-cell ${base} ${bg}`}>
            <div className='flex flex-col items-center'>
              <span>{voted ? 'Si' : 'No'}</span>
              {voted &&
                row.updatedAt &&
                (() => {
                  try {
                    // Ensure number (milliseconds since epoch)
                    const ts = Number(row.updatedAt);
                    const date = new Date(ts);

                    if (!isNaN(date.getTime())) {
                      const time = date.toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                        timeZone: 'America/Argentina/Buenos_Aires',
                      });
                      return (
                        <span className='text-xs text-gray-300'>{time}</span>
                      );
                    }
                  } catch (error) {
                    console.error('Invalid date:', error);
                  }
                  return null;
                })()}
            </div>
          </td>
        </tr>
      );
    }

    // Bottom spacer
    out.push(
      <tr key='endRowFiller' aria-hidden='true'>
        <td
          colSpan={cols}
          style={{ height: (data.length - displayEnd) * rowHeight, padding: 0 }}
        />
      </tr>
    );

    return out;
  }, [data, displayStart, displayEnd, rowHeight]);

  return (
    <>
      <tbody ref={tbodyRef} className='divide-y divide-zinc-300'>
        {rows}
      </tbody>

      <InfoModal
        isOpen={showPersonModal}
        onClose={() => {
          closeModal();
          setSelectedPerson(null);
        }}
        title='Información del Votante'
      >
        {selectedPerson && (
          <div className='flex flex-col gap-3'>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <span className='font-semibold'>Mesa:</span>{' '}
                <span className='uppercase'>{selectedPerson.tableNumber}</span>
              </div>
              <div>
                <span className='font-semibold'>Orden:</span>{' '}
                <span className='uppercase'>{selectedPerson.order}</span>
              </div>
              <div>
                <span className='font-semibold'>Nombre:</span>{' '}
                <span className='uppercase'>{selectedPerson.firstName}</span>
              </div>
              <div>
                <span className='font-semibold'>Apellido:</span>{' '}
                <span className='uppercase'>{selectedPerson.lastName}</span>
              </div>
              <div>
                <span className='font-semibold'>DNI:</span> {selectedPerson.dni}
              </div>
              <div>
                <span className='font-semibold'>Voto:</span>{' '}
                {selectedPerson.vote ? 'Votó' : 'No votó'}
              </div>
            </div>
            <div>
              <span className='font-semibold'>Dirección:</span>{' '}
              {selectedPerson.address || '-'}
            </div>
            <div>
              <span className='font-semibold'>Afiliado:</span>{' '}
              {selectedPerson.affiliate ? 'Sí' : 'No'}
            </div>
            <div>
              <span className='font-semibold'>Referente:</span>{' '}
              {selectedPerson.referer || '-'}
            </div>
            <div>
              <span className='font-semibold'>Chofer:</span>{' '}
              {selectedPerson.driver || '-'}
            </div>
            <div>
              <span className='font-semibold'>Comentario:</span>{' '}
              {selectedPerson.message || '-'}
            </div>
          </div>
        )}
      </InfoModal>
    </>
  );
};

export default TableBody;
