import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MonthlyLeadsBarChart from "./MonthlyLeadsBarChart";
import '../../styles/common.css';

const API_BASE_URL = process.env.REACT_APP_API_DOMAIN;

const currentYear = new Date().getFullYear();
const startYear = 2022;
const years = Array.from(
  { length: currentYear - startYear + 1 },
  (_, i) => currentYear - i
);

export default function SuperManagerDashboard() {
  const navigate = useNavigate();
  const [year, setYear] = useState(2024);
  const [topLeads, setTopLeads] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scoreRange, setScoreRange] = useState("ALL");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchDashboardData(year);
    setCurrentPage(1);
    // eslint-disable-next-line
  }, [year, scoreRange]);

  const fetchDashboardData = async (selectedYear) => {
    try {
      setLoading(true);
      const [topRes, monthRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/dashboard/top-leads`, { params: { year: selectedYear } }),
        axios.get(`${API_BASE_URL}/dashboard/monthly-leads`, { params: { year: selectedYear } })
      ]);

      setTopLeads(Array.isArray(topRes.data?.leads) ? topRes.data.leads : []);
      setMonthlyStats(
        Array.isArray(monthRes.data?.monthly_counts)
          ? monthRes.data.monthly_counts
          : []
      );

    } catch (err) {
      console.error("Dashboard API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadge = (score) => {
    const num = Number(score || 0);
    if (num >= 80) return "bg-success text-white";
    if (num >= 60 ) return "bg-primary text-white";
    if (num >= 50 ) return "bg-warning text-dark";
    if (num < 50) return "bg-danger text-white";
    return "bg-secondary text-white";
  };

  const filteredLeads = topLeads.filter(l => {
    const score = Number(l.total_score || 0);
    if (scoreRange === "0-50") return score >= 0 && score < 50;
    if (scoreRange === "50-80") return score >= 50 && score < 80;
    if (scoreRange === "80-100") return score >= 80;
    return true;
  });

  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + pageSize);

  return (
    <div className="container-fluid px-4 py-4 bg-light min-vh-100">

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3 ">
        <div>
          <h3 className="fw-bold text-dark mb-1 title-style">Dashboard Overview</h3>
          {/* <style>{`
        .dashboard-title {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 1.2rem;
            letter-spacing: 3px;
            background: linear-gradient(90deg, #212529 0%, #0d6efd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            position: relative;
            transition: all 0.3s ease;
        }
    `}</style> */}
          <p className="text-secondary mb-0">Track performance metrics and lead propensity.</p>
        </div>

        <div className="d-flex align-items-center bg-white p-2 rounded-3 shadow-sm border">
          <span className="text-muted small me-2 ps-2">Year:</span>
          <select
            className="form-select form-select-sm border-0 fw-semibold bg-light"
            style={{ width: "100px", cursor: "pointer" }}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row g-4">

        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4 h-100">
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
              <h5 className="fw-bold text-dark mb-0">Monthly Lead Volume</h5>
              <span className="text-muted small">Comparison of leads generated in {year}</span>
            </div>
            <div className="card-body px-4 pb-4">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              ) : monthlyStats.length === 0 ? (
                <div className="text-center text-muted py-5 my-5">
                  No data available for this year
                </div>
              ) : (
                <MonthlyLeadsBarChart data={monthlyStats} />
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-0">Top Performing Leads</h5>
                <span className="text-muted small">Propensity scores for {year} leads</span>
              </div>

              {!loading && topLeads.length > 0 && (
                <select
                  className="form-select form-select-sm w-auto"
                  value={scoreRange}
                  onChange={(e) => setScoreRange(e.target.value)}
                >
                  <option value="ALL">All Scores</option>
                  <option value="0-50">0 - 50</option>
                  <option value="50-80">50 - 80</option>
                  <option value="80-100">80+</option>
                </select>
              )}
            </div>

            <div className="card-body p-0 mt-3">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ minWidth: "800px" }}>
                  <thead className="bg-light text-secondary small text-uppercase fw-bold">
                    <tr>
                      <th className="ps-4 py-3">Rank</th>
                      <th className="py-3">Lead Details</th>
                      <th className="py-3">Company Info</th>
                      <th className="py-3 text-center">Propensity Score</th>
                      <th className="pe-4 py-3 text-end">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {!loading && filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No leads for this range
                        </td>
                      </tr>
                    )}

                    {!loading && paginatedLeads.map((l, i) => (
                      <tr key={l.Lead_id}>
                        <td className="ps-4">{startIndex + i + 1}</td>
                        <td>{l.name}<br /><small>{l.Email_id}</small></td>
                        <td>{l.Company_name}</td>
                        <td className="text-center">
                          <span className={`badge ${getScoreBadge(l.total_score)}`}>
                            {Number(l.total_score || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="pe-4 text-end">
                          <button className="btn btn-sm btn-outline-primary" onClick={() => window.open(`/leads/${l.Lead_id}`)}>
                            View Analysis
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {filteredLeads.length > 0 && (
                <div className="d-flex justify-content-end align-items-center p-3 gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                  >
                    Prev
                  </button>
                  <span className="small">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
