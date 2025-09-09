import React from "react";
import TableBody from "./TableBody";

const Table = ({ persons, loading, error, onPersonClick }) => {
  const [data, setData] = React.useState();

  React.useEffect(() => {
    if (!persons) return;
    setData(persons);
  }, [persons]);

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error...</p>;

  // Add safety check for data
  if (!data || !Array.isArray(data)) {
    return (
      <div className='text-center text-zinc-300'>No hay datos disponibles</div>
    );
  }

  return (
    <div className="flex flex-col">
      <table className="border border-zinc-200">
        <thead className="sticky top-0 bg-zinc-800">
          <tr>
            <th
              scope="col"
              className="px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell"
            >
              Mesa
            </th>
            <th
              scope="col"
              className="px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell"
            >
              Orden
            </th>
            <th
              scope="col"
              className="px-5 py-2 font-medium text-white uppercase text-center"
            >
              Apellido
            </th>
            <th
              scope="col"
              className="px-5 py-2 font-medium text-white uppercase text-center"
            >
              Nombre
            </th>
            <th
              scope="col"
              className="px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell"
            >
              DNI
            </th>
            <th
              scope="col"
              className="px-5 py-2 font-medium text-white uppercase text-center hidden md:table-cell"
            >
              Voto
            </th>
          </tr>
        </thead>

        <TableBody data={data} onPersonClick={onPersonClick} />
      </table>
    </div>
  );
};

export default Table;