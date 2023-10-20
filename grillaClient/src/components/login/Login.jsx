import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { LOGIN_MUTATION } from "../../graphql/users"; // Reemplaza con la ruta correcta de tu archivo de mutaciones
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loginUser, { loading, error }] = useMutation(LOGIN_MUTATION, {
    update(proxy, { data: { loginUser: userData } }) {
      login(userData);
      MySwal.fire({
        icon: "success",
        title: "Sesión iniciada correctamente.",
        showConfirmButton: false,
        timer: 1000,
      }).then(() => {
        navigate("/");
      });
    },
    onError({ graphQLErrors }) {},
    variables: { loginInput: { username, password } },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Llamar a la mutación de login con los datos del formulario
    loginUser();
  };

  return (
    <div className="h-full w-full py-3 flex flex-col justify-center sm:py-3">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-slate-600 shadow-md sm:rounded-3xl sm:p-10 border-2 border-slate-400 shadow-slate-400">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-slate-100 mb-5">
                Iniciar Sesión
              </h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-3 px-5 text-base leading-6 space-y-4 text-gray-50 sm:text-lg sm:leading-7">
                <div className="relative">
                  <input
                    autoComplete="off"
                    id="username"
                    name="username"
                    type="text"
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-slate-200 text-gray-100 focus:outline-none focus:border-emerald-700 bg-slate-600"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <label
                    htmlFor="username"
                    className="absolute left-0 -top-3.5 text-slate-100 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-slate-100 peer-focus:text-sm pl-1"
                  >
                    Usuario:
                  </label>
                </div>
                <div className="relative">
                  <input
                    autoComplete="off"
                    id="password"
                    name="password"
                    type="password"
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-slate-200 text-gray-100 focus:outline-none focus:border-emerald-700 bg-slate-600"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-3.5 text-slate-100 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-slate-100 peer-focus:text-sm pl-1"
                  >
                    Contraseña:
                  </label>
                </div>
                {error && (
                  <p className="text-rose-800 bg-zinc-900 px-2 py-1">
                    Error: {error.message}
                  </p>
                )}
                <div className="relative flex items-center justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-800 hover:bg-slate-700  text-white rounded-md px-2 py-1"
                  >
                    {loading ? "Cargando..." : "Ingresar"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
