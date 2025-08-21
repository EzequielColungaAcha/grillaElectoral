import { useMutation } from "@apollo/client";
import { DELETE_USER } from "../../../../graphql/users";
import { useState } from "react";
import { ConfirmModal } from "../../../modals/ConfirmModal";

export const DeleteUserButton = ({ userD }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteUser] = useMutation(DELETE_USER);

  const handleConfirm = () => {
    deleteUser({
      variables: {
        id: userD._id,
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
        title={`¿Eliminar usuario ${userD.username}?`}
        message="Esta acción no se puede deshacer. El usuario será eliminado permanentemente."
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
