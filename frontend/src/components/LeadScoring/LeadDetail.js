// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// export default function LeadDetail() {
//   const { leadId } = useParams();

//   const [lead, setLead] = useState(null);
//   const [breakdown, setBreakdown] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const API_BASE = (process.env.REACT_APP_API_DOMAIN || "").replace(/\/$/, "");

//   useEffect(() => {
//     fetchLeadDetail();
//     // eslint-disable-next-line
//   }, []);

//   const fetchLeadDetail = async () => {
//     try {
//       const res = await axios.get(
//         `${API_BASE}/leadscores/leads/lead-detail/${leadId}`
//       );

//       setLead(res.data.lead);

//       const raw = res.data.score_breakdown || [];

//       // 🔍 IMPORTANT: log once to confirm backend shape
//       console.log("Score breakdown raw:", raw);

//       // ✅ SMART NORMALIZATION (handles ANY column name)
//       const normalized = raw.map((row) => {
//         const keys = Object.keys(row);

//         const criteriaKey = keys.find((k) =>
//           k.toLowerCase().includes("criteria") ||
//           k.toLowerCase().includes("scoring") ||
//           k.toLowerCase().includes("name")
//         );

//         const scoreKey = keys.find((k) =>
//           k.toLowerCase().includes("score")
//         );

//         return {
//           criteria: criteriaKey ? row[criteriaKey] : "—",
//           score: scoreKey ? row[scoreKey] : 0
//         };
//       });

//       setBreakdown(normalized);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load lead details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) return <div className="p-4">Loading lead details…</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;
//   if (!lead) return <div className="alert alert-warning">Lead not found</div>;

//   return (
//     <div className="container mt-4">

//       {/* ================= LEAD INFO ================= */}
//       <div className="card mb-4">
//         <div className="card-body">
//           <h4 className="mb-1">{lead.name}</h4>
//           <p className="text-muted mb-3">{lead.Email_id}</p>

//           <div className="row g-2">
//             <div className="col-md-4"><strong>Job Title:</strong> {lead.Job_title}</div>
//             <div className="col-md-4"><strong>Job Level:</strong> {lead.Job_level_desc}</div>
//             <div className="col-md-4"><strong>Job Function:</strong> {lead.Jobfunction_desc}</div>

//             <div className="col-md-4"><strong>Industry:</strong> {lead.industry}</div>
//             <div className="col-md-4"><strong>Employee Size:</strong> {lead.Employee_size_desc}</div>
//             <div className="col-md-4"><strong>Revenue Size:</strong> {lead.Revenue_size_desc}</div>

//             <div className="col-md-4"><strong>Country:</strong> {lead.country}</div>
            
//           </div>
//         </div>
//       </div>

//       {/* ================= SCORE BREAKDOWN ================= */}
//       <div className="card">
//         <div className="card-header fw-bold">
//           Score Breakdown
//         </div>

//         <div className="table-responsive">
//           <table className="table table-bordered table-sm mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Criteria</th>
//                 <th style={{ width: "120px" }}>Score</th>
//               </tr>
//             </thead>

//             <tbody>
//               {breakdown.map((b, i) => (
//                 <tr key={i}>
//                   <td>{b.criteria}</td>
//                   <td className="fw-bold text-center">{b.score}</td>
//                 </tr>
//               ))}

//               {!breakdown.length && (
//                 <tr>
//                   <td colSpan="2" className="text-center text-muted">
//                     No score details available
//                   </td>
//                 </tr>
//               )}
//             </tbody>

//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }


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
      const res = await axios.get(`${API_BASE}/leadscores/leads/lead-detail/${leadId}`);
      setLead(res.data.lead);
      setBreakdown(res.data.score_breakdown || []);
    } catch (err) {
      setError("Failed to load lead details");
    } finally {
      setLoading(false);
    }
  };

  // Helper to map Parameter Name -> Actual Lead Value
  const getSubParameterValue = (criteria) => {
    if (!lead || !criteria) return "—";
    const c = criteria.toLowerCase();
    
    if (c.includes("job level")) return lead.Job_level_desc;
    if (c.includes("function")) return lead.Jobfunction_desc;
    if (c.includes("employee")) return lead.Employee_size_desc;
    if (c.includes("revenue")) return lead.Revenue_size_desc;
    if (c.includes("country")) return lead.country;
    if (c.includes("industry")) return lead.industry;
    if (c.includes("audit")) return lead.qa_status;
    if (c.includes("lead type")) return lead.Leadtype_desc;
    if (c.includes("call rating")) return lead.QAcallrating_desc;
    if (c.includes("primary")) return lead.QAprimaryreason_desc;
    
    return "—";
  };

  if (loading) return <div className="p-4 text-center">Loading lead details…</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!lead) return <div className="alert alert-warning">Lead not found</div>;

  return (
    <div className="container mt-4">

      {/* ================= LEAD INFO ================= */}
      <div className="card mb-4 shadow-sm border-0">
        <div className="card-body">
          <h4 className="mb-1 fw-bold">{lead.name}</h4>
          <p className="text-muted mb-3">{lead.Email_id}</p>
          <div className="row g-2">
            <div className="col-md-4"><strong>Job Title:</strong> {lead.Job_title}</div>
            <div className="col-md-4"><strong>Job Level:</strong> {lead.Job_level_desc}</div>
            <div className="col-md-4"><strong>Phone:</strong> {lead.Phone_number || "—"}</div>
            <div className="col-md-4"><strong>Industry:</strong> {lead.industry}</div>
            <div className="col-md-4"><strong>Country:</strong> {lead.country}</div>
            <div className="col-md-4"><strong>Job Function:</strong> {lead.Jobfunction_desc}</div>
            <div className="col-md-4"><strong>Revenue Size:</strong> {lead.Revenue_size_desc}</div>
            <div className="col-md-4"><strong>Employee Size:</strong> {lead.Employee_size_desc}</div>
            <div className="col-md-4">
  <strong>Audit Status:</strong>{" "}
  <span 
    className={`badge rounded-pill ms-1 ${
      !lead.isAudited ? 'bg-secondary' : 
      lead.qa_status === 'Approved' ? 'bg-success' : 
      lead.qa_status === 'Rejected' ? 'bg-danger' : 'bg-warning'
    }`}
  >
    {/* lead.qa_status corresponds to QAstatus_desc from Mst_tblqualityaudit_status */}
    {lead.isAudited ? lead.qa_status : "Not Audited"}
  </span>
  
  {/* Optional: Show the Primary Reason if the lead was rejected or queried */}
  {lead.isAudited && lead.primary_reason_score < 0 && (
    <div className="mt-1">
      <small className="text-muted italic">
        Reason: {lead.primary_reason_desc}
      </small>
    </div>
  )}
</div>
          </div>
        </div>
      </div>

   {/* ================= SIDE-BY-SIDE TABLES ================= */}
      <div className="row g-4 mt-4">
        
        {/* TABLE 1: SCORING WEIGHTS (The Rules) */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100 overflow-hidden">
            <div className="card-header fw-bold bg-dark text-white py-3">
              <h6 className="mb-0 fw-bold">Scoring Weights</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th className="ps-3">Parameter</th>
                    <th className="text-center">Weight </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b, i) => (
                    <tr key={`weight-${i}`}>
                      <td className="ps-3 text-dark small fw-medium">{b.parameter_name}</td>
                      <td className="fw-bold text-center text-secondary">
                        {b.weight}%
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="table-light border-top fw-bold">
                  <tr>
                    <td className="ps-3">Total Weight</td>
                    <td className="text-center">
                      {breakdown.reduce((sum, b) => sum + parseFloat(b.weight || 0), 0)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* TABLE 2: CALCULATION LOGIC (The Performance) */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 h-100 overflow-hidden">
            <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold">Calculation Logic</h6>
              
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small text-uppercase">
                  <tr>
                    <th className="ps-3">Parameter</th>
                    <th className="text-center">Score</th>
                    <th className="text-center">Calculation</th>
                    <th className="text-end pe-3">Weighted Value</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b, i) => (
                    <tr key={`weighted-${i}`}>
                      <td className="ps-3">
                        <div className="fw-bold text-dark mb-0">{b.parameter_name}</div>
                        <div className="text-muted small italic" style={{ fontSize: '0.75rem' }}>
                          {getSubParameterValue(b.parameter_name)}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-light text-primary border border-primary-subtle px-3">
                          {b.raw_score}
                        </span>
                      </td>
                      <td className="text-center text-muted small">
                         {b.raw_score} × {b.weight}%
                      </td>
                      <td className="text-end fw-bold text-primary pe-3">
                        {parseFloat(b.weighted_score).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary-subtle border-top-0">
                  <tr className="table-primary">
                    <td colSpan="3" className="text-end fw-bold ps-3 py-3">Total Scored:</td>
                    <td className="text-end fw-bold text-primary pe-3 fs-5">
                      {breakdown.reduce((sum, b) => sum + parseFloat(b.weighted_score), 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};