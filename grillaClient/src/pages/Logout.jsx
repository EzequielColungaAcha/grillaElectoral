import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const Logout = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    MySwal.fire({
      title: `Cerrar Sesión?`,
      icon: "warning",
      iconColor: "#d33",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#464646",
      confirmButtonText: "Cerrar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate("/");
      } else {
        navigate("/");
      }
    });
  };

  return (
    <div className="flex justify-center h-screen items-center">
    <button
      className="bg-rose-800 px-10 py-5 flex items-center text-4xl uppercase font-bold leading-snug text-slate-200 hover:text-rose-800 hover:bg-slate-200"
      onClick={onLogout}
    >
      <span className="ml-2">Cerrar Sesión</span>
    </button></div>
  );
};
