import { TableList } from "../components/tables/TableList";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_TABLES } from "../graphql/tables";
import { TABLE_ADDED, TABLE_DELETED } from "../graphql/subscription";

export function Tables() {
  const { loading, error, data, refetch } = useQuery(GET_TABLES);

  const { data: tableAdded } = useSubscription(TABLE_ADDED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });
  const { data: tableDeleted } = useSubscription(TABLE_DELETED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error</p>;

  return data.tables.length ? (
    <div className="bg-zinc-900 shadow-black p-8 h-full w-full">
      <h1 className="text-4xl font-bold py-2 mb-4 text-center underline underline-offset-4 text-slate-100">
        Mesas
      </h1>
      <div className="flex justify-between gap-x-1">
        <TableList data={data} />
      </div>
    </div>
  ) : (
    <div className="bg-zinc-900 shadow-black p-8 h-full w-full">
      <h1 className="text-4xl font-bold py-2 mb-4 text-center text-slate-100">
        Aún no hay mesas cargadas
      </h1>
    </div>
  );
}
