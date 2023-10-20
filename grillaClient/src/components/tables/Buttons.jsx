import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { UPDATE_STATUS } from "../../graphql/tables";
import { useMutation } from "@apollo/client";
import { Link } from "react-router-dom";
import { TiArrowBackOutline } from "react-icons/ti";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

export const ButtonCloseTable = ({ table, search }) => {
  const { user } = useContext(AuthContext);
  const [updateStatus] = useMutation(UPDATE_STATUS, {
    refetchQueries: ["getTable"],
  });
  const MySwal = withReactContent(Swal);
  return (
    <button
      className="text-center bg-red-800 hover:bg-red-700 px-3 py-2 mb-1 text-2xl"
      onClick={() => {
        search("");
        MySwal.fire({
          title: `DESEAS CERRAR LA MESA ${table.number}?`,
          icon: "warning",
          iconColor: "#ff2424",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#464646",
          confirmButtonText: "Si, cerrar!",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            table.factions.length == 0
              ? updateStatus({
                  variables: {
                    id: table._id,
                    number: table.number,
                    status: "Cerrada",
                    userName: user.name,
                    userRol: user.rol,
                  },
                })
              : updateStatus({
                  variables: {
                    id: table._id,
                    number: table.number,
                    status: "DatosEnviados",
                    userName: user.name,
                    userRol: user.rol,
                  },
                });
          }
        });
      }}
    >
      Cerrar Mesa
    </button>
  );
};

export const ButtonOpenTable = ({ table }) => {
  const { user } = useContext(AuthContext);
  const [updateStatus] = useMutation(UPDATE_STATUS, {
    refetchQueries: ["getTable"],
  });
  const MySwal = withReactContent(Swal);
  return (
    <button
      className="text-center bg-green-800 hover:bg-green-700 px-3 py-2 mb-1 text-2xl"
      onClick={() => {
        MySwal.fire({
          title: `DESEAS ABRIR LA\nMESA ${table.number}?`,
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#464646",
          confirmButtonText: "Si, abrir!",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            updateStatus({
              variables: {
                id: table._id,
                number: table.number,
                status: "Abierta",
                userName: user.name,
                userRol: user.rol,
              },
            });
          }
        });
      }}
    >
      Abrir Mesa {table.number}
    </button>
  );
};

export const ButtonBackToTables = () => {
  return (
    <Link to="/mesas">
      <button className="bg-sky-900 hover:bg-sky-800 flex items-center text-white px-3 py-2 mb-1 text-2xl">
        <TiArrowBackOutline /> Volver
      </button>
    </Link>
  );
};
