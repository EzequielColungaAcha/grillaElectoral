import { TABLE_CHANGED } from "../../../graphql/subscription";
import { useSubscription } from "@apollo/client";
import { DeleteTableButton } from "./buttons/DeleteTableButton";
import { MdOutlineHowToVote, MdOutlineDrafts } from "react-icons/md";
import { BsSendCheck } from "react-icons/bs";
import { EditTableButton } from "./buttons/EditTableButton";
import { UploadCSVButton } from "./buttons/UploadCSVButton";
import { InspectTable } from "./buttons/InspectTable";
import { ResetTableVotes } from "./buttons/ResetTableVotes";

export function AdminTableCard({ table }) {
  const { data: tableChanged } = useSubscription(TABLE_CHANGED);

  const status = () => {
    if (table.status == "Abierta" && table.factions.length < 1) {
      return (
        <p className="justify-center bg-green-600 bg-opacity-30 text-green-200 py-1 px-5 rounded-lg shadow flex items-center gap-3">
          <MdOutlineHowToVote className="text-lg" /> Abierta
        </p>
      );
    } else if (table.status == "Abierta" && table.factions.length > 0) {
      return (
        <p className="justify-center bg-sky-600 bg-opacity-30 text-sky-200 py-1 px-5 rounded-lg shadow flex items-center gap-3">
          <BsSendCheck className="text-lg" /> Abierta DE
        </p>
      );
    } else if (table.status == "Cerrada") {
      return (
        <p className="justify-center bg-orange-600 bg-opacity-30 text-orange-200 py-1 px-5 rounded-lg shadow flex items-center gap-3">
          <MdOutlineDrafts className="text-lg" /> Cerrada
        </p>
      );
    } else {
      return (
        <p className="justify-center bg-sky-600 bg-opacity-30 text-sky-200 py-1 px-5 rounded-lg shadow flex items-center gap-3">
          <BsSendCheck className="text-lg" /> Datos Enviados
        </p>
      );
    }
  };

  return (
    <div className="flex gap-10 w-full justify-center">
      <div className="flex w-10/12 justify-between bg-zinc-800 rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 items-center">
        <div className="flex flex-col text-center w-3/12">
          <h2 className="text-xl font-medium">Mesa {table.number}</h2>
          <small className="text-slate-100">
            {table.description ? table.description : ""}
          </small>
          <h3>
            {table.voted} / {table.totalPersons} (
            {isNaN(table.voted / table.totalPersons)
              ? "0.00"
              : ((table.voted / table.totalPersons) * 100).toFixed(2)}
            %)
          </h3>
          {status()}
        </div>
        <div className="flex gap-5 h-fit">
          <InspectTable table={table} />
          <EditTableButton table={table} />
          <DeleteTableButton table={table} />
          <UploadCSVButton table={table} />
          <ResetTableVotes table={table} disabled={!table.factions.length} />
        </div>
      </div>
    </div>
  );
}
