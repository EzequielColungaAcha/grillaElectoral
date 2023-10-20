import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { DELETE_TABLE } from "../../../../graphql/tables";
import { useMutation } from "@apollo/client";

export const DeleteTableButton = ({table}) => {
  const MySwal = withReactContent(Swal);

  const [deleteTable] = useMutation(DELETE_TABLE);

  return (
    <button
      onClick={() => {
        MySwal.fire({
          title: `Desea ELIMINAR la Mesa ${table.number}?`,
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
            deleteTable({
              variables: {
                id: table._id,
              },
            });
          }
        });
      }}
      className="bg-red-800 py-2 px-5 hover:bg-red-600"
    >
      Eliminar
    </button>
  );
};
