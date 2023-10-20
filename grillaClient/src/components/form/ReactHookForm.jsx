import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { CREATE_PERSON } from "../../graphql/persons";
import { useMutation } from "@apollo/client";
import { BsFillPersonPlusFill } from "react-icons/bs";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const MySwal = withReactContent(Swal);

export const FormModal = ({ tableId, tableNumber }) => {
  const { user } = useContext(AuthContext);
  const [addPerson] = useMutation(CREATE_PERSON, {
    refetchQueries: ["getTable"],
  });

  const showModal = () => {
    MySwal.fire({
      title: `Añadir votante`,
      html: (
        <form className="flex flex-col gap-3">
          <label className="flex justify-between">
            Nombre:
            <input
              id="firstName"
              type="text"
              name="firstName"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/2"
            />
          </label>
          <label className="flex justify-between">
            Apellido:
            <input
              id="lastName"
              type="text"
              name="lastName"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/2"
            />
          </label>
          <label className="flex justify-between">
            DNI:
            <input
              id="dni"
              type="text"
              inputMode="Numeric"
              name="dni"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/2"
            />
          </label>
          <label className="flex justify-between">
            Orden:
            <input
              id="order"
              type="number"
              name="order"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/2"
            />
          </label>
          <label className="flex justify-between">
            Mesa:
            <input
              id="table"
              type="number"
              name="table"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/2"
              value={tableNumber}
              disabled
            />
          </label>
        </form>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: "Cerrar",
      cancelButtonColor: "#464646",
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        const firstName = document.querySelector("#firstName").value;
        const lastName = document.querySelector("#lastName").value;
        const dni = document.querySelector("#dni").value;
        const order = document.querySelector("#order").valueAsNumber;
        const vote = false;
        const address = "";
        const message = "";
        const affiliate = false;

        return addPerson({
          variables: {
            firstName,
            lastName,
            dni,
            vote,
            order,
            address,
            message,
            affiliate,
            tableId,
            tableNumber,
            userName: user.name,
            userRol: user.rol,
          },
        })
          .then((response) => {
            if (!response.data.createPerson._id) {
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
      className="p-3 bg-slate-600 rounded flex items-center gap-2"
      onClick={showModal}
    >
      <BsFillPersonPlusFill /> Añadir votante
    </button>
  );
};
