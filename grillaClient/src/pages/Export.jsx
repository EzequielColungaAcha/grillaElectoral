import React from "react";
import ReactExport from "react-excel-exportz";
import { useQuery } from "@apollo/client";
import { exportQuery } from "../graphql/admin";

export const Export = () => {
  const { loading, error, data, refetch } = useQuery(exportQuery);

  const ExcelFile = ReactExport.ExcelFile;
  const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
  const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const persons = [];
  data?.tables?.forEach((table) => {
    table.persons.forEach((person) => {
      const newPerson = {
        order: person.order,
        firstName: person.firstName,
        lastName: person.lastName,
        dni: person.dni,
        vote: person.vote,
        table: person.tableNumber,
        affiliate: person.affiliate,
        message: person.message,
      };
      persons.push(newPerson);
    });
  });

  const result = { persons };
  const singleSheetFile = (
    <ExcelFile
      filename={`Datos Grilla Electoral (unificado) ${day}-${month}-${year}`}
      element={
        <button className="p-3 mt-5 bg-slate-600 rounded flex items-center gap-2 hover:bg-slate-500">
          Descargar Archivo Unificado
        </button>
      }
    >
      <ExcelSheet data={result.persons} name={`Datos ${day}-${month}-${year}`}>
        <ExcelColumn label="Mesa" value="table" />
        <ExcelColumn label="Orden" value="order" />
        <ExcelColumn label="Nombre" value="firstName" />
        <ExcelColumn label="Apellido" value="lastName" />
        <ExcelColumn label="DNI" value="dni" />
        <ExcelColumn
          label="Voto"
          value={(col) => (col.vote ? "Votó" : "No Votó")}
        />
        <ExcelColumn
          label="Afiliado"
          value={(col) => (col.affiliate ? "Si" : "No")}
        />
        <ExcelColumn label="Mensaje" value="message" />
      </ExcelSheet>
    </ExcelFile>
  );

  const multipleSheetFile = (
    <ExcelFile
      filename={`Datos Grilla Electoral (hojas) ${day}-${month}-${year}`}
      element={
        <button className="p-3 mt-5 bg-slate-600 rounded flex items-center gap-2 hover:bg-slate-500">
          Descargar Archivo
        </button>
      }
    >
      {data?.tables?.map((table) => (
        <ExcelSheet
          key={table._id}
          data={table.persons}
          name={`Mesa ${table.number}`}
        >
          <ExcelColumn label="Orden" value="order" />
          <ExcelColumn label="Nombre" value="firstName" />
          <ExcelColumn label="Apellido" value="lastName" />
          <ExcelColumn label="DNI" value="dni" />
          <ExcelColumn
            label="Voto"
            value={(col) => (col.vote ? "Votó" : "No Votó")}
          />
          <ExcelColumn
            label="Afiliado"
            value={(col) => (col.affiliate ? "Si" : "No")}
          />
          <ExcelColumn label="Mensaje" value="message" />
        </ExcelSheet>
      ))}
    </ExcelFile>
  );

  const downloadJsonData = () => {
    // create file in browser
    const fileName = `Elecciones ${year} - Database`;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    // create "a" HTLM element with href to file
    const link = document.createElement("a");
    link.href = href;
    link.download = fileName + ".json";
    document.body.appendChild(link);
    link.click();

    // clean up "a" element & remove ObjectURL
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  if (loading) return <span className="loader"></span>;
  if (error) return <p>Error</p>;

  return (
    <div className="flex flex-col gap-5 justify-center items-center h-screen">
      <div className="flex justify-center items-center w-full h-1/2">
        <div className="w-1/2 flex flex-col items-center text-center justify-center">
          <h2>Archivo con las mesas separadas por hojas.</h2>
          <div className="flex items-center justify-center">
            {multipleSheetFile}
          </div>
        </div>
        <div className="w-1/2 flex flex-col items-center text-center justify-center">
          <h2>Archivo con todos los datos en una única hoja.</h2>
          <div className="flex items-center justify-center">
            {singleSheetFile}
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-start items-center w-full h-1/2">
        <h2>Archivo con todos los datos para ser utilizado en app offline.</h2>
        <button
          className="p-3 mt-5 bg-slate-600 rounded flex items-center gap-2 hover:bg-slate-500"
          onClick={downloadJsonData}
        >
          Descargar Base de Datos
        </button>
      </div>
    </div>
  );
};
