import { useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronUp, ChevronDown, Search } from "lucide-react";
import LoaderCircle from "../LoaderCircle/LoaderCircle";
import "./Table.css";
import "../../../styles/theme.css";

const Table = ({
  header,
  row,
  min,
  hidePagination,
  paginationOption,
  onPaginationChange,
  onSort,
  defaultSort = {
    key: "createdAt",
    direction: "asc",
  },
  loader,
  searchable = false,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState(defaultSort);

  const handlePageChange = (selectedObject) => {
    onPaginationChange && onPaginationChange(selectedObject.selected);
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    onSort && onSort(key, direction);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch && onSearch(value);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronUp className="sort-icon inactive" size={16} />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="sort-icon active" size={16} />
    ) : (
      <ChevronDown className="sort-icon active" size={16} />
    );
  };

  return (
    <div className="table-container">
      {searchable && (
        <div className="table-search">
          <div className="search-input-wrapper">
            <div className="search-icon">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <div style={{ minWidth: min || "1000px" }}>
          <div className="table-body">
            <div
              className="header-row"
              style={{ minWidth: min || "1000px", width: "100%" }}
            >
              {header?.map((elm, index) => {
                const { title, className, isSort, key } = elm;
                return (
                  <div
                    className={`header-cell ${isSort ? "sortable" : ""} ${
                      className || ""
                    }`}
                    key={index}
                    onClick={isSort ? () => handleSort(key) : undefined}
                    // style={{ width: (elm?.widthPercent || 100) + "%" }}
                  >
                    <span>{title}</span>
                    {isSort && getSortIcon(key)}
                  </div>
                );
              })}
            </div>

            <div
              className="body-container"
              style={{ minWidth: min || "1000px", width: "100%" }}
            >
              {!loader ? (
                row?.length > 0 ? (
                  row.map((elm, index) => (
                    <div className="body-row" key={index}>
                      {elm?.data?.map((cElem, cIndex) => (
                        <div
                          className={`body-cell text-base ${
                            cElem?.className || ""
                          } ${header[cIndex]?.className || ""}`}
                          key={cIndex}
                        >
                          {cElem?.value}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="no-data">
                    <p>No data available</p>
                  </div>
                )
              ) : (
                <div className="loader-container">
                  <LoaderCircle size={50} />
                </div>
              )}
            </div>
          </div>

          {!hidePagination && paginationOption && (
            <div className="pagination-container">
              {paginationOption?.count === 0 ? (
                <div className="pagination-info">
                  {loader ? "Please wait..." : "No records"}
                </div>
              ) : (
                <div className="pagination-info">
                  {`Showing ${
                    paginationOption?.currentPage * paginationOption?.pageSize +
                    1
                  }-${
                    paginationOption?.count <
                    (paginationOption?.currentPage + 1) *
                      paginationOption?.pageSize
                      ? paginationOption?.count
                      : (paginationOption?.currentPage + 1) *
                        paginationOption?.pageSize
                  } from ${paginationOption?.count}`}
                </div>
              )}

              <ReactPaginate
                pageCount={
                  Math.ceil(
                    paginationOption?.count / paginationOption?.pageSize
                  ) || 1
                }
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                previousLabel={<div className="prev-btn pointer">Prev</div>}
                nextLabel={<div className="next-btn pointer">Next</div>}
                breakLabel="..."
                activeClassName="selected"
                onPageChange={handlePageChange}
                forcePage={paginationOption?.currentPage || 0}
                containerClassName="pagination"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakClassName="page-item"
                breakLinkClassName="page-link"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Table;
