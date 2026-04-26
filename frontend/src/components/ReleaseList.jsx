import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getReleases, deleteRelease } from "../api";
import {
  PlusCircle,
  Eye,
  Trash2,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const ReleaseList = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination & Filter State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [date, setDate] = useState("");
  const [sortDir, setSortDir] = useState("desc");

  const debounceTimeout = useRef(null);
  const abortController = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchReleases(page, search, status, date, sortDir);
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [page, status, date, sortDir]); // trigger directly on dropdown/date changes and pagination

  const fetchReleases = async (
    currentPage,
    currentSearch,
    currentStatus,
    currentDate,
    currentSortDir
  ) => {
    setLoading(true);

    // Cancel previous request if it's still in-flight
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      const { data } = await getReleases({
        page: currentPage,
        limit,
        search: currentSearch,
        status: currentStatus,
        date: currentDate,
        sortDir: currentSortDir,
      });
      // The backend returns { data: [...], metadata: { totalPages } }
      setReleases(data.data);
      setTotalPages(data.metadata.totalPages || 1);
    } catch (error) {
      if (error.code !== "ERR_CANCELED" && error.name !== "CanceledError") {
        console.error("Failed to fetch releases", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this release?")) {
      try {
        await deleteRelease(id);
        // Refresh current page
        fetchReleases(page, search, status, date, sortDir);
      } catch (error) {
        console.error("Failed to delete release", error);
      }
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);

    // Debounce the API call by 500ms
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setPage(1); // reset to page 1 on new search
      fetchReleases(1, val, status, date, sortDir);
    }, 500);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("All");
    setDate("");
    setSortDir("desc");
    setPage(1);
    fetchReleases(1, "", "All", "", "desc");
  };

  return (
    <div className="main-box">
      <div className="box-header">
        <div className="breadcrumb">
          <span
            className="breadcrumb-link"
            style={{ textDecoration: "underline", cursor: "pointer" }}
          >
            All releases
          </span>
        </div>
        <Link to="/new" className="btn btn-primary">
          New release <PlusCircle size={16} />
        </Link>
      </div>

      <div className="filters-bar">
        <div className="filter-group filter-group--search">
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="form-control"
            placeholder="Search release name..."
            value={search}
            onChange={handleSearchChange}
            style={{ paddingLeft: "2.5rem", paddingRight: search ? "2.25rem" : "0.75rem" }}
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                setPage(1);
                fetchReleases(1, "", status, date, sortDir);
              }}
              style={{
                position: "absolute",
                right: "0.6rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "1rem",
                lineHeight: 1,
                padding: "0",
                display: "flex",
                alignItems: "center",
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div
          className="filter-group"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Filter size={16} color="var(--text-muted)" />
          <select
            value={status}
            onChange={handleStatusChange}
            className="form-control"
            style={{ width: "130px" }}
          >
            <option value="All">All Statuses</option>
            <option value="planned">Planned</option>
            <option value="ongoing">Ongoing</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="filter-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.75rem", fontWeight: "600", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Date:</span>
          <input
            type="date"
            className="form-control"
            value={date}
            onChange={handleDateChange}
            style={{ width: "160px" }}
          />
        </div>

        {(search || status !== "All" || date) && (
          <button
            className="btn"
            onClick={clearFilters}
            style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
          >
            Clear
          </button>
        )}
      </div>

      <div className="table-scroll-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Release</th>
            <th
              onClick={() =>
                setSortDir((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}
              title="Toggle Date Sort"
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                Date{" "}
                {sortDir === "desc" ? (
                  <ArrowDown size={14} color="var(--primary)" />
                ) : (
                  <ArrowUp size={14} color="var(--primary)" />
                )}
              </span>
            </th>
            <th>Status</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading && releases.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Loading...
              </td>
            </tr>
          ) : releases.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{ textAlign: "center", color: "var(--text-muted)" }}
              >
                No releases found matching your criteria.
              </td>
            </tr>
          ) : (
            releases.map((release) => {
              // Bulletproof Date Parsing
              let formattedDate = "Unknown Date";
              if (release.release_date) {
                const ts = !isNaN(release.release_date)
                  ? Number(release.release_date)
                  : release.release_date;
                const dateObj = new Date(ts);
                if (!isNaN(dateObj.getTime())) {
                  formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                }
              }

              const formattedStatus =
                release.status.charAt(0).toUpperCase() +
                release.status.slice(1);

              return (
                <tr key={release.id}>
                  <td data-label="Release">{release.name}</td>
                  <td data-label="Date">{formattedDate}</td>
                  <td data-label="Status">{formattedStatus}</td>
                  <td className="td-actions">
                    <button
                      onClick={() => navigate(`/releases/${release.id}`)}
                      className="btn btn-icon"
                    >
                      View <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(release.id)}
                      className="btn btn-icon"
                      style={{ color: "var(--danger)" }}
                    >
                      Delete <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div> {/* table-scroll-wrapper */}

      {totalPages > 1 && (
        <div className="pagination-bar">
          <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ← Prev
            </button>
            <button
              className="btn"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleaseList;
