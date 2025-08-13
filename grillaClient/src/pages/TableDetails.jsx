import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSubscription } from "@apollo/client";
import { useOptimizedQuery } from "../hooks/useOptimizedQuery";
import { GET_TABLE } from "../graphql/tables.js";
import {
  TABLE_CHANGED,
  PERSON_ADDED,
  PERSON_DELETED,
} from "../graphql/subscription.js";
import { FormModal } from "../components/form/ReactHookForm.jsx";
import {
  ButtonCloseTable,
  ButtonBackToTables,
} from "../components/tables/Buttons.jsx";
import { StatusCerrada } from "../components/tables/tableDetails/StatusCerrada.jsx";
import { StatusDatosEnviados } from "../components/tables/tableDetails/StatusDatosEnviados.jsx";
import PersonsTable from "../components/persons/PersonsTable.jsx";

export function TableDetails() {
  const params = useParams();

  const { data, loading, error, refetch } = useOptimizedQuery(GET_TABLE, {
    variables: {
      id: params.id,
    },
    skip: !params.id,
    fetchPolicy: 'cache-first',
  });

  const { data: personDeleted } = useSubscription(PERSON_DELETED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: personAdded } = useSubscription(PERSON_ADDED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: tableChanged } = useSubscription(TABLE_CHANGED);

  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  if (loading) return <span className="loader"></span>;
  if (error) return navigate("/");

  const filteredPersons = data.table.persons.filter((person) => {
    return search === "" ? person : person.order == search;
  });

  if (data.table.status == "Abierta") {
    const totalVotes = data.table.persons.filter(
      (person) => person.vote == true
    ).length;
    const personsLength = data.table.persons.length;
    const votePercent = ((totalVotes / personsLength) * 100).toFixed(2);
    return (
      <div className="bg-zinc-200 rounded-lg shadow-lg shadow-black p-2 h-full w-full">
        <div className="flex justify-between items-center">
          <ButtonBackToTables />
          <ButtonCloseTable table={data.table} search={setSearch} />
        </div>
        <div className="bg-zinc-900 mb-2 p-10 flex flex-col justify-between max-w-2xl m-auto">
          <div>
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
                  <h1 className="text-3xl">Mesa {data.table.number}</h1>
                  <small>
                    {data.table.description ? data.table.description : ""}
                  </small>
                  <h2 className="text-lg">
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
          <div className="flex justify-center items-center mb-2">
            <form
              className="search-box"
              autoComplete="off"
              autoSave="off"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="block mb-2 text-sm font-medium text-white text-center">
                Búsqueda por número de orden
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm bg-slate-600 rounded-l-md">
                  #
                </span>
                <input
                  type="text"
                  className="rounded-none rounded-r-lg bg-slate-600 block flex-1 min-w-0 w-full text-sm p-2.5"
                  placeholder="Nro de Orden"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value.toLowerCase());
                  }}
                />
              </div>
            </form>
          </div>
        </div>
        <PersonsTable persons={filteredPersons} />
        <div className="flex justify-center mt-5">
          <ButtonCloseTable table={data.table} search={setSearch} />
        </div>
      </div>
    );
  } else if (
    data.table.status == "Cerrada" &&
    data.table.factions.length == 0
  ) {
    return <StatusCerrada table={data.table} />;
  } else {
    return <StatusDatosEnviados table={data.table} />;
  }
}
