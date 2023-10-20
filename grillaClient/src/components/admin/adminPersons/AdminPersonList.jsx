import { AdminPersonCard } from "./AdminPersonCard.jsx";

export function AdminPersonList({ persons }) {
  return (
    <div className="flex items-center justify-center">
      <table className="w-fit">
        <thead>
          <tr>
            <th className="border-b-2 border-white p-2 w-16">Orden</th>
            <th className="border-b-2 border-white p-2 w-64">Apellido/s</th>
            <th className="border-b-2 border-white p-2 w-64">Nombre/s</th>
            <th className="border-b-2 border-white p-2 w-32">DNI</th>
            <th className="border-b-2 border-white p-2 w-40">Votó?</th>
            <th className="border-b-2 border-white p-2 w-64"></th>
          </tr>
        </thead>
        <tbody>
          {persons.map((person) => (
            <AdminPersonCard person={person} key={person._id} />
          ))}
        </tbody>
      </table>
      <br />
      <div className=" flex flex-col gap-5">
        <hr />
      </div>
    </div>
  );
}
