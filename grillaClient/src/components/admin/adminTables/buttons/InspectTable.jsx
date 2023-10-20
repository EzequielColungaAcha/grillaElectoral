import { useNavigate } from "react-router-dom";

export const InspectTable = ({ table }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(`/admin/tables/${table._id}`)}
      className="bg-gray-500 py-2 px-5 hover:bg-gray-400"
    >
      Inspeccionar
    </button>
  );
};
