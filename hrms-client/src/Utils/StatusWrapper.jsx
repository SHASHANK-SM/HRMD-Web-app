import React from "react";
import ClipLoader from "react-spinners/ClipLoader";

const StatusWrapper = ({ loading, error, children }) => {
  if (loading) {
    return (
      <div className="w-full h-[300px] bg-white flex justify-center items-center rounded-md">
        <ClipLoader color="#E60023" size={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[300px] bg-white flex justify-center items-center rounded-md text-red-600 font-semibold">
        {error}
      </div>
    );
  }

  return <>{children}</>;
};

export default StatusWrapper;
