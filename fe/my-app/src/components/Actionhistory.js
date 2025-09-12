import { useState, useEffect } from "react";
import "../components/Actionhistoryscss.scss"; // Import your CSS file for styling

const Actionhistory = () => {
  const [actionData, setActionData] = useState([]);
  // Fetch data từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/historyaction/");
        const data = await res.json();

        // Giữ tối đa 100 bản ghi (queue)
        if (data.length > 100) {
          setActionData(data.slice(0, 100));
        } else {
          setActionData(data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    // Cập nhật mỗi 5 giây
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);
  // Dữ liệu mẫu
  // const actionData = [
  //   {
  //     id: 332,
  //     device: "AIR_CONDITIONER",
  //     action: "ON",
  //     time: "13:42:27 16/10/2025",
  //   },
  //   { id: 331, device: "LED", action: "OFF", time: "13:00:51 16/10/2025" },
  //   {
  //     id: 330,
  //     device: "AIR_CONDITIONER",
  //     action: "OFF",
  //     time: "13:00:50 16/10/2025",
  //   },
  //   { id: 329, device: "FAN", action: "OFF", time: "13:00:47 16/10/2025" },
  //   { id: 328, device: "LED", action: "ON", time: "10:22:18 16/10/2025" },
  //   {
  //     id: 327,
  //     device: "AIR_CONDITIONER",
  //     action: "ON",
  //     time: "10:22:18 16/10/2025",
  //   },
  //   { id: 326, device: "FAN", action: "ON", time: "10:22:17 16/10/2025" },
  //   { id: 325, device: "LED", action: "OFF", time: "02:53:51 12/10/2025" },
  //   { id: 324, device: "LED", action: "ON", time: "02:53:49 12/10/2025" },
  //   { id: 323, device: "LED", action: "OFF", time: "02:53:44 12/10/2025" },
  //   {
  //     id: 332,
  //     device: "AIR_CONDITIONER",
  //     action: "ON",
  //     time: "13:42:27 16/10/2025",
  //   },
  //   { id: 331, device: "LED", action: "OFF", time: "13:00:51 16/10/20202524" },
  //   {
  //     id: 330,
  //     device: "AIR_CONDITIONER",
  //     action: "OFF",
  //     time: "13:00:50 16/10/2025",
  //   },
  //   { id: 329, device: "FAN", action: "OFF", time: "13:00:47 16/10/2025" },
  //   { id: 328, device: "LED", action: "ON", time: "10:22:18 16/10/2025" },
  //   {
  //     id: 327,
  //     device: "AIR_CONDITIONER",
  //     action: "ON",
  //     time: "10:22:18 16/10/2025",
  //   },
  //   { id: 326, device: "FAN", action: "ON", time: "10:22:17 16/10/2025" },
  //   { id: 325, device: "LED", action: "OFF", time: "02:53:51 12/10/2025" },
  //   { id: 324, device: "LED", action: "ON", time: "02:53:49 12/10/2025" },
  //   { id: 323, device: "LED", action: "OFF", time: "02:53:44 12/10/2025" },
  //   {
  //     id: 332,
  //     device: "AIR_CONDITIONER",
  //     action: "ON",
  //     time: "13:42:27 16/10/2025",
  //   },
  //   { id: 331, device: "LED", action: "OFF", time: "13:00:51 16/10/2025" },
  //   {
  //     id: 330,
  //     device: "AIR_CONDITIONER",
  //     action: "OFF",
  //     time: "13:00:50 16/10/2025",
  //   },
  //   { id: 329, device: "FAN", action: "OFF", time: "13:00:47 16/10/2025" },
  //   { id: 328, device: "LED", action: "ON", time: "10:22:18 16/10/2025" },
  //   {
  //     id: 327,
  //     device: "AIR_CONDITIONER",
  //     action: "ON",
  //     time: "10:22:18 16/10/2024",
  //   },
  //   { id: 326, device: "FAN", action: "ON", time: "10:22:17 16/10/2025" },
  //   { id: 325, device: "LED", action: "OFF", time: "02:53:51 12/10/2025" },
  //   { id: 324, device: "LED", action: "ON", time: "02:53:49 12/10/2025" },
  //   { id: 323, device: "LED", action: "OFF", time: "02:53:44 12/10/2025" },
  // ];

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const totalPages = Math.ceil(actionData.length / recordsPerPage);

  // Get current records
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = actionData.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="action-history-container">
      <h1>Action History</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search (ID, Device, Hành động, or Time)"
          className="search-input"
        />
        <button className="search-button">Search</button>
      </div>

      <div className="table-container">
        <table className="action-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Device</th>
              <th>Hành động</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((item) => (
              <tr key={`${item.id}-${item.time}`}>
                <td>{item.id}</td>
                <td>{item.device}</td>
                <td className={`action-${item.action.toLowerCase()}`}>
                  {item.action}
                </td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="pagination">
        <button
          className="pagination-button"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            className={`pagination-button ${
              currentPage === number ? "active" : ""
            }`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}

        <button
          className="pagination-button"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
export default Actionhistory;
