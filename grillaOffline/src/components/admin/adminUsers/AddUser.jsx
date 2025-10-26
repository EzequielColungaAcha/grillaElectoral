import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { ImUserPlus } from "react-icons/im";
import { useAuthService } from "../../../services/authService";

const MySwal = withReactContent(Swal);

export const AddUser = ({ firstUser }) => {
  const { registerUser } = useAuthService();

  const showModal = () => {
    MySwal.fire({
      title: `Añadir Usuario`,
      html: (
        <form className="flex flex-col gap-3">
          <label className="flex justify-between">
            Usuario:
            <input
              id="username"
              type="text"
              name="username"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Apellido y Nombre:
            <input
              id="name"
              type="text"
              name="name"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Contraseña:
            <input
              id="password"
              type="password"
              name="password"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            />
          </label>
          <label className="flex justify-between">
            Permisos:
            <select
              id="rol"
              name="rol"
              className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50"
            >
              {!firstUser ? (
                <>
                  <option value="fiscal">Fiscal</option>
                  <option value="prensa">Prensa</option>
                  <option value="base">Base</option>
                </>
              ) : (
                <></>
              )}
              <option value="admin">Admin</option>
            </select>
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
        const username = document.querySelector("#username").value;
        const name = document.querySelector("#name").value;
        const password = document.querySelector("#password").value;
        const rol = document.querySelector("#rol").value;

        return registerUser({
          username,
          name,
          password,
          rol,
        })
          .then((response) => {
            if (!response._id) {
              throw new Error("Error creating user");
            }
            return;
          })
          .catch((error) => {
            Swal.showValidationMessage(`Error: ${error.message}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  return (
    <button
      className="p-3 bg-slate-600 rounded flex items-center gap-2 disabled:hidden hover:bg-slate-500"
      onClick={showModal}
    >
      <ImUserPlus className="text-xl fill-white" /> Añadir Usuario
    </button>
  );
};