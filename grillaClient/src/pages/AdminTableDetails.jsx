import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_TABLE } from "../graphql/tables.js";
import { AdminPersonList } from "../components/admin/adminPersons/AdminPersonList.jsx";
import { TABLE_CHANGED } from "../graphql/subscription.js";
import { PERSON_DELETED, PERSON_ADDED, FACTION_DELETED } from "../graphql/subscription.js";
import { FormModal } from "../components/form/ReactHookForm.jsx";
import { BackToAdminButton } from "../components/admin/adminPersons/buttons/BackToAdminButton.jsx";

export function AdminTableDetails() {
  const params = useParams();
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_TABLE, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
  });

  const { data: personDeleted } = useSubscription(PERSON_DELETED, {
    onData: ({ client, onData }) => {
      console.log(onData)
    },
  });

  const { data: personAdded } = useSubscription(PERSON_ADDED, {
    onData: ({ client, onData }) => {
      console.log(onData)
    },
  });

  const { data: tableChanged } = useSubscription(TABLE_CHANGED, {
    onData: ({ client, onData }) => {
      console.log(onData)
    },
  });

  const { data: factionDeleted } = useSubscription(FACTION_DELETED, {
    onData: ({ client, onData }) => {
      console.log(factionDeleted)
    },
  });



  if (loading) return <span className="loader"></span>;
  if (error) return navigate("/admin");

  const totalVotes = data.table.persons.filter(
    (person) => person.vote == true
  ).length;
  const personsLength = data.table.persons.length;
  const votePercent = ((totalVotes / personsLength) * 100).toFixed(2);
  return (
    <div className=" rounded-lg shadow-lg shadow-black p-2 h-full w-full">
      <BackToAdminButton to="/admin/tables"/>
      <div className="bg-zinc-900 mb-2 p-10 flex justify-between max-w-2xl m-auto">
        <div className="flex justify-evenly items-center w-full gap-5">
          <div className="text-center">
            <div
              className="radial-progress text-center font-medium"
              style={{
                "--value": `${votePercent}`,
                "--size": "10rem",
                "--thickness": "2px",
              }}
            >
              <h1 className="text-m">Mesa {data.table.number}</h1>
              <small className="text-slate-100">{data.table.description ? data.table.description : ''}</small>
              <h2 className="text-m">
                {totalVotes} / {personsLength} (
                {isNaN(votePercent) ? "0.00" : votePercent}
                %)
              </h2>
            </div>
          </div>
          <div>
            <FormModal
              tableId={data.table._id}
              tableNumber={data.table.number}
            />
          </div>
        </div>
      </div>
      <AdminPersonList persons={data.table.persons} paramId={params.id} />
    </div>
  );
}
