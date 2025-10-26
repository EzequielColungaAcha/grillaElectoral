import React from "react";
import PersonsTableBody from "./PersonsTableBody";
import { useDB } from "../../context/dbContext";
import { ConfirmModal } from '../modals/ConfirmModal';
import { useState } from 'react';

const PersonsTable = ({ persons, loading, error }) => {
  const [data, setData] = React.useState();
  const { updateRecord } = useDB();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const updateVote = async (variables) => {
    try {
      await updateRecord('persons', {
        _id: variables.id,
        firstName: variables.firstName,
        lastName: variables.lastName,
        dni: variables.dni,
        vote: variables.vote,
        order: variables.order,
        address: variables.address,
        message: variables.message,
        affiliate: variables.affiliate,
        tableId: variables.tableId || variables.table,
        tableNumber: variables.tableNumber,
      });
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  const handleConfirmVote = () => {
    if (selectedPerson) {
      const voteValue = selectedPerson.vote == true ? false : true;
      updateVote({
        id: selectedPerson._id,
        vote: voteValue,
        firstName: selectedPerson.firstName,
        lastName: selectedPerson.lastName,
        order: selectedPerson.order,
        dni: selectedPerson.dni,
        tableNumber: selectedPerson.tableNumber,
        message: selectedPerson.message,
        affiliate: selectedPerson.affiliate,
        address: selectedPerson.address,
        tableId: selectedPerson.tableId,
      });
    }
    setShowConfirm(false);
    setSelectedPerson(null);
  };
  React.useEffect(() => {
    if (!persons) return;
    setData(persons);
  }, [persons]);

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error...</p>;
  
  return (
    <>
      <div className="flex flex-col gap-4 max-w-lg m-auto">
        <table className="">
          <PersonsTableBody
            data={data}
            updateVote={updateVote}
            voteLoading={false}
            setShowConfirm={setShowConfirm}
            setSelectedPerson={setSelectedPerson}
          />
        </table>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setSelectedPerson(null);
        }}
        onConfirm={handleConfirmVote}
        title='Deshacer voto'
        message={
          selectedPerson
            ? `¿Deshacer el voto de ${selectedPerson.lastName.toUpperCase()}, ${selectedPerson.firstName.toUpperCase()}?\nNro de Orden: ${
                selectedPerson.order
              }\nDNI: ${selectedPerson.dni}`
            : ''
        }
        type='warning'
        confirmText='Deshacer'
        cancelText='Cancelar'
      />
    </>
  );
};

export default PersonsTable;