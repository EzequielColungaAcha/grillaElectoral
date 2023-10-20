import { AdminFactionConfigCard } from "./AdminFactionConfigCard.jsx";

export function AdminFactionConfigList({ factionsConfig, disabled }) {
  return (
    <div className="h-full w-full px-5 flex flex-col items-center">
      {factionsConfig.map((factionConfig) => (
        <AdminFactionConfigCard
          key={factionConfig._id}
          factionConfig={factionConfig}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
