import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { DELETE_FACTION_CONFIG } from "../../../../graphql/factions";
import { useMutation } from "@apollo/client";

export const DeleteFactionConfigButton = ({ factionConfig, disabled }) => {
  const MySwal = withReactContent(Swal);

  const [deleteFactionConfig] = useMutation(DELETE_FACTION_CONFIG);

  return (
    <button
      disabled={disabled}
      onClick={() => {
        MySwal.fire({
          title: `Desea ELIMINAR la Lista ${factionConfig.name}?`,
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
            deleteFactionConfig({
              variables: {
                id: factionConfig._id,
              },
            });
          }
        });
      }}
      className="bg-red-800 py-2 px-5 hover:bg-red-600 disabled:hidden"
    >
      Eliminar
    </button>
  );
};
