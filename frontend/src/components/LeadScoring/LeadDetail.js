import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function LeadDetail() {
  const { leadId } = useParams();

  const [lead, setLead] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = (process.env.REACT_APP_API_DOMAIN || "").replace(/\/$/, "");

  useEffect(() => {
    fetchLeadDetail();
    // eslint-disable-next-line
  }, []);

  const fetchLeadDetail = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/leadscores/leads/lead-detail/${leadId}`
      );

      setLead(res.data.lead);

      const raw = res.data.score_breakdown || [];

      // 🔍 IMPORTANT: log once to confirm backend shape
      console.log("Score breakdown raw:", raw);

      // ✅ SMART NORMALIZATION (handles ANY column name)
      const normalized = raw.map((row) => {
        const keys = Object.keys(row);

        const criteriaKey = keys.find((k) =>
          k.toLowerCase().includes("criteria") ||
          k.toLowerCase().includes("scoring") ||
          k.toLowerCase().includes("name")
        );

        const scoreKey = keys.find((k) =>
          k.toLowerCase().includes("score")
        );

        return {
          criteria: criteriaKey ? row[criteriaKey] : "—",
          score: scoreKey ? row[scoreKey] : 0
        };
      });

      setBreakdown(normalized);
    } catch (err) {
      console.error(err);
      setError("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading lead details…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!lead) return <div className="alert alert-warning">Lead not found</div>;

  return (
    <div className="container mt-4">

      {/* ================= LEAD INFO ================= */}
      <div className="card mb-4">
        <div className="card-body">
          <h4 className="mb-1">{lead.name}</h4>
          <p className="text-muted mb-3">{lead.Email_id}</p>

          <div className="row g-2">
            <div className="col-md-4"><strong>Job Title:</strong> {lead.Job_title}</div>
            <div className="col-md-4"><strong>Level:</strong> {lead.Job_level_desc}</div>
            <div className="col-md-4"><strong>Function:</strong> {lead.Jobfunction_desc}</div>

            <div className="col-md-4"><strong>Industry:</strong> {lead.industry}</div>
            <div className="col-md-4"><strong>Employee Size:</strong> {lead.Employee_size_desc}</div>
            <div className="col-md-4"><strong>Revenue Size:</strong> {lead.Revenue_size_desc}</div>

            <div className="col-md-4"><strong>Country:</strong> {lead.country}</div>
          </div>
        </div>
      </div>

      {/* ================= SCORE BREAKDOWN ================= */}
      <div className="card">
        <div className="card-header fw-bold">
          Score Breakdown
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-sm mb-0">
            <thead className="table-light">
              <tr>
                <th>Criteria</th>
                <th style={{ width: "120px" }}>Score</th>
              </tr>
            </thead>

            <tbody>
              {breakdown.map((b, i) => (
                <tr key={i}>
                  <td>{b.criteria}</td>
                  <td className="fw-bold text-center">{b.score}</td>
                </tr>
              ))}

              {!breakdown.length && (
                <tr>
                  <td colSpan="2" className="text-center text-muted">
                    No score details available
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
