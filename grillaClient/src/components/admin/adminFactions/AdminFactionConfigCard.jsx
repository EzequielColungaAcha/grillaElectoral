import { DeleteFactionConfigButton } from "./buttons/DeleteFactionConfigButton";
import { EditFactionConfigButton } from "./buttons/EditFactionConfigButton";

export function AdminFactionConfigCard({ factionConfig, disabled }) {
  return (
    <div className="flex gap-10 w-full justify-center">
      <div className="flex justify-between bg-zinc-800 w-full rounded-lg shadow-lg shadow-black p-4 mb-2 hover:bg-zinc-700 max-w-lg items-center">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-medium">{factionConfig.name}</h2>
          <div
            className={`w-48 h-6`}
            style={{ backgroundColor: factionConfig.color }}
          ></div>
        </div>
        <div className="flex gap-5 h-fit">
          <EditFactionConfigButton factionConfig={factionConfig} />
          <DeleteFactionConfigButton
            factionConfig={factionConfig}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
