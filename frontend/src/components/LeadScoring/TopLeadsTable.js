import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function TopLeadsTable({ leads = [], loading, pageSize }) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerSubPage = 10; 

  // Reset to page 1 whenever the filter results change or outer pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [leads, pageSize]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted small">Calculating Propensity Scores...</div>
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="text-center py-5 border rounded-4 bg-white shadow-sm">
        <i className="bi bi-search display-6 text-muted mb-3 d-block"></i>
        <p className="text-muted">No leads found for the selected criteria.</p>
      </div>
    );
  }

  // 1. Sort by score
  const sortedLeads = [...leads].sort((a, b) => (b.score || 0) - (a.score || 0));

  // 2. Pagination Logic
  const totalPages = Math.ceil(sortedLeads.length / itemsPerSubPage);
  const indexOfLastItem = currentPage * itemsPerSubPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerSubPage;
  const currentItems = sortedLeads.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mt-3">
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0 fw-bold">Top Scored Leads</h6>
          <small className="text-muted">Ranked by propensity to convert</small>
        </div>
        <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
          {leads.length} Records
        </span>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light text-muted small">
            <tr>
              <th className="ps-4 py-3 border-0">RANK</th>
              <th className="py-3 border-0 text-center">SCORE</th>
              <th className="py-3 border-0">COMPANY / GEO</th>
              <th className="py-3 border-0">JOB PROFILE</th>
              <th className="py-3 border-0">INDUSTRY</th>
              {/* AUDIT STATUS HEADER REMOVED */}
              <th className="py-3 border-0 text-end pe-4">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((l, i) => {
              const rank = indexOfFirstItem + i + 1;
              return (
                <tr key={`${l.Lead_id}-${l.Engage_id || i}`}>
                  <td className="ps-4 fw-bold text-muted">{rank}</td>
                  <td className="text-center">
                    <div className="d-inline-block px-3 py-1 rounded-3 bg-success-subtle text-success fw-bold">
                      {Number(l.score || 0).toFixed(1)}
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark">{l.Company_name}</div>
                    <div className="text-muted small">
                       <i className="bi me-1"></i>{l.country}
                    </div>
                  </td>
                  <td>
                    <div className="text-dark small fw-semibold">{l.Job_title || "—"}</div>
                    <div className="text-muted extra-small">{l.Job_level_desc}</div>
                  </td>
                  <td>
                    <span className="text-muted small">{l.industry || "—"}</span>
                  </td>
                  {/* AUDIT STATUS DATA CELL REMOVED */}
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill px-3 shadow-sm border-2 fw-bold"
                      onClick={() => window.open(`/leads/${l.Lead_id}`, '_blank')}
                    >
                      View Analysis
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Internal Pagination Footer */}
      <div className="card-footer bg-white border-top py-3 px-4 d-flex justify-content-between align-items-center">
        <div className="text-muted small">
          Showing <strong>{indexOfFirstItem + 1}</strong> to{" "}
          <strong>{Math.min(indexOfLastItem, sortedLeads.length)}</strong> of{" "}
          <strong>{sortedLeads.length}</strong> leads
        </div>
        
        {totalPages > 1 && (
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link border-0 shadow-none rounded-start-pill px-3" onClick={() => setCurrentPage(currentPage - 1)}>
                   Previous
                </button>
              </li>
              
              {[...Array(totalPages)].map((_, idx) => (
                <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                  <button className="page-link border-0 shadow-none px-3" onClick={() => setCurrentPage(idx + 1)}>
                    {idx + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link border-0 shadow-none rounded-end-pill px-3" onClick={() => setCurrentPage(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}