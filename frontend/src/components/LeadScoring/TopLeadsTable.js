import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopLeadsTable({ leads = [], loading }) {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-5">Loading leads…</div>;
  }

  if (!leads.length) {
    return <div className="alert alert-warning">No leads found</div>;
  }

  // 🔹 Sort leads by total score (DESC)
  const sortedLeads = [...leads].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  return (
    <div className="card shadow-sm mt-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          {sortedLeads.length} Top Scored Leads Found
        </h6>
        <button className="btn btn-outline-secondary btn-sm">
          Export Excel
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light text-uppercase small">
            <tr>
              <th>Rank</th>
              <th>Score</th>
              <th>Company</th>
              <th>Job Title</th>
              <th>Industry</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {sortedLeads.map((l, i) => (
              <tr key={l.Lead_id}>
                <td>#{i + 1}</td>

                <td className="fw-bold text-success">
                  {Number(l.score || 0).toFixed(2)}
                </td>

                <td>
                  <div className="fw-semibold">{l.Company_name}</div>
                  <div className="text-muted small">{l.country}</div>
                </td>

                <td>
                  <div>{l.Job_title || "—"}</div>
                  <div className="text-muted small">
                    {l.Job_level_desc || ""}
                  </div>
                </td>

                <td>{l.industry || "—"}</td>

                <td>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/leads/${l.Lead_id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
