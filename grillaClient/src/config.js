// export const MONGODB_URI = import.meta.env.VITE_IPCONFIG

// * En esta configuración se define quienes pueden acceder a las diferentes secciones.
// * Los roles disponibles para los usuarios son 'fiscal', 'prensa', 'base' y 'admin'.
export const PRIVACY = {
  mesas: ["admin", "fiscal"],
  prensa: ["admin", "prensa"],
  base: ["admin", "base"],
  admin: ["admin"],
  all: ["admin", "fiscal", "base", "prensa"],
  everyone: ["admin", "fiscal", "prensa", "base"],
};

// * En esta configuración se define cuántos escaños, es decir, bancas de concejales que se renuevan en el distrito
export const seats = import.meta.env.VITE_SEATS;

// * En esta configuración se define el % de threshold para saber qué partidos pasan
export const threshold = import.meta.env.VITE_THRESHOLD;
