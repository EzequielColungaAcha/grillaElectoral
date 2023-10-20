import { Link } from "react-router-dom";
import { TiArrowBackOutline } from "react-icons/ti";

export const BackToAdminButton = ({to}) => {
  return (
    <Link to={to}>
      <button className="bg-sky-900 flex items-center text-white px-3 py-2 mb-1">
        <TiArrowBackOutline /> Volver
      </button>
    </Link>
  );
};
