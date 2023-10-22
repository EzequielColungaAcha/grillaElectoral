import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useMutation } from "@apollo/client";
import { CREATE_MASSIVE_PERSONS } from "../../../../graphql/persons";
import Papa from "papaparse";
import { useEffect } from "react";

export const UploadMassiveCSVButton = ({ refetch, datos, affiliateList }) => {
  const MySwal = withReactContent(Swal);

  const [addMassivePersons, { data, loading, error }] = useMutation(
    CREATE_MASSIVE_PERSONS
  );

  useEffect(() => {
    if (!data) return;
    refetch();
  }, [data]);

  const fileHandler = async () => {
    MySwal.fire({
      title: "El archivo debe ser .csv",
      html: (
        <div>
          <p>El .csv debe estar ordenado con las siguientes cabeceras:</p>
          <p>mesa, orden, apellido, nombre, dni y dir</p>
          <p>Debajo, los datos, un votante por fila</p>
          <br />
          <p className="text-red-600">
            ❗Recomiendo usar Google Spreadsheets porque Excel no guarda las Ñ.
          </p>
          <p className="text-red-600">
            ❗❗Si hay lista de afiliados, cargarla antes de esta opción
          </p>
        </div>
      ),
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: "#4d7c0f",
      cancelButtonColor: "#464646",
      confirmButtonText: "Siguiente",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: file } = await MySwal.fire({
          title: `Sube el CSV`,
          input: "file",
          inputAttributes: {
            accept: ".csv",
            "aria-label": `Sube el CSV`,
          },
        });

        if (file) {
          const records = [];
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: "UTF-8",
            complete: function (results) {
              results.data.map((row) => {
                const person = {
                  firstName: row.nombre.toUpperCase() || "",
                  lastName: row.apellido.toUpperCase() || "",
                  dni: row.dni,
                  order: parseInt(row.orden),
                  address: row.dir,
                  tableNumber: row.mesa,
                  affiliate: affiliateList.includes(row.dni) ? true : false,
                };
                records.push(person);
              });
              addMassivePersons({
                variables: {
                  data: records,
                },
              });
            },
          });
        }
      }
    });
  };

  if (loading)
    return (
      <button className="bg-indigo-500 py-3 px-5 hover:bg-indigo-400 disabled">
        <svg
          aria-hidden="true"
          role="status"
          className="inline w-4 h-4 mr-3 text-white animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>
        Procesando...
      </button>
    );
  if (error) return `Submission error! ${error.message}`;

  return (
    <button
      onClick={fileHandler}
      className="py-3 bg-indigo-500 px-5 hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 disabled:hover:py-3 disabled:hover:px-5"
      disabled={datos}
    >
      Carga Inicial de Datos
    </button>
  );
};
