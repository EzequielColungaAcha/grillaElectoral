import { useState } from "react";
import { useQuery, useSubscription } from "@apollo/client";
import { GET_PERSONS } from "../graphql/persons.js";
import {
  TABLE_CHANGED,
  PERSON_VOTED,
  PERSON_ADDED,
  PERSON_DELETED,
  TABLE_ADDED,
  TABLE_DELETED,
  MULTIPLE_PERSONS_ADDED,
} from "../graphql/subscription.js";
import { MdOutlineHowToVote, MdOutlineDrafts } from "react-icons/md";
import { BsSendCheck } from "react-icons/bs";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Table from "../components/spectatorComps/Table.jsx";

const MySwal = withReactContent(Swal);

export const Base = () => {
  const [search, setSearch] = useState("");
  const [selectedSearch, setSelectedSearch] = useState("all");
  const [voteSearch, setVoteSearch] = useState("all");
  const [affiliateSearch, setAffiliateSearch] = useState("all");

  const { data, loading, error, refetch } = useQuery(GET_PERSONS);

  const { data: voted } = useSubscription(PERSON_VOTED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: tableChanged } = useSubscription(TABLE_CHANGED);

  const { data: personAdded } = useSubscription(PERSON_ADDED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: tableAdded } = useSubscription(TABLE_ADDED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: tableDeleted } = useSubscription(TABLE_DELETED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: personDeleted } = useSubscription(PERSON_DELETED, {
    onData: (data) => {
      console.log(data);
    },
  });

  const { data: multiplePersonsAdded } = useSubscription(
    MULTIPLE_PERSONS_ADDED,
    {
      onData: (data) => {
        let timerInterval;
        MySwal.fire({
          title: "Cargando CSV...",
          html: "<b></b> para finalizar la carga.",
          timer: 10000,
          timerProgressBar: true,
          didOpen: () => {
            MySwal.showLoading();
            const b = MySwal.getHtmlContainer().querySelector("b");
            timerInterval = setInterval(() => {
              b.textContent = MySwal.getTimerLeft();
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === MySwal.DismissReason.timer) {
            refetch();
          }
        });
      },
    }
  );

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error...</p>;

  // !!!!!!!!!!!!!!!!!!!!!!! Filter !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  let filteredPersons = data?.persons?.filter((person) => {
    if (search === "" && voteSearch === "all" && affiliateSearch === "all") {
      return person;
    } else if (
      search === "" &&
      voteSearch === "vote" &&
      affiliateSearch === "all"
    ) {
      return person.vote == true;
    } else if (
      search === "" &&
      voteSearch === "noVote" &&
      affiliateSearch === "all"
    ) {
      return person.vote == false;
    } else if (
      search === "" &&
      voteSearch === "all" &&
      affiliateSearch === "affiliate"
    ) {
      return person.affiliate == true;
    } else if (
      search === "" &&
      voteSearch === "vote" &&
      affiliateSearch === "affiliate"
    ) {
      return person.affiliate == true && person.vote == true;
    } else if (
      search === "" &&
      voteSearch === "noVote" &&
      affiliateSearch === "affiliate"
    ) {
      return person.affiliate == true && person.vote == false;
    } else {
      return (
        person.firstName.toLowerCase().includes(search) ||
        person.lastName.toLowerCase().includes(search) ||
        person.dni.toLowerCase().includes(search)
      );
    }
  });

  selectedSearch != "all" &&
    !search &&
    (filteredPersons = filteredPersons.filter((person) => {
      if (person.tableNumber == selectedSearch) {
        return person;
      }
    }));

  // Filtrar las personas de la mesa
  // !!!!!!!!!!!!!!!!!!!!!!! Filter End!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <label className="text-center flex flex-col">
        Filtro por persona:
        <br />
        <small>(El filtro por persona anula los demás filtros)</small>
        <input
          className="border-slate-500 mt-2 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 focus:bg-slate-700 focus:border-slate-200"
          type="text"
          placeholder="Nombre, Apellido o DNI"
          onChange={(e) => {
            setSearch(e.target.value.toLowerCase());
          }}
        />
      </label>
      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-col justify-center text-center gap-1">
          <label>Filtro por mesas:</label>
          <select
            className="border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 cursor-pointer hover:bg-slate-500 hover:border-slate-200 disabled:pointer-events-none"
            onChange={(e) => {
              setSelectedSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value="all">Todas las mesas</option>
            {data.tables.map((table) => {
              if (table.totalPersons > 0) {
                return (
                  <option key={table.number} value={table.number}>
                    Mesa #{table.number}
                  </option>
                );
              }
            })}
          </select>
        </div>
        <div className="flex flex-col justify-center text-center gap-1">
          <label>Filtro por votación:</label>
          <select
            className="border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 cursor-pointer hover:bg-slate-500 hover:border-slate-200 disabled:pointer-events-none"
            onChange={(e) => {
              setVoteSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value="all">Todos los votantes</option>
            <option value="vote">Ya Votaron</option>
            <option value="noVote">Aún No Votaron</option>
          </select>
        </div>
        <div className="flex flex-col justify-center text-center gap-1">
          <label>Filtro por afiliado:</label>
          <select
            className="border-slate-500 disabled:opacity-20 bg-slate-800 border-2 py-2 px-5 cursor-pointer hover:bg-slate-500 hover:border-slate-200 disabled:pointer-events-none"
            onChange={(e) => {
              setAffiliateSearch(e.target.value);
            }}
            disabled={search}
          >
            <option value="all">Todos los votantes</option>
            <option value="affiliate">Afiliados</option>
          </select>
        </div>
      </div>
      <Table persons={filteredPersons} loading={loading} error={error} />
    </div>
  );
};
