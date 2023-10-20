import { Clock } from "../components/clock/Clock";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";

export const Home = () => {
  const { user } = useContext(AuthContext);
  const year = new Date().getFullYear();
  const [userTutorial, setUserTutorial] = useState("");

  const videos = [
    { user: "admin", url: "/" },
    { user: "fiscal", url: "https://youtu.be/pk0vQucgIQw" },
    { user: "base", url: "https://youtu.be/_fhmEUihmHU" },
    { user: "prensa", url: "https://youtu.be/5nGGK8fw97g" },
  ];

  useEffect(() => {
    setUserTutorial(videos.find((e) => e.user == user.rol).url);
  }, []);

  return (
    <div className="text-center text-slate-200 h-full pt-16 flex flex-col justify-center items-center">
      <h1 className="uppercase text-4xl mb-10">Grilla electoral {year}</h1>
      <Clock />
      <div className="flex flex-col items-center justify-center mt-10">
        <h4 className="w-fit text-xl text-justify px-1">
          Bienvenido/a <span className="text-lime-400">{user.name}</span>.
        </h4>
        <h4 className="w-fit text-xl text-justify px-1">
          Esta aplicación está diseñada para la fiscalización y control de las
          elecciones electorales argentinas!
        </h4>
        <h5 className="w-fit text-xl text-justify px-1">
          En este{" "}
          <a
            href={userTutorial}
            className="hover:text-pink-400 text-pink-100 underline underline-offset-4"
          >
            enlace
          </a>{" "}
          puedes encontrar un instructivo de cómo utilizarla de acuerdo a tu
          rol.
        </h5>
        <h5 className="w-fit text-xl text-justify px-1">
          Para más información comunicate con el administrador de tu localidad.
        </h5>
      </div>
    </div>
  );
};
