import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { UPDATE_FACTION_CONFIG } from "../../../../graphql/factions";
import { useMutation } from "@apollo/client";

export const EditFactionConfigButton = ({ factionConfig }) => {
  const MySwal = withReactContent(Swal);
  const [updateFactionConfig] = useMutation(UPDATE_FACTION_CONFIG);

  const showModal = () => {
    MySwal.fire({
      title: `Editar Lista ${factionConfig.name}`,
      html: (
        <form className="flex flex-col gap-3">
          <label className="flex justify-between">
            Nombre del Partido:
            <input
              id="factionConfigName"
              type="text"
              name="factionConfigName"
              defaultValue={factionConfig.name}
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Posición:
            <select
              id="factionConfigPosition"
              name="factionConfigPosition"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
              defaultValue={factionConfig.position}
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
              defaultValue={factionConfig.color}
              id="factionConfigColor"
              name="factionConfigColor"
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
      confirmButtonText: "Realizar cambios",
      cancelButtonText: "Cerrar",
      cancelButtonColor: '#464646',
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        const name = document.querySelector("#factionConfigName").value;
        const color = document.querySelector("#factionConfigColor").value;
        const position = document.querySelector("#factionConfigPosition").value;


        return updateFactionConfig({
          variables: {
            id: factionConfig._id,
            name,
            color,
            position,
          },
        })
          .then((response) => {
            if (!response.data.updateFactionConfig._id) {
              throw new Error(response.statusText);
            }
            return;
          })
          .catch((error) => {
            Swal.showValidationMessage(`Request failed: ${error}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };
  return (
    <button
      onClick={showModal}
      className="bg-sky-800 py-2 px-5 hover:bg-sky-600"
    >
      Editar
    </button>
  );
};
