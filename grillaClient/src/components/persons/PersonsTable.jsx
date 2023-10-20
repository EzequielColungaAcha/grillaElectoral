import React from "react";
import PersonsTableBody from "./PersonsTableBody";
import { useSubscription, useMutation } from "@apollo/client";
import { UPDATE_VOTE } from "../../graphql/persons";
import { PERSON_VOTED } from "../../graphql/subscription";

const PersonsTable = ({ persons, loading, error }) => {
  const [data, setData] = React.useState();

  const { data: personVoted } = useSubscription(PERSON_VOTED);
  const [updateVote, { loading: voteLoading }] = useMutation(UPDATE_VOTE);

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
          voteLoading={voteLoading}
        />
      </table>
    </div>
  );
};

export default PersonsTable;
