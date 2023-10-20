import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useMutation } from "@apollo/client";
import { CREATE_MULTIPLE_PERSONS } from "../../../../graphql/persons";
import Papa from "papaparse";

export const UploadCSVButton = ({ table }) => {
  const MySwal = withReactContent(Swal);

  const [addMultiplePersons] = useMutation(CREATE_MULTIPLE_PERSONS);

  const fileHandler = async () => {
    MySwal.fire({
      title: "El archivo debe estar en formato .csv",
      html: (
        <div>
          <p>El .csv debe estar ordenado como se muestra en la imágen ⬆️</p>
          <p>Con las cabeceras: mesa, orden, apellido, nombre, dni y dir</p>
          <p>Debajo, los datos, un votante por fila</p>
          <p>
            ❗Recomiendo usar Google Spreadsheets porque Excel no guarda las Ñ.
          </p>
        </div>
      ),
      imageUrl: "/csvFormat.png",
      imageWidth: 720,
      imageHeight: 200,
      imageAlt: "csv required format",
      showCancelButton: true,
      reverseButtons: true,
      confirmButtonColor: "#4d7c0f",
      cancelButtonColor: "#464646",
      confirmButtonText: "Siguiente",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { value: file } = await MySwal.fire({
          title: `Sube el CSV para Mesa ${table.number}`,
          input: "file",
          inputAttributes: {
            accept: ".csv",
            "aria-label": `Sube el CSV para Mesa ${table.number}`,
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
                  firstName: row.nombre.toUpperCase(),
                  lastName: row.apellido.toUpperCase(),
                  dni: row.dni,
                  vote: false,
                  order: parseInt(row.orden),
                  address: row.dir,
                  table: table._id,
                  tableNumber: row.mesa,
                  message: "",
                  affiliate: false,
                };
                records.push(person);
              });
              addMultiplePersons({
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

  return (
    <button
      onClick={fileHandler}
      className="bg-gray-500 py-2 px-5 hover:bg-gray-400"
    >
      Añadir votantes
    </button>
  );
};
