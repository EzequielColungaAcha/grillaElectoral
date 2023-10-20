import { ButtonBackToTables } from "../Buttons";
import { ButtonOpenTable } from "../Buttons";
import { EditVotesButton } from "./datos/EditVotesButton";

export const StatusDatosEnviados = ({ table }) => {
  return (
    <div>
      <div className="p-2">
        <ButtonBackToTables />
      </div>
      <div className="w-full text-center items-center justify-center flex flex-col gap-10 mt-5">
        <h1 className="text-3xl bg-sky-600 bg-opacity-30 text-sky-200 py-1 px-5 rounded-lg shadow flex items-center gap-3 justify-center w-fit">Mesa {table.number} Cerrada<br />- Datos Enviados -</h1>
        {table.description ? <small className="text-slate-100 text-lg">({table.description})</small> : ''}
        <p className="text-justify text-xl w-fit px-2">Los datos del recuento de votos ya fueron enviados, aún así puedes editarlos con el siguiente botón:</p>
        <EditVotesButton table={table} />

        <p className="text-justify text-xl w-fit px-2">Si por algún motivo deseas reabrir la mesa, puedes hacer click en el siguiente botón:</p>
        <ButtonOpenTable table={table} />
      </div>
    </div>
  );
};
