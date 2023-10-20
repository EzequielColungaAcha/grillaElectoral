import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useMutation } from "@apollo/client";
import { DELETE_USER } from "../../../../graphql/users";

export const DeleteUserButton = ({ userD }) => {
  const MySwal = withReactContent(Swal);

  const [deleteUser] = useMutation(DELETE_USER);

  return (
    <button
      onClick={() => {
        MySwal.fire({
          title: `Desea ELIMINAR el Usuario ${userD.username}?`,
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
            deleteUser({
              variables: {
                id: userD._id,
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
