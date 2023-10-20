import { useNavigate } from "react-router-dom";
import { TABLE_CHANGED } from "../../graphql/subscription";
import { useSubscription } from "@apollo/client";
import { MdOutlineDrafts, MdOutlineHowToVote } from "react-icons/md";
import { BsSendCheck } from "react-icons/bs";

export function TableCard({ table }) {
  const { data } = useSubscription(TABLE_CHANGED);
  const navigate = useNavigate();

  const status = () => {
    if (table.status == "Abierta" && table.factions.length < 1) {
      return (
        <p className="bg-green-600 bg-opacity-30 text-green-200 py-1 px-5 rounded-lg shadow flex items-center gap-3 justify-center w-fit">
          <MdOutlineHowToVote className="text-lg" /> Abierta
        </p>
      );
    } else if (table.status == "Abierta" && table.factions.length > 0) {
      return (
        <p className="bg-sky-600 bg-opacity-30 text-sky-200 py-1 px-5 rounded-lg shadow flex items-center gap-3 justify-center w-fit">
          <BsSendCheck className="text-lg" /> Abierta
        </p>
      );
    } else if (table.status == "Cerrada") {
      return (
        <p className="bg-orange-600 bg-opacity-30 text-orange-200 py-1 px-5 rounded-lg shadow flex items-center gap-3 justify-center w-fit">
          <MdOutlineDrafts className="text-lg" /> Cerrada
        </p>
      );
    } else {
      return (
        <p className="bg-sky-600 bg-opacity-30 text-sky-200 py-1 px-5 rounded-lg shadow flex items-center gap-3 justify-center w-fit">
          <BsSendCheck className="text-lg" /> Datos Enviados
        </p>
      );
    }
  };

  return (
    <div
      onClick={() => navigate(`/mesas/${table._id}`)}
      className="bg-zinc-800 w-full flex flex-col gap-1 justify-center items-center rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 hover:cursor-pointer max-w-md"
    >
      <h2 className="text-center items-center text-2xl font-medium text-slate-100 flex gap-2">
        Mesa {table.number} {table.description ? "•" : ""}{" "}
        {table.description ? (
          <small className="text-slate-100">{table.description}</small>
        ) : (
          ""
        )}
      </h2>
      {status()}
    </div>
  );
}
