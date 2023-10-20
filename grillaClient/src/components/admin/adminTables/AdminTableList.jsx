import { AdminTableCard } from "./AdminTableCard.jsx";

export function AdminTableList({ tables }) {
  return (
    <div className="h-full w-full px-5 flex flex-col items-center">
      {tables.map((table) => (
        <AdminTableCard key={table._id} table={table} />
      ))}
    </div>
  );
}
