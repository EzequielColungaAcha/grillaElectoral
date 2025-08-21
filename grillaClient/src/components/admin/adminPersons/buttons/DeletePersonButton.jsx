import { DELETE_PERSON } from "../../../../graphql/persons";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ConfirmModal } from "../../../modals/ConfirmModal";

export const DeletePersonButton = ({ person }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletePerson] = useMutation(DELETE_PERSON);

  const handleConfirm = () => {
    deletePerson({
      variables: {
        id: person._id,
      },
    });
    setShowConfirm(false);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="bg-red-800 py-2 px-5 hover:bg-red-600"
      >
        Eliminar
      </button>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="¿Eliminar votante?"
        message={`¿Desea eliminar a ${person.lastName}, ${person.firstName}?\nNro de Orden: ${person.order}\nDNI: ${person.dni}\n\nEsta acción no se puede deshacer.`}
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
