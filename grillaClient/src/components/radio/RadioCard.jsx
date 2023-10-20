import { MdOutlineHowToVote, MdOutlineDrafts } from "react-icons/md";
import { BsSendCheck } from "react-icons/bs";

export const RadioCard = ({ table }) => {
  function statusStyle() {
    if (table.status == "Abierta" && table.factions.length < 1) {
      return (
        <span className="p-1 flex justify-center items-center bg-green-600 rounded">
          <MdOutlineHowToVote />
        </span>
      );
    } else if (table.status == "Cerrada") {
      return (
        <span className="p-1 flex justify-center items-center bg-orange-600 rounded">
          <MdOutlineDrafts />
        </span>
      );
    } else {
      return (
        <span className="p-1 flex justify-center items-center bg-sky-600 rounded">
          <BsSendCheck />
        </span>
      );
    }
  }
  const votePercent = ((table.voted / table.totalPersons) * 100).toFixed(2);
  return (
    <div className="flex w-48 flex-col border-2 border-slate-400 bg-slate-700 text-center px-4 py-2 shadow-slate-400 shadow-md rounded">
      <h1 className="text-slate-300 text-2xl text-center">
        Mesa {table.number}
      </h1>
      <small className="text-slate-300 text-center">
        {table.description ? table.description : "-"}
      </small>
      <p className="text-slate-300 text-3xl text-center">{statusStyle()}</p>
      <p className="text-slate-300 text-xl text-center">
        {table.voted} / {table.totalPersons} (
        {isNaN(votePercent) ? "0.00" : votePercent}%)
      </p>
    </div>
  );
};
