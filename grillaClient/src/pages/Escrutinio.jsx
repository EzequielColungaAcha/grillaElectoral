import { useSubscription } from "@apollo/client";
import { useOptimizedQuery } from "../hooks/useOptimizedQuery";
import { radioQuery } from "../graphql/radio";
import {
  FACTION_VOTES_SEND,
  FACTION_VOTES_UPDATE,
  FACTION_CONFIG_UPDATE,
  FACTION_CONFIG_ADDED,
  FACTION_CONFIG_DELETED,
  FACTION_DELETED,
} from "../graphql/subscription";
import { seats, threshold } from "../config";
import { useState } from "react";

export function Escrutinio() {
  const { data, loading, error, refetch } = useOptimizedQuery(radioQuery, {
    fetchPolicy: 'cache-first',
    pollInterval: 20000, // Poll every 20 seconds for vote updates
  });

  const { data: votesSend } = useSubscription(FACTION_VOTES_SEND, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: configAdded } = useSubscription(FACTION_CONFIG_ADDED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });
  const { data: configUpdate } = useSubscription(FACTION_CONFIG_UPDATE, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });
  const { data: configDeleted } = useSubscription(FACTION_CONFIG_DELETED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: votesUpdate } = useSubscription(FACTION_VOTES_UPDATE, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  const { data: votesDeleted } = useSubscription(FACTION_DELETED, {
    onData: ({ client, onData }) => {
      refetch();
    },
  });

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error...</p>;

  const intendencia = JSON.parse(data.factionChartJS).filter((f) => {
    return f.position === "intendencia";
  });
  const gobernacion = JSON.parse(data.factionChartJS).filter((f) => {
    return f.position === "gobernacion";
  });
  const presidencia = JSON.parse(data.factionChartJS).filter((f) => {
    return f.position === "presidencia";
  });

  const totalIntendenciaVotes = intendencia.reduce(
    (acum, pp) => pp.votes + acum,
    0
  );
  intendencia.forEach(
    (pp) =>
      (pp.percentage = ((pp.votes * 100) / totalIntendenciaVotes).toFixed(2))
  );
  intendencia.sort((a, b) => b.votes - a.votes);

  const totalGobernacionVotes = gobernacion.reduce(
    (acum, pp) => pp.votes + acum,
    0
  );
  gobernacion.forEach(
    (pp) =>
      (pp.percentage = ((pp.votes * 100) / totalGobernacionVotes).toFixed(2))
  );
  gobernacion.sort((a, b) => b.votes - a.votes);
  const totalPresidenciaVotes = presidencia.reduce(
    (acum, pp) => pp.votes + acum,
    0
  );
  presidencia.forEach(
    (pp) =>
      (pp.percentage = ((pp.votes * 100) / totalPresidenciaVotes).toFixed(2))
  );
  presidencia.sort((a, b) => b.votes - a.votes);

  const calculateSeats = () => {
    let positivesIntendencia = intendencia.filter(
      (pp) => pp.percentage >= threshold
    ).length;

    for (let i = 0; i < seats; i++) {
      // indice seleccionado
      let indexPP = 0;
      let highValue = 0;

      // Recorremos el numero de partidos validos
      // Solo mientras el valor maximo sea menor que el numero de votos
      for (
        let j = 0;
        j < positivesIntendencia && highValue < intendencia[j].votes;
        j++
      ) {
        // Si el numero de votos dividido en el numero de escaños (+1)
        // es mayor que el valor maximo, lo selecciono
        if (intendencia[j].votes / (intendencia[j].seats + 1) > highValue) {
          highValue = intendencia[j].votes / (intendencia[j].seats + 1);
          indexPP = j;
        }
      }

      // Aumentamos los asientos del partido politico seleccionado
      intendencia[indexPP].seats++;
    }
  };

  totalIntendenciaVotes > 0 && calculateSeats();

  intendencia.sort(function (a, b) {
    return a.name == "Blancos" ? 1 : 0;
  });
  gobernacion.sort(function (a, b) {
    return a.name == "Blancos" ? 1 : 0;
  });
  presidencia.sort(function (a, b) {
    return a.name == "Blancos" ? 1 : 0;
  });

  return (
    <div className="flex flex-col gap-10 justify-evenly text-center">
      <div className="text-5xl text-center py-4 underline underline-offset-8">
        Escrutinio
      </div>
      <div>
        <h2 className="text-4xl mb-3">Intendencia</h2>
        {intendencia.map((candidato, index) => {
          return (
            <div
              key={index}
              className="flex flex-col md:flex-row gap justify-evenly items-center w-full"
            >
              <div className="md:w-4/12 w-full text-2xl md:text-right pr-2 font-semibold">
                {candidato.name}
              </div>
              <div className="relative md:w-6/12 w-10/12 rounded-full h-6 items-center bg-opacity-80 overflow-hidden bg-slate-600">
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: `${candidato.color}`,
                    width: `${
                      candidato.percentage == "NaN" ? "0" : candidato.percentage
                    }%`,
                  }}
                />
                <span className="absolute right-2 -translate-y-1/2 text-white text-xl font-bold top-1/2">
                  {candidato.votes}
                  {" - "}
                  {candidato.percentage == "NaN" ? "0" : candidato.percentage}%
                </span>
              </div>
              {candidato.name != "Blancos" &&
              data.tables.find((e) => !e.factions.length) == undefined ? (
                <div className="w-2/12 text-xl">
                  Escaños: {candidato.seats} / {seats}
                </div>
              ) : (
                <div className="w-2/12" />
              )}
            </div>
          );
        })}
      </div>
      <div>
        <h2 className="text-4xl mb-3">Gobernación</h2>
        {gobernacion.map((candidato, index) => {
          return (
            <div
              key={index}
              className="flex flex-col md:flex-row gap justify-evenly items-center w-full"
            >
              <div className="md:w-4/12 w-full text-2xl md:text-right pr-2 font-semibold">
                {candidato.name}
              </div>
              <div className="relative md:w-6/12 w-10/12 rounded-full h-6 items-center bg-opacity-80 overflow-hidden bg-slate-600">
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: `${candidato.color}`,
                    width: `${
                      candidato.percentage == "NaN" ? "0" : candidato.percentage
                    }%`,
                  }}
                />
                <span className="absolute right-2 -translate-y-1/2 text-white text-xl font-bold top-1/2">
                  {candidato.votes}
                  {" - "}
                  {candidato.percentage == "NaN" ? "0" : candidato.percentage}%
                </span>
              </div>
              <div className="w-2/12"></div>
            </div>
          );
        })}
      </div>
      <div>
        <h2 className="text-4xl mb-3">Presidencia</h2>
        {presidencia.map((candidato, index) => {
          return (
            <div
              key={index}
              className="flex flex-col md:flex-row gap justify-evenly items-center w-full"
            >
              <div className="md:w-4/12 w-full text-2xl md:text-right pr-2 font-semibold">
                {candidato.name}
              </div>
              <div className="relative md:w-6/12 w-10/12 rounded-full h-6 items-center bg-opacity-80 overflow-hidden bg-slate-600">
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: `${candidato.color}`,
                    width: `${
                      candidato.percentage == "NaN" ? "0" : candidato.percentage
                    }%`,
                  }}
                />
                <span className="absolute right-2 -translate-y-1/2 text-white text-xl font-bold top-1/2">
                  {candidato.votes}
                  {" - "}
                  {candidato.percentage == "NaN" ? "0" : candidato.percentage}%
                </span>
              </div>
              <div className="w-2/12"></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
