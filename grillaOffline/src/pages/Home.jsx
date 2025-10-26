import { Clock } from "../components/clock/Clock";
import { useContext, useState, useEffect } from "react";
import { useAuth } from "../context/simpleAuthContext";

export const Home = () => {
  const { user } = useAuth();
  const year = new Date().getFullYear();
  const [userTutorial, setUserTutorial] = useState("");

  const videos = [
    { user: "admin", url: "/" },
    { user: "fiscal", url: "https://youtu.be/pk0vQucgIQw" },
    { user: "base", url: "https://youtu.be/_fhmEUihmHU" },
    { user: "prensa", url: "https://youtu.be/5nGGK8fw97g" },
  ];

  useEffect(() => {
    setUserTutorial(videos.find((e) => e.user == user?.rol)?.url || "/");
  }, []);

  return (
    <div className="text-center text-slate-200 h-full pt-16 flex flex-col justify-center items-center">
      <h1 className="uppercase text-4xl mb-10">Grilla electoral {year}</h1>
      <Clock />
      <div className="flex flex-col items-center justify-center mt-10">
        <h4 className="w-fit text-xl text-justify px-1">
          Bienvenido/a <span className="text-lime-400">Administrador</span>.
        </h4>
        <h4 className="w-fit text-xl text-center px-1">
          Aplicación para visualizar una base de datos estática exportada por la versión online.
        </h4>
      </div>
    </div>
  );
};
