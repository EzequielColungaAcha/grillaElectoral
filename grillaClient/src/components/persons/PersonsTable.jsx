import React from 'react';
import PersonsTableBody from './PersonsTableBody';
import { useSubscription, useMutation } from '@apollo/client';
import { UPDATE_VOTE } from '../../graphql/persons';
import { PERSON_VOTED } from '../../graphql/subscription';
import { ConfirmModal } from '../modals/ConfirmModal';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/authContext';

const PersonsTable = ({ persons, loading, error }) => {
  const { user } = useContext(AuthContext);
  const [data, setData] = React.useState();
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);

  const { data: personVoted } = useSubscription(PERSON_VOTED);
  const [updateVote, { loading: voteLoading }] = useMutation(UPDATE_VOTE);

  React.useEffect(() => {
    if (!persons) return;
    setData(persons);
  }, [persons]);

  const handleConfirmVote = () => {
    if (selectedPerson) {
      const voteValue = selectedPerson.vote == true ? false : true;
      updateVote({
        variables: {
          id: selectedPerson._id,
          vote: voteValue,
          userName: user?.name || 'unknown',
          userRol: user?.rol || 'unknown',
          tableNumber: selectedPerson.tableNumber,
        },
      }).catch((error) => {
        console.error('Error updating vote:', error);
      });
    }
    setShowConfirm(false);
    setSelectedPerson(null);
  };
  if (loading) return <span className='loader'></span>;
  if (error) return <p>Error...</p>;
  return (
    <>
      <div className='flex flex-col gap-4 max-w-lg m-auto'>
        <table className=''>
          <PersonsTableBody
            data={data}
            updateVote={updateVote}
            voteLoading={voteLoading}
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
