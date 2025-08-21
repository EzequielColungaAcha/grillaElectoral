import React from 'react';
import throttle from 'lodash.throttle';
import { useState } from 'react';

const itemRowHeight = 32; // same height as each row (32px, see styles.css)
const screenHeight = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
); // get the height of the screen
const offset = screenHeight; // We want to render more than we see, or else we will see nothing when scrolling fast
const rowsToRender = Math.floor((screenHeight + offset) / itemRowHeight);

const TableBody = ({ data, onPersonClick, loading }) => {
  const [displayStart, setDisplayStart] = React.useState(0);
  const [displayEnd, setDisplayEnd] = React.useState(0);
  const [scrollPosition, setScrollPosition] = React.useState(0);

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
    if (!data?.length) return;
    setDisplayPositions(scrollPosition);
  }, [scrollPosition, setDisplayPositions]);

  // add event listeners so we can change the scroll position, and alter what rows to display
  React.useEffect(() => {
    const onScroll = throttle(() => {
      const scrollTop = window.scrollY;
      if (data?.length > 0) {
        setScrollPosition(scrollTop);
        setDisplayPositions(scrollTop);
      }
    }, 100);

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [setDisplayPositions, data?.length]);

  // Add safety check for data
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (!!loading) {
      return (
        <tbody>
          <tr>
            <td colSpan='6' className='text-center py-8 text-zinc-300'></td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody>
        <tr>
          <td colSpan='6' className='text-center py-8 text-zinc-300'>
            No hay datos disponibles
          </td>
        </tr>
      </tbody>
    );
  }

  const rows = [];

  // add a filler row at the top. The further down we scroll the taller this will be
  rows.push(
    <tr
      key='startRowFiller'
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
              className='h-8 group cursor-pointer'
              onClick={() => onPersonClick && onPersonClick(row)}
            >
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell'>
                {row.tableNumber}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell'>
                {row.order}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700'>
                {row.lastName}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700'>
                {row.firstName}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell'>
                {row.dni}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-green-800 group-hover:bg-green-700 hidden md:table-cell'>
                {row.vote ? 'Yes' : 'No'}
              </td>
            </tr>
          )
        : rows.push(
            <tr
              key={i}
              className='h-8 group cursor-pointer'
              onClick={() => onPersonClick && onPersonClick(row)}
            >
              <td className='hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700'>
                {row.tableNumber}
              </td>
              <td className='hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700'>
                {row.order}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700'>
                {row.lastName}
              </td>
              <td className='px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700'>
                {row.firstName}
              </td>
              <td className='hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700'>
                {row.dni}
              </td>
              <td className='hidden md:table-cell px-5 text-center py-2 whitespace-nowrap text-sm font-medium bg-red-800 group-hover:bg-red-700'>
                {row.vote ? 'Yes' : 'No'}
              </td>
            </tr>
          );
    }
  }

  // add a filler row at the end. The further up we scroll the taller this will be
  rows.push(
    <tr
      key='endRowFiller'
      style={{ height: (data?.length - displayEnd) * itemRowHeight }}
    ></tr>
  );

  return (
    <>
      <tbody className='divide-y divide-zinc-300'>{rows}</tbody>
    </>
  );
};

export default TableBody;
