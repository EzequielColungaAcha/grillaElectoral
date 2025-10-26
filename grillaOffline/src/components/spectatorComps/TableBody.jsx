import React from "react";
import throttle from "lodash.throttle";
import { useState } from 'react';
import { InfoModal } from '../modals/InfoModal';
import { useModal } from '../../hooks/useModal';

const itemRowHeight = 32; // same height as each row (32px, see styles.css)
const screenHeight = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
); // get the height of the screen
const offset = screenHeight; // We want to render more than we see, or else we will see nothing when scrolling fast
const rowsToRender = Math.floor((screenHeight + offset) / itemRowHeight);

const TableBody = ({ data }) => {
  const [displayStart, setDisplayStart] = React.useState(0);
  const [displayEnd, setDisplayEnd] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const {
    isOpen: showPersonModal,
    openModal: openPersonModal,
    closeModal: closePersonModal,
  } = useModal();

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    openPersonModal();
  };

  const setDisplayPositions = React.useCallback(
    (scroll) => {
      // we want to start rendering a bit above the visible screen
      const scrollWithOffset = Math.floor(scroll - rowsToRender - offset / 2);
      // start position should never be less than 0
      const displayStartPosition = Math.round(
        Math.max(0, Math.floor(scrollWithOffset / itemRowHeight))
      );

      // end position should never be larger than our data array
      const displayEndPosition = Math.round(
        Math.min(displayStartPosition + rowsToRender, data?.length)
      );

      setDisplayStart(displayStartPosition);
      setDisplayEnd(displayEndPosition);
    },
    [data?.length]
  );

  // We want to set the display positions on renering
  React.useEffect(() => {
    setDisplayPositions(scrollPosition);
  }, [scrollPosition, setDisplayPositions]);

  // add event listeners so we can change the scroll position, and alter what rows to display
  React.useEffect(() => {
    const onScroll = throttle(() => {
      const scrollTop = window.scrollY;
      if (data?.length !== 0) {
        setScrollPosition(scrollTop);
        setDisplayPositions(scrollTop);
      }
    }, 100);

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [setDisplayPositions, data?.length]);

  const rows = [];

  // add a filler row at the top. The further down we scroll the taller this will be
  rows.push(
    <tr
      key="startRowFiller"
      style={{ height: displayStart * itemRowHeight }}
    ></tr>
  );

  // add the rows to actually render
  for (let i = displayStart; i < displayEnd; ++i) {
    const row = data[i];
    if (row !== undefined) {
      row.vote
        ? rows.push(
            <tr
              key={i}
              className="h-8 group cursor-pointer"
              onClick={() => {
                handlePersonClick(row);
              }}
            >
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell">
                {row.tableNumber}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell">
                {row.order}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700">
                {row.lastName}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700">
                {row.firstName}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell">
                {row.dni}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell">
                {row.vote ? "Yes" : "No"}
              </td>
            </tr>
          )
        : rows.push(
            <tr
              key={i}
              className="h-8 group cursor-pointer"
              onClick={() => {
                handlePersonClick(row);
              }}
            >
              <td className="hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700">
                {row.tableNumber}
              </td>
              <td className="hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700">
                {row.order}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700">
                {row.lastName}
              </td>
              <td className="px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700">
                {row.firstName}
              </td>
              <td className="hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700">
                {row.dni}
              </td>
              <td className="hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700">
                {row.vote ? "Yes" : "No"}
              </td>
            </tr>
          );
    }
  }

  // add a filler row at the end. The further up we scroll the taller this will be
  rows.push(
    <tr
      key="endRowFiller"
      style={{ height: (data?.length - displayEnd) * itemRowHeight }}
    ></tr>
  );

  return (
    <>
      <tbody className="divide-y divide-zinc-300">{rows}</tbody>
      
      {/* Person Details Modal */}
      <InfoModal
        isOpen={showPersonModal}
        onClose={() => {
          closePersonModal();
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