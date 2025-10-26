import React from "react";
import PersonsTableBody from "./PersonsTableBody";
import { useDB } from "../../context/dbContext";

const PersonsTable = ({ persons, loading, error }) => {
  const [data, setData] = React.useState();
  const { updateRecord } = useDB();

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

  React.useEffect(() => {
    if (!persons) return;
    setData(persons);
  }, [persons]);

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error...</p>;
  
  return (
    <div className="flex flex-col gap-4 max-w-lg m-auto">
      <table className="">
        <PersonsTableBody
          data={data}
          updateVote={updateVote}
          voteLoading={false}
        />
      </table>
    </div>
  );
};

export default PersonsTable;