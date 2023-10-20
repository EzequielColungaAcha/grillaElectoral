import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { DELETE_PERSON } from "../../../../graphql/persons";
import { useMutation } from "@apollo/client";

export const DeletePersonButton = ({ person }) => {
  const MySwal = withReactContent(Swal);

  const [deletePerson] = useMutation(DELETE_PERSON);

  return (
    <button
      onClick={() => {
        MySwal.fire({
          title: `Desea ELIMINAR a \n${person.lastName}, ${person.firstName}\nNro de Orden: ${person.order}\nDNI: ${person.dni}??`,
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
            deletePerson({
              variables: {
                id: person._id,
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
