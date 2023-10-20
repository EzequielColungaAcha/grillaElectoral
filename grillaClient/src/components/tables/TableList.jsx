import { TableCard } from "./TableCard.jsx";

export function TableList({ data }) {
  return (
    <div className="h-full w-full px-5 flex flex-col items-center">
      {data.tables.map((table) => (
        <TableCard key={table._id} table={table} />
      ))}
    </div>
  );
}
