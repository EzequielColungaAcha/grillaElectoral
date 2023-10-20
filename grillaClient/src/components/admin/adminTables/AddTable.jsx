import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CREATE_TABLE } from "../../../graphql/tables";
import { useMutation } from "@apollo/client";
import { GiTable } from "react-icons/gi";

const MySwal = withReactContent(Swal);

export const AddTable = () => {
  const [addTable] = useMutation(CREATE_TABLE);

  const showModal = () => {
    MySwal.fire({
      title: `Añadir mesa`,
      html: (
        <form className="flex flex-col gap-3">
          <label className="flex justify-between">
            Número de mesa:
            <input
              id="tableNumber"
              type="number"
              name="tableNumber"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Descripción (opcional):
            <input
              id="tableDescription"
              type="text"
              name="tableDescription"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
        </form>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Crear",
      cancelButtonText: "Cerrar",
      cancelButtonColor: '#464646',
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        const tableNumber = document.querySelector("#tableNumber").valueAsNumber;
        const tableDescription = document.querySelector("#tableDescription").value;

        return addTable({
          variables: {
            number: tableNumber,
            description: tableDescription,
            status: "Abierta",
          },
        })
          .then((response) => {
            if (!response.data.createTable._id) {
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
      className="py-3 px-5 bg-slate-600 flex justify-center gap-2 hover:bg-slate-500"
      onClick={showModal}
    >
      <GiTable className="text-xl" /> Añadir Mesa
    </button>
  );
};
