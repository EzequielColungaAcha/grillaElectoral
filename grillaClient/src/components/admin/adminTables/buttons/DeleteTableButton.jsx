import { DELETE_TABLE } from "../../../../graphql/tables";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ConfirmModal } from "../../../modals/ConfirmModal";

export const DeleteTableButton = ({table}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteTable] = useMutation(DELETE_TABLE);

  const handleConfirm = () => {
    deleteTable({
      variables: {
        id: table._id,
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
        title={`¿Eliminar Mesa ${table.number}?`}
        message="Esta acción no se puede deshacer. La mesa y todos sus datos serán eliminados permanentemente."
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
