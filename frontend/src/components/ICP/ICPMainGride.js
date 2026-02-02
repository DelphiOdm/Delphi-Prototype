// frontend/src/components/ICP/ICPMainGride.js
import React from "react";

export default function ICPMainGride({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mt-3">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light text-muted small">
          <tr>
            <th>Lead ID</th>
            <th>Company</th>
            <th>Industry</th>
            <th>Job Title</th>
            <th>ICP Fit Score</th>
            <th>Propensity Score</th>
            <th>Quadrant</th>
            <th>Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="py-3 border-0">{row.lead_id}</td>
              <td className="py-3 border-0">{row.company}</td>
              <td className="py-3 border-0">{row.industry}</td>
              <td className="py-3 border-0">{row.job_title}</td>
              <td className="py-3 border-0">{row.icp_fit}</td>
              <td className="py-3 border-0">{row.propensity}</td>
              <td className="py-3 border-0">{row.quadrant}</td>
              <td className="py-3 border-0">{row.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
     </div>
  );
}
