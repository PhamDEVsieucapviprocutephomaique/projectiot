import React, { useState, useEffect, useRef, useCallback } from "react";
import "../components/Datasensor.scss";

const Datasensor = () => {
  const [sensorData, setSensorData] = useState([]);
  const [sortAttribute, setSortAttribute] = useState("id");
  const [sortType, setSortType] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("id");
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [pageSizeInput, setPageSizeInput] = useState("10");
  const [totalPages, setTotalPages] = useState(1);

  // Refs để tránh re-render không cần thiết
  const searchTimeoutRef = useRef(null);

  // Fetch total pages từ API
  const fetchTotalPages = useCallback(
    async (pageSize = recordsPerPage) => {
      try {
        const res = await fetch(
          "http://localhost:8000/api/datasensor/countpage/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              page_size: pageSize,
            }),
          }
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setTotalPages(data.total_pages);
      } catch (err) {
        console.error("Error fetching total pages:", err);
      }
    },
    [recordsPerPage]
  );

  // Fetch data với sorting và pagination
  const fetchData = useCallback(
    async (
      attribute = sortAttribute,
      type = sortType,
      page = currentPage,
      pageSize = recordsPerPage
    ) => {
      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("API Request parameters:", {
          attribute: attribute,
          type: type,
          page: page,
          page_size: pageSize,
        });
        const res = await fetch("http://localhost:8000/api/datasensor/sort/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attribute: attribute,
            type: type,
            page: page,
            page_size: pageSize,
          }),
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const sortedData = await res.json();
        console.log("📥 DATA RECEIVED for page", page, ":", sortedData);
        console.log("📊 Data length:", sortedData.length);

        setSensorData(sortedData);
        setFilteredData(sortedData);

        // Fetch total pages sau khi có data
        await fetchTotalPages(pageSize);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
      }
    },
    [sortAttribute, sortType, currentPage, recordsPerPage, fetchTotalPages]
  );

  // Fetch search data từ API search
  const fetchSearchData = useCallback(
    async (
      searchValue,
      type,
      page = currentPage,
      pageSize = recordsPerPage
    ) => {
      if (!searchValue.trim()) {
        fetchData();
        return;
      }

      try {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        console.log("API Request parameters:", {
          search: searchValue,
          type: type,
          page: page,
          page_size: pageSize,
        });
        const res = await fetch(
          "http://localhost:8000/api/datasensor/search/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              search: searchValue,
              type: type,
              page: page,
              page_size: pageSize,
            }),
          }
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const searchResults = await res.json();
        setSensorData(searchResults);
        setFilteredData(searchResults);

        // Fetch total pages sau khi có data
        await fetchTotalPages(pageSize);
      } catch (err) {
        console.error("Error searching data:", err);
      } finally {
        // await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsLoading(false);
      }
    },
    [fetchData, currentPage, recordsPerPage, fetchTotalPages]
  );

  // Debounce search
  const handleSearch = useCallback(
    (value, type) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (value.trim() === "") {
          fetchData(sortAttribute, sortType, 1, recordsPerPage);
        } else {
          fetchSearchData(value, type, 1, recordsPerPage);
        }
        setCurrentPage(1);
      }, 500);
    },
    [fetchData, fetchSearchData, sortAttribute, sortType, recordsPerPage]
  );

  // Xử lý search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value, searchType);
  };

  // Xử lý search type change
  const handleSearchTypeChange = (e) => {
    const type = e.target.value;
    setSearchType(type);
    if (searchTerm.trim()) {
      handleSearch(searchTerm, type);
    }
  };

  useEffect(() => {
    // CHỈ FETCH DATA KHI COMPONENT MOUNT
    fetchData();
  }, []); // Empty dependency array - chỉ chạy 1 lần

  // Handle sort change
  const handleSortChange = (attribute, type) => {
    setSortAttribute(attribute);
    setSortType(type);
    setCurrentPage(1);
    fetchData(attribute, type, 1, recordsPerPage);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchType("id");
    setCurrentPage(1);
    fetchData(sortAttribute, sortType, 1, recordsPerPage);
  };

  // Sử dụng trực tiếp filteredData (đã được API phân trang)
  const currentRecords = filteredData;

  // Change page
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchData(sortAttribute, sortType, pageNumber, recordsPerPage);
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) endPage = 4;
      else if (currentPage >= totalPages - 2) startPage = totalPages - 3;

      if (startPage > 2) pageNumbers.push("...");
      for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
      if (endPage < totalPages - 1) pageNumbers.push("...");
      if (totalPages > 1) pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  // Handle page size input change
  const handlePageSizeInputChange = (e) => {
    setPageSizeInput(e.target.value);
  };

  const handlePageSizeBlur = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 10) {
      setRecordsPerPage(value);
      setPageSizeInput(value.toString());
      setCurrentPage(1);
      fetchData(sortAttribute, sortType, 1, value);
    } else {
      setPageSizeInput(recordsPerPage.toString());
    }
  };

  const handlePageSizeKeyPress = (e) => {
    if (e.key === "Enter") {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 10) {
        setRecordsPerPage(value);
        setPageSizeInput(value.toString());
        setCurrentPage(1);
        fetchData(sortAttribute, sortType, 1, value);
        e.target.blur();
      }
    }
  };

  const incrementPageSize = () => {
    const newSize = recordsPerPage + 1;
    setRecordsPerPage(newSize);
    setPageSizeInput(newSize.toString());
    setCurrentPage(1);
    fetchData(sortAttribute, sortType, 1, newSize);
  };

  const decrementPageSize = () => {
    const newSize = Math.max(10, recordsPerPage - 1);
    setRecordsPerPage(newSize);
    setPageSizeInput(newSize.toString());
    setCurrentPage(1);
    fetchData(sortAttribute, sortType, 1, newSize);
  };

  // Copy time to clipboard
  const copyTime = (time) => {
    navigator.clipboard.writeText(time).then(() => {
      console.log("Time copied:", time);
    });
  };

  return (
    <div className="sensor-data-container">
      <div className="controls-container">
        <div className="sort-controls">
          <label>Sort by: </label>
          <select
            className="sort-select"
            value={sortAttribute}
            onChange={(e) => handleSortChange(e.target.value, sortType)}
            disabled={isLoading}
          >
            <option value="id">ID</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="light">Light</option>
            <option value="time">Time</option>
          </select>

          <select
            className="sort-order-select"
            value={sortType}
            onChange={(e) => handleSortChange(sortAttribute, e.target.value)}
            disabled={isLoading}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          {isLoading && (
            <span style={{ marginLeft: "10px", color: "#666" }}>
              Loading...
            </span>
          )}
        </div>

        <div className="search-container">
          <select
            className="search-type-select"
            value={searchType}
            onChange={handleSearchTypeChange}
            disabled={isLoading}
          >
            <option value="id">ID</option>
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="light">Light</option>
            <option value="time">Time</option>
          </select>

          <input
            type="text"
            placeholder={`Search by ${searchType}...`}
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
            disabled={isLoading}
          />
          <button className="search-button" disabled={isLoading}>
            Search
          </button>
          <button
            className="clear-search-button"
            onClick={clearSearch}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="sensor-table">
          <thead>
            <tr>
              <th>
                ID {sortAttribute === "id" && (sortType === "asc" ? "↑" : "↓")}
              </th>
              <th>
                Temperature (°C){" "}
                {sortAttribute === "temperature" &&
                  (sortType === "asc" ? "↑" : "↓")}
              </th>
              <th>
                Humidity (%){" "}
                {sortAttribute === "humidity" &&
                  (sortType === "asc" ? "↑" : "↓")}
              </th>
              <th>
                Light (mits){" "}
                {sortAttribute === "light" && (sortType === "asc" ? "↑" : "↓")}
              </th>
              <th>
                Time{" "}
                {sortAttribute === "time" && (sortType === "asc" ? "↑" : "↓")}
              </th>
              <th>Copy</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item, index) => (
              <tr key={`${item.id || index}-${item.time}`}>
                <td>
                  {item.id || index + 1 + (currentPage - 1) * recordsPerPage}
                </td>
                <td>{item.temperature}</td>
                <td>{item.humidity}</td>
                <td>{item.light}</td>
                <td>{item.time}</td>
                <td>
                  <button
                    className="copy-time-btn"
                    onClick={() => copyTime(item.time)}
                    disabled={isLoading}
                  >
                    Copy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Showing{" "}
          {filteredData.length === 0
            ? 0
            : (currentPage - 1) * recordsPerPage + 1}{" "}
          to{" "}
          {Math.min(
            currentPage * recordsPerPage,
            (currentPage - 1) * recordsPerPage + filteredData.length
          )}{" "}
          of {totalPages * recordsPerPage} entries
          {searchTerm && (
            <span className="search-info">
              {" "}
              | Searching: "{searchTerm}" in {searchType}
            </span>
          )}
        </div>

        <div className="pagination-controls">
          <div className="page-size-selector">
            <label>Show: </label>
            <div className="page-size-control">
              <button
                className="page-size-btn"
                onClick={decrementPageSize}
                disabled={recordsPerPage <= 10 || isLoading}
              >
                -
              </button>
              <input
                type="number"
                min="10"
                value={pageSizeInput}
                onChange={handlePageSizeInputChange}
                onFocus={(e) => e.target.select()}
                onBlur={handlePageSizeBlur}
                onKeyPress={handlePageSizeKeyPress}
                className="page-size-input"
                disabled={isLoading}
              />
              <button
                className="page-size-btn"
                onClick={incrementPageSize}
                disabled={isLoading}
              >
                +
              </button>
            </div>
            <span>entries </span>
          </div>

          <div className="pagination-buttons">
            <button
              className="pagination-button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
            >
              Previous
            </button>

            {pageNumbers.map((number, index) =>
              number === "..." ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={number}
                  className={`pagination-button ${
                    currentPage === number ? "active" : ""
                  }`}
                  onClick={() => paginate(number)}
                  disabled={isLoading}
                >
                  {number}
                </button>
              )
            )}

            <button
              className="pagination-button"
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datasensor;
