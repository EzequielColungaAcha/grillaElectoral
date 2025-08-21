import { DELETE_FACTION_CONFIG } from "../../../../graphql/factions";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import { ConfirmModal } from "../../../modals/ConfirmModal";

export const DeleteFactionConfigButton = ({ factionConfig, disabled }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteFactionConfig] = useMutation(DELETE_FACTION_CONFIG);

  const handleConfirm = () => {
    deleteFactionConfig({
      variables: {
        id: factionConfig._id,
      },
    });
    setShowConfirm(false);
  };

  return (
    <>
      <button
        disabled={disabled}
        onClick={() => setShowConfirm(true)}
        className="bg-red-800 py-2 px-5 hover:bg-red-600 disabled:hidden"
      >
        Eliminar
      </button>
      
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title={`¿Eliminar Lista ${factionConfig.name}?`}
        message="Esta acción no se puede deshacer. La lista será eliminada permanentemente."
        type="danger"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </>
  );
};
