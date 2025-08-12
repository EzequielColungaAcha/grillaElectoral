import React from "react";

import { AiOutlineCheckCircle, AiOutlineInfoCircle, AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import { MdOutlineSmsFailed } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

export default function Alert({ type, icon, children }) {
  const classes = {
    success:
      "p-4 shadow inline-block bg-green-300 text-green-900 rounded-md m-2",
    warning:
      "p-4 shadow inline-block bg-yellow-300 text-yellow-900 rounded-md m-2",
    danger: "p-4 shadow inline-block bg-red-300 text-red-900 rounded-md m-2",
    info: "p-4 shadow inline-block bg-slate-600 rounded-md m-2",
  };

  return (
    <div
      className={
        classes[type] + " flex gap-2 items-center justify-center mx-auto"
      }
    >
      <span className="text-2xl">
        {icon === "success" ? (
          <AiOutlineCheckCircle />
        ) : icon === "warning" ? (
          <MdOutlineSmsFailed />
        ) : icon === "error" ? (
          <RxCross2 />
        ) : icon === "info" ? (
          <AiOutlineInfoCircle />
        ) : icon === "add" ? (
          <AiOutlinePlusCircle />
        ) : icon === "delete" ? (
          <AiOutlineDelete />
        ) : (
          ""
        )}
      </span>
      {children}
    </div>
  );
}
