import { useMutation } from "@apollo/client";
import { UPDATE_AFFILIATE_PERSONS } from "../../../../graphql/persons";
import { MdGroupAdd } from "react-icons/md";
import Papa from "papaparse";
import { useState } from "react";
import { FileUploadModal } from "../../../modals/FileUploadModal";
import { InfoModal } from "../../../modals/InfoModal";
import { toast } from 'keep-react';

export const AffiliateCSVButton = ({ datos, setAffiliateList }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  
  const [setMultipleAffiliate] = useMutation(UPDATE_AFFILIATE_PERSONS);

  const handleFileSelect = async (file) => {
    try {
      const records = [];
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        encoding: "UTF-8",
        complete: function (results) {
          results.data.map((row) => {
            row.dni.includes(".") &&
              (row.dni = row.dni.replaceAll(".", ""));
            records.push(row.dni);
          });
          setAffiliateList(records);
          toast.success('Lista de afiliados cargada correctamente');
        },
      });
    } catch (error) {
      toast.error('Error al procesar el archivo');
    }
    setShowUpload(false);
  };

  const handleShowInfo = () => {
    setShowInfo(true);
  };

  return (
    <>
      <button
        onClick={handleShowInfo}
        className="flex justify-center items-center rounded gap-2 py-3 px-5 bg-pink-500 hover:bg-pink-400 disabled:opacity-50 disabled:hover:bg-pink-500 disabled:hover:py-3 disabled:hover:px-5"
        disabled={datos}
      >
        <MdGroupAdd className="text-2xl" /> Añadir afiliados por Excel
      </button>
      
      <InfoModal
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
        title="Cargar Lista de Afiliados"
      >
        <div className="space-y-3 text-sm">
          <p>El archivo CSV debe contener solo la cabecera <strong>dni</strong></p>
          <p>Debajo de la cabecera, un DNI de votante por fila.</p>
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-600 font-medium">⚠️ Importante:</p>
            <p className="text-red-600">
              Debe cargarse antes de la 'Carga Inicial de Datos'
            </p>
          </div>
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setShowInfo(false);
                setShowUpload(true);
              }}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Continuar
            </button>
          </div>
        </div>
      </InfoModal>
      
      <FileUploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onFileSelect={handleFileSelect}
        title="Subir CSV - Lista de Afiliados"
        description="Selecciona el archivo CSV con los DNI de los afiliados."
        acceptedTypes=".csv"
      />
    </>
  );
};
