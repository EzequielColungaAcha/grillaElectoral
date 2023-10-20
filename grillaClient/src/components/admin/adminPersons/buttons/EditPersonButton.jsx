import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { UPDATE_PERSON } from "../../../../graphql/persons";
import { useMutation } from "@apollo/client";

export const EditPersonButton = ({ person }) => {
  const MySwal = withReactContent(Swal);

  const [updatePerson] = useMutation(UPDATE_PERSON);

  return (
    <button
      onClick={() => {
        MySwal.fire({
          title: `Editar votante`,
          html: (
            <form className="flex flex-col gap-3">
              <label className="flex justify-between">
                Nombre:
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  defaultValue={person.firstName}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                />
              </label>
              <label className="flex justify-between">
                Apellido:
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  defaultValue={person.lastName}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                />
              </label>
              <label className="flex justify-between">
                DNI:
                <input
                  id="dni"
                  type="text"
                  inputMode="Numeric"
                  name="dni"
                  defaultValue={person.dni}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                />
              </label>
              <label className="flex justify-between">
                Orden:
                <input
                  id="order"
                  type="number"
                  name="order"
                  defaultValue={person.order}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                />
              </label>
              <label className="flex justify-between">
                Dirección:
                <input
                  id="address"
                  type="text"
                  name="address"
                  defaultValue={person.address}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                />
              </label>
              <label className="flex justify-between">
                Mensaje:
                <input
                  id="message"
                  type="text"
                  name="message"
                  defaultValue={person.message}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                />
              </label>
              <label className="flex justify-between">
                Afiliado:
                <select
                  id="affiliate"
                  name="affiliate"
                  defaultValue={person.affiliate}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                >
                  <option value="">-</option>
                  <option value="true">Afiliado</option>
                </select>
              </label>
              <label className="flex justify-between">
                Voto:
                <select
                  id="vote"
                  name="vote"
                  defaultValue={person.vote}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
                >
                  <option value="">No Votó</option>
                  <option value="true">Votó</option>
                </select>
              </label>
            </form>
          ),
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonText: "Enviar",
          cancelButtonText: "Cerrar",
          cancelButtonColor: '#464646',
          showLoaderOnConfirm: true,
          reverseButtons: true,
          preConfirm: () => {
            const id = person._id;
            const firstName = document.querySelector("#firstName").value;
            const lastName = document.querySelector("#lastName").value;
            const dni = document.querySelector("#dni").value;
            const address = document.querySelector("#address").value;
            const message = document.querySelector("#message").value;
            const affiliate = Boolean(document.querySelector("#affiliate").value);
            const order = document.querySelector("#order").valueAsNumber;
            const vote = Boolean(document.querySelector("#vote").value);
            return updatePerson({
              variables: {
                id,
                firstName,
                lastName,
                dni,
                vote,
                order,
                address,
                message,
                affiliate,
              },
            })
              .then((response) => {
                if (!response.data.updatePerson._id) {
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
      }}
      className="bg-sky-800 py-2 px-5 hover:bg-sky-600"
    >
      Editar
    </button>
  );
};
