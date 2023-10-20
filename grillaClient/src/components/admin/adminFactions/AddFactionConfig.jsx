import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CREATE_FACTION_CONFIG } from "../../../graphql/factions";
import { useMutation } from "@apollo/client";
import { RiGroup2Fill } from "react-icons/ri";

const MySwal = withReactContent(Swal);

export const AddFactionConfig = ({ disabled }) => {
  const [createFactionConfig] = useMutation(CREATE_FACTION_CONFIG);

  const showModal = () => {
    MySwal.fire({
      title: `Añadir Partido / Candidato`,
      html: (
        <form className="flex flex-col gap-3">
          <label className="flex justify-between">
            Identificador:
            <input
              id="factionConfigName"
              type="text"
              name="factionConfigName"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Posición:
            <select
              id="factionConfigPosition"
              name="factionConfigPosition"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            >
              <option value="intendencia">Intendencia</option>
              <option value="gobernacion">Gobernación</option>
              <option value="presidencia">Presidencia</option>
            </select>
          </label>
          <label className="flex justify-between">
            Color del Partido:
            <input
              type="color"
              defaultValue="#ffffff"
              id="factionConfigColor"
              name="factionConfigColor"
              className="w-1/3"
            />
          </label>
          <label className="m-0 text-left">
            Colores de ayuda para el gotero:
            <div className="m-0">
              <div className="w-1/12" style={{backgroundColor: "rgb(0, 184, 255)"}}>&nbsp;</div>
              <div className="w-1/12" style={{backgroundColor: "rgb(108, 76, 153)"}}>&nbsp;</div>
              <div className="w-1/12" style={{backgroundColor: "rgb(208, 55, 29)"}}>&nbsp;</div>
              <div className="w-1/12" style={{backgroundColor: "rgb(248, 203, 6)"}}>&nbsp;</div>
            </div>
          </label>
        </form>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cerrar",
      cancelButtonColor: "#464646",
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        const name = document.querySelector("#factionConfigName").value;
        const color = document.querySelector("#factionConfigColor").value;
        const position = document.querySelector("#factionConfigPosition").value;

        return createFactionConfig({
          variables: {
            name,
            color,
            position,
          },
        })
          .then((response) => {
            if (!response.data.createFactionConfig._id) {
              throw new Error(response.statusText);
            }
            return;
          })
          .catch((error) => {
            Swal.showValidationMessage(`Error`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  return (
    <button
      className="p-3 bg-slate-600 rounded flex items-center gap-2 disabled:hidden hover:bg-slate-500"
      onClick={showModal}
      disabled={disabled}
    >
      <RiGroup2Fill className="text-xl" /> Añadir Partido
    </button>
  );
};
