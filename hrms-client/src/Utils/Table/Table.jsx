import React from "react";
import TableHeader from "./TableHeader";
import ReactPaginate from "react-paginate";
import TableItem from "./TableItem";

const Table = ({
  columns,
  data,
  handlePageClick,
  totalPages = 2,
  currentPage,
  isDisplayPagination = true,
}) => {
  return (
    <div className="w-full  shadow-medium rounded-md bg-white">
      <TableHeader columns={columns} />
      {data?.map((row, index) => (
        <TableItem key={index} row={row} columns={columns} />
      ))}
      {isDisplayPagination && (
        <ReactPaginate
          forcePage={currentPage}
          previousLabel={"←"}
          nextLabel={"→"}
          pageCount={totalPages}
          onPageChange={handlePageClick}
          containerClassName={"flex justify-center gap-2 p-4"}
          pageClassName={"px-3 py-1 border rounded"}
          activeClassName={"bg-blue-500 text-white"}
          previousClassName={"px-3 py-1 border rounded"}
          nextClassName={"px-3 py-1 border rounded"}
          disabledClassName={"opacity-50"}
        />
      )}
    </div>
  );
};

export default Table;
