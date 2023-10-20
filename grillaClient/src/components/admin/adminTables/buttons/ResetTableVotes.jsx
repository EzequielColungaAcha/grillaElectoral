import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { FACTION_DELETE } from "../../../../graphql/factions";
import { useMutation } from "@apollo/client";
import { UPDATE_STATUS } from "../../../../graphql/tables";

export const ResetTableVotes = ({ table, disabled }) => {
  const MySwal = withReactContent(Swal);

  const [deleteFactions] = useMutation(FACTION_DELETE);
  const [updateStatus] = useMutation(UPDATE_STATUS);

  return disabled ? (
    <button className="bg-gray-400 py-2 px-5 pointer-events-none bg-opacity-10">
      Reset Votaciones
    </button>
  ) : (
    <button
      onClick={() => {
        if (table.status == "Abierta") {
          var status = "Abierta";
        } else {
          var status = "Cerrada";
        }
        MySwal.fire({
          title: `Desea ELIMINAR las VOTACIONES de la Mesa ${table.number}?`,
          text: '¡ATENCIÓN! Asegurese de tener respaldo del recuento de votos.',
          icon: "warning",
          iconColor: "#d33",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#464646",
          confirmButtonText: "Eliminar",
          cancelButtonText: "Cancelar",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            deleteFactions({
              variables: {
                id: table._id,
                status,
              },
            });
          }
        });
      }}
      className="bg-orange-700 py-2 px-5 hover:bg-orange-600"
    >
      Reset Votaciones
    </button>
  );
};
