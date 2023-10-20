import React, { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import throttle from "lodash.throttle";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const itemRowHeight = 184; // same height as each row (184px)
const screenHeight = Math.max(
  document.documentElement.clientHeight,
  window.innerHeight || 0
); // get the height of the screen
const offset = screenHeight; // We want to render more than we see, or else we will see nothing when scrolling fast
const rowsToRender = Math.floor((screenHeight + offset) / itemRowHeight);

const PersonsTableBody = ({ data, updateVote, voteLoading }) => {
  const { user } = useContext(AuthContext);

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
                !voteLoading &&
                  MySwal.fire({
                    title: `Deshacer el voto de \n${row.lastName.toUpperCase()}, ${row.firstName.toUpperCase()}\nNro de Orden: ${
                      row.order
                    }\nDNI: ${row.dni}?`,
                    icon: "warning",
                    iconColor: "#d33",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#464646",
                    confirmButtonText: "Deshacer",
                    cancelButtonText: "Cancelar",
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      const voteValue = row.vote == true ? false : true;
                      updateVote({
                        variables: {
                          id: row._id,
                          vote: voteValue,
                          userName: user.name,
                          userRol: user.rol,
                          firstName: row.firstName,
                          lastName: row.lastName,
                          order: row.order,
                          dni: row.dni,
                          tableNumber: row.tableNumber,
                          message: row.message,
                          affiliate: row.affiliate,
                          address: row.address,
                        },
                      });
                    }
                  });
              }}
            >
              <td>
                {voteLoading ? (
                  <div className="flex flex-col animate-pulse bg-slate-700 bg-opacity-50 text-white space-y-3 px-4 py-6 rounded-lg shadow items-center cursor-default">
                    <h1 className="h-12 bg-gray-300 rounded-lg w-24 dark:bg-gray-600"></h1>

                    <p className="w-3/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                    <p className="w-4/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                    <div className="flex justify-between w-full">
                      <p className="w-2/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                      <p className="w-1/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-700 hover:bg-green-600 bg-opacity-50 text-black space-y-3 p-4 rounded-lg shadow">
                    <div className="text-center font-bold text-5xl">
                      #{row.order}
                    </div>
                    <div className="flex flex-col text-center text-xl">
                      <h1 className="font-bold text-2xl uppercase">
                        {row.lastName}
                      </h1>
                      <h1 className="font-bold text-2xl uppercase">
                        {row.firstName}
                      </h1>
                      <div className="flex justify-between">
                        <div className="font-bold text-xl">DNI: {row.dni}</div>
                        <div className="w-20">
                          <span className="p-1.5 text-sm font-medium uppercase tracking-wider text-green-800 rounded-lg ">
                            Votó
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          )
        : rows.push(
            <tr
              key={i}
              className="h-8 group cursor-pointer"
              onClick={() => {
                const voteValue = row.vote == true ? false : true;
                console.log(user);
                !voteLoading &&
                  updateVote({
                    variables: {
                      id: row._id,
                      vote: voteValue,
                      userName: user.name,
                      userRol: user.rol,
                      firstName: row.firstName,
                      lastName: row.lastName,
                      order: row.order,
                      dni: row.dni,
                      tableNumber: row.tableNumber,
                      message: row.message,
                      affiliate: row.affiliate,
                      address: row.address,
                    },
                  });
              }}
            >
              <td>
                {voteLoading ? (
                  <div className="flex flex-col animate-pulse bg-slate-700 bg-opacity-50 text-white space-y-3 px-4 py-6 rounded-lg shadow items-center cursor-default">
                    <h1 className="h-12 bg-gray-300 rounded-lg w-24 dark:bg-gray-600"></h1>

                    <p className="w-3/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                    <p className="w-4/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                    <div className="flex justify-between w-full">
                      <p className="w-2/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                      <p className="w-1/5 h-3 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700"></p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-700 hover:bg-red-600 bg-opacity-50 text-black space-y-3 p-4 rounded-lg shadow">
                    <div className="text-center font-bold text-5xl">
                      #{row.order}
                    </div>
                    <div className="flex flex-col text-center text-xl">
                      <h1 className="font-bold text-2xl uppercase">
                        {row.lastName}
                      </h1>
                      <h1 className="font-bold text-2xl uppercase">
                        {row.firstName}
                      </h1>
                      <div className="flex justify-between">
                        <div className="font-bold text-xl">DNI: {row.dni}</div>
                        <div className="w-20">
                          <span className="p-1.5 text-sm font-medium uppercase tracking-wider text-red-800 rounded-lg ">
                            No Votó
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

  return <tbody className="divide-y divide-slate-300">{rows}</tbody>;
};

export default PersonsTableBody;
