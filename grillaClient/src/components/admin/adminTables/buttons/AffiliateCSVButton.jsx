import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useMutation } from "@apollo/client";
import { UPDATE_AFFILIATE_PERSONS } from "../../../../graphql/persons";
import { MdGroupAdd } from "react-icons/md";
import Papa from "papaparse";

export const AffiliateCSVButton = ({ datos }) => {
  const MySwal = withReactContent(Swal);

  const [setMultipleAffiliate] = useMutation(UPDATE_AFFILIATE_PERSONS);

  const fileHandler = async () => {
    MySwal.fire({
      title: "El archivo debe ser .csv",
      html: (
        <div>
          <p>El .csv debe contener solo la cabecera dni</p>
          <p>Debajo, los datos, un dni de votante por fila</p>
          <br />
          <p style={{ color: "red" }}>❗Máximo 200 afiliados por archivo</p>
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
                row.dni.contains(".") && (row.dni = row.dni.replace(".", ""));
                const affiliate = {
                  dni: row.dni,
                };
                records.push(affiliate);
              });
              console.log(records);
              setMultipleAffiliate({
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
      className="flex justify-center items-center rounded gap-2 py-3 px-5 bg-pink-500 hover:bg-pink-400 disabled:opacity-50 disabled:hover:bg-pink-500 disabled:hover:py-3 disabled:hover:px-5"
      disabled={!datos}
    >
      <MdGroupAdd className="text-2xl" /> Añadir afiliados por Excel
    </button>
  );
};
