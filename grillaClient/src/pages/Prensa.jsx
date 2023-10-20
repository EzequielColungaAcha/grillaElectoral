import { Escrutinio } from "./Escrutinio";
import { Estado } from "./Estado";

export function Prensa() {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="md:w-1/2">
        <Estado />
      </div>
      <div className="md:w-1/2 md:sticky md:top-0 md:h-fit">
        <Escrutinio />
      </div>
    </div>
  );
}
