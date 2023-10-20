import { AddFactionConfig } from "../components/admin/adminFactions/AddFactionConfig";
import { AdminFactionConfigList } from "../components/admin/adminFactions/AdminFactionConfigList";
import { useQuery, useSubscription } from "@apollo/client";
import { factionsQuery } from "../graphql/admin";
import {
  FACTION_CONFIG_ADDED,
  FACTION_CONFIG_DELETED,
} from "../graphql/subscription";

export const AdminFactions = () => {
  const { loading, error, data, refetch } = useQuery(factionsQuery);

  const { data: factionConfigAdded } = useSubscription(FACTION_CONFIG_ADDED, {
    onData: (addedData) => {
      refetch();
    },
  });
  console.log(data);
  const { data: factionConfigDeleted } = useSubscription(
    FACTION_CONFIG_DELETED,
    {
      onData: (deletedData) => {
        refetch();
      },
    }
  );

  const intendencia = data?.factionsConfig.filter((f) => {
    return f.position === "intendencia";
  });
  const gobernacion = data?.factionsConfig.filter((f) => {
    return f.position === "gobernacion";
  });
  const presidencia = data?.factionsConfig.filter((f) => {
    return f.position === "presidencia";
  });

  if (loading) return <span className="loader" />;
  if (error) return <p>Error</p>;

  return (
    <div>
      <div className="flex items-center justify-center mb-5">
        <AddFactionConfig disabled={data?.anyFaction == 0 ? false : true} />
      </div>
      <div className="flex justify-evenly">
        <div className="w-1/3 text-center">
          <h2 className="mb-2 text-2xl">Intendencia</h2>
          <AdminFactionConfigList
            factionsConfig={intendencia.sort((a, b) =>
              a.color > b.color ? 1 : -1
            )}
            disabled={data?.anyFaction == 0 ? false : true}
          />
        </div>
        <div className="w-1/3 text-center">
          <h2 className="mb-2 text-2xl">Gobernación</h2>
          <AdminFactionConfigList
            factionsConfig={gobernacion.sort((a, b) =>
              a.color > b.color ? 1 : -1
            )}
            disabled={data?.anyFaction == 0 ? false : true}
          />
        </div>
        <div className="w-1/3 text-center">
          <h2 className="mb-2 text-2xl">Presidencia</h2>
          <AdminFactionConfigList
            factionsConfig={presidencia.sort((a, b) =>
              a.color > b.color ? 1 : -1
            )}
            disabled={data?.anyFaction == 0 ? false : true}
          />
        </div>
      </div>
    </div>
  );
};
