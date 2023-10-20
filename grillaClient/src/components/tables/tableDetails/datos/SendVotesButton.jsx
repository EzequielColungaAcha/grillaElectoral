import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { GET_FACTION_CONFIG, SEND_VOTES } from "../../../../graphql/factions";
import { UPDATE_STATUS } from "../../../../graphql/tables";
import { useQuery, useMutation, useSubscription } from "@apollo/client";
import { BsSend } from "react-icons/bs";
import { FACTION_VOTES_SEND } from "../../../../graphql/subscription";
import { AuthContext } from "../../../../context/authContext";
import { useContext } from "react";

export const SendVotesButton = ({ table }) => {
  const { user } = useContext(AuthContext);

  const { loading, error, data, refetch } = useQuery(GET_FACTION_CONFIG);

  const [sendVotes] = useMutation(SEND_VOTES);
  const [updateTable] = useMutation(UPDATE_STATUS);

  const MySwal = withReactContent(Swal);

  const { data: factionVotesSend } = useSubscription(FACTION_VOTES_SEND, {
    onData: ({ client, onData }) => {
      let timerInterval;
      MySwal.fire({
        title: "Enviando Datos de Votos...",
        html: "<b></b> para finalizar el envío.",
        timer: 2000,
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
  });

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error...</p>;

  const showModal = () => {
    const intendencia = data.factionsConfig.filter((f) => {
      return f.position === "intendencia";
    });
    const gobernacion = data.factionsConfig.filter((f) => {
      return f.position === "gobernacion";
    });
    const presidencia = data.factionsConfig.filter((f) => {
      return f.position === "presidencia";
    });
    MySwal.fire({
      title: `Envío de Votos Contados`,
      html: (
        <form className="flex flex-col gap-3 overflow-hidden">
          <h2>Intendencia</h2>
          {intendencia
            .sort((a, b) => (a.name > b.name || a.name == "Blancos" ? 1 : -1))
            .map((faction) => (
              <label key={faction._id} className="flex justify-between">
                <div className="w-2/3 flex flex-wrap items-center">
                  <span
                    className="text-3xl m-0"
                    style={{ color: `${faction.color}` }}
                  >
                    •
                  </span>
                  {faction.name}:
                </div>
                <input
                  id={`factionVotes`}
                  type="number"
                  name={faction.name}
                  data-id={faction._id}
                  data-name={faction.name}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/3"
                />
              </label>
            ))}
          <h2>Gobernación</h2>
          {gobernacion
            .sort((a, b) => (a.name > b.name || a.name == "Blancos" ? 1 : -1))
            .map((faction) => (
              <label key={faction._id} className="flex justify-between">
                <div className="w-2/3 flex flex-wrap items-center">
                  <span
                    className="text-3xl m-0"
                    style={{ color: `${faction.color}` }}
                  >
                    •
                  </span>
                  {faction.name}:
                </div>
                <input
                  id={`factionVotes`}
                  type="number"
                  name={faction.name}
                  data-id={faction._id}
                  data-name={faction.name}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/3"
                />
              </label>
            ))}
          <h2>Presidencia</h2>
          {presidencia
            .sort((a, b) => (a.name > b.name || a.name == "Blancos" ? 1 : -1))
            .map((faction) => (
              <label key={faction._id} className="flex justify-between">
                <div className="w-2/3 flex flex-wrap items-center">
                  <span
                    className="text-3xl m-0"
                    style={{ color: `${faction.color}` }}
                  >
                    •
                  </span>
                  {faction.name}:
                </div>
                <input
                  id={`factionVotes`}
                  type="number"
                  name={faction.name}
                  data-id={faction._id}
                  data-name={faction.name}
                  className="border-b-2 border-slate-600 ml-2 text-center p-1 text-slate-50 w-1/3"
                />
              </label>
            ))}
        </form>
      ),
      showCancelButton: true,
      showConfirmButton: true,
      confirmButtonText: "Enviar Datos",
      cancelButtonText: "Cerrar",
      cancelButtonColor: "#464646",
      showLoaderOnConfirm: true,
      reverseButtons: true,
      preConfirm: () => {
        const records = [];

        [...document.querySelectorAll("#factionVotes")].map((input) => {
          const faction = {
            config: input.dataset.id,
            votes: input.valueAsNumber || 0,
            table: table._id,
            name: input.dataset.name,
          };
          records.push(faction);
        });

        sendVotes({
          variables: {
            data: records,
            userName: user.name,
            userRol: user.rol,
            tableNumber: table.number,
          },
        })
          .then((response) => {
            if (!response.data.setMultipleFactionRecord) {
              throw new Error(response.statusText);
            } else {
              updateTable({
                variables: {
                  id: table._id,
                  number: table.number,
                  status: "DatosEnviados",
                  userName: user.name,
                  userRol: user.rol,
                },
              });
            }
            return;
          })
          .catch((error) => {
            Swal.showValidationMessage(`Error`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  return (
    <>
      {data.factionsConfig.length < 1 ? (
        <>
          <button className="p-3 bg-slate-600 rounded flex items-center gap-2 text-xl pointer-events-none">
            No hay Partidos cargados
          </button>
        </>
      ) : (
        <>
          <button
            className="p-3 bg-slate-600 hover:bg-slate-500 rounded flex items-center gap-2 text-xl"
            onClick={showModal}
          >
            <BsSend className="text-2xl" /> Enviar Datos de Votos
          </button>
        </>
      )}
    </>
  );
};
