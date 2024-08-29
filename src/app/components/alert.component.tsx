import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

export default function AlertComponent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center p-4 mb-4 text-red-800 border-t-4 border-red-300 bg-red-50 dark:text-red-400 dark:bg-gray-800 dark:border-red-800">
      <FontAwesomeIcon icon={faInfoCircle} />
      <div className="ms-3 text-sm font-medium">{children}</div>
    </div>
  );
}
