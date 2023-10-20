import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { UPDATE_TABLE } from "../../../../graphql/tables";
import { useMutation } from "@apollo/client";

export const EditTableButton = ({ table }) => {
  const MySwal = withReactContent(Swal);
  const [updateTable] = useMutation(UPDATE_TABLE);

  const showModal = () => {
    MySwal.fire({
      title: `Editar Mesa ${table.number}`,
      html: (
        <form className="flex flex-col gap-3">
          <label className="flex justify-between">
            Número de mesa:
            <input
              id="tableNumber"
              type="number"
              name="tableNumber"
              min={1}
              defaultValue={table.number}
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Descripción (opcional):
            <input
              id="tableDescription"
              type="text"
              name="tableDescription"
              defaultValue={table.description}
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Estado:
            <select
              id="status"
              name="status"
              defaultValue={table.status}
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            >
              <option value="Abierta">Abierta</option>
              {table.factions == 0 ? (
                <option value="Cerrada">Cerrada</option>
              ) : (
                <option value="DatosEnviados">Datos Enviados</option>
              )}
            </select>
          </label>
        </form>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Realizar cambios",
      cancelButtonText: "Cerrar",
      cancelButtonColor: "#464646",
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        let tableNumber = document.querySelector("#tableNumber").valueAsNumber;
        const tableDescription = document.querySelector('#tableDescription').value
        const tableStatus = document.querySelector("#status").value;
        if (isNaN(tableNumber)) {
          tableNumber = table.number;
        }

        return updateTable({
          variables: {
            id: table._id,
            number: tableNumber,
            description: tableDescription,
            status: tableStatus,
          },
        })
          .then((response) => {
            if (!response.data.updateTable._id) {
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
