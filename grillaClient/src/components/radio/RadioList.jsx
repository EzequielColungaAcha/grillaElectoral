import { useState, useEffect } from "react";
import { RadioCard } from "./RadioCard";
import { MdOutlineDrafts, MdOutlineHowToVote } from "react-icons/md";
import { BsSendCheck } from "react-icons/bs";

export function RadioList({ tables, personVoted, personTotal }) {
  const [hour, setHour] = useState(0);
  const [minute, setMinute] = useState(0);
  const [second, setSecond] = useState(0);

  useEffect(() => {
    const update = () => {
      const date = new Date();
      let hour = date.getHours();
      setHour(hour);
      setMinute(String(date.getMinutes()).padStart(2, "0"));
      setSecond(String(date.getSeconds()).padStart(2, "0"));
    };

    update();

    const interval = setInterval(() => {
      update();
    }, 1000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div>
      <div className="flex">
        <div className="flex w-64 mx-auto mb-3 flex-col border-2 border-slate-400 bg-slate-700 text-center px-4 py-2 shadow-slate-400 shadow-md rounded">
          <h1 className="text-slate-300 text-2xl text-center">Totales</h1>
          <p className="text-slate-300 text-xl text-center">
            {personVoted} / {personTotal} (
            {isNaN(personVoted / personTotal)
              ? "0.00"
              : ((personVoted / personTotal) * 100).toFixed(2)}
            %)
          </p>
        </div>
        <div className="flex w-64 mx-auto mb-3 flex-col border-2 border-slate-400 bg-slate-700 text-center px-4 py-2 shadow-slate-400 shadow-md rounded">
          <h1 className="text-slate-300 text-2xl text-center">Hora actual</h1>
          <p className="text-slate-300 text-xl text-center">
            {`${hour}:${minute}:${second}`}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex gap-5 p-3">
          <div>
            <div className="flex items-center space-x-4">
              <span className="p-2 rounded-full text-2xl flex justify-center items-center bg-green-600">
                <MdOutlineHowToVote />
              </span>
              <div className="font-medium text-white text-center">
                <div className="text-lg">Mesa Abierta</div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <span className="p-2 rounded-full text-2xl flex justify-center items-center bg-orange-600">
                <MdOutlineDrafts />
              </span>
              <div className="font-medium text-white text-center">
                <div className="text-lg">Mesa Cerrada - Contando los votos</div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-4">
              <span className="p-2 rounded-full text-2xl flex justify-center items-center bg-sky-600">
                <BsSendCheck />
              </span>
              <div className="font-medium text-white text-center">
                <div className="text-lg">Datos Enviados</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3 flex-wrap flex-grow justify-center items-center">
        {tables.map((table) => (
          <RadioCard table={table} key={table._id} />
        ))}
      </div>
    </div>
  );
}
