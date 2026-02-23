// // frontend/src/components/ICP/GenerateICP.js
// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import ICPMainGride from "./ICPMainGride";
// import { useLocation } from "react-router-dom";


// export default function GenerateICP() {
//   const location = useLocation();
//   const [industries, setIndustries] = useState([]);
//   const [countries, setCountries] = useState([]);
//   const [jobLevels, setJobLevels] = useState([]);
//   const [jobFunctions, setJobFunctions] = useState([]);
//   const [employeeSizes, setEmployeeSizes] = useState([]);
//   const [revenueSizes, setRevenueSizes] = useState([]);
//   const [qaStatuses, setQaStatuses] = useState([]);
//   const [leadTypes, setLeadTypes] = useState([]);
//   const [leadSources, setLeadSources] = useState([]);
//   const [error, setError] = useState("");
//   const [pageSize, setPageSize] = useState(10);


//   const [filters, setFilters] = useState({
//     campaign_id: "",
//     country: "",
//     industry: "",
//     job_level: "",
//     job_function: "",
//     employee_size: "",
//     revenue_size: "",
//     qa_status: "",
//     lead_type: "",
//     lead_source: "",
//     campaign_suppression: "all",
//     start_date: "",
//     end_date: "",
//     limit: 1000
//   });

//   const [refreshKey, setRefreshKey] = useState(0);
  

//   const API_BASE = (process.env.REACT_APP_API_DOMAIN || "http://localhost:8000").replace(/\/$/, "");

//   const ENDPOINTS = {
//     industries: `${API_BASE}/leadscores/filters/industries`,
//     countries: `${API_BASE}/leadscores/filters/countries`,
//     job_levels: `${API_BASE}/leadscores/filters/job_levels`,
//     job_functions: `${API_BASE}/leadscores/filters/job_functions`,
//     employee_sizes: `${API_BASE}/leadscores/filters/employee_sizes`,
//     revenue_sizes: `${API_BASE}/leadscores/filters/revenue_sizes`,
//     qa_statuses: `${API_BASE}/leadscores/filters/qa-statuses`,
//     lead_types: `${API_BASE}/leadscores/filters/lead-types`,
//     lead_sources: `${API_BASE}/leadscores/filters/lead-sources`
//   };

  

//   const toOptions = (arr, idKey = "id", labelKey = "label") =>
//     Array.isArray(arr)
//       ? arr.map(it => ({
//           id: it[idKey] ?? it.id ?? it.value ?? "",
//           label: it[labelKey] ?? it.label ?? it.name ?? ""
//         }))
//       : [];

//   const fetchJson = async url => (await axios.get(url)).data;

//  useEffect(() => {
//   const params = new URLSearchParams(location.search);

//   setFilters((prev) => ({
//     ...prev,

//     // These must match the query keys from CreateIdealTAL
//     country: params.get("country_id") || "",
//     industry: params.get("industry_id") || "",
//     employee_size: params.get("employee_size_id") || "",
//     revenue_size: params.get("revenue_size_id") || "",
//     job_level: params.get("job_level_id") || "",
//     job_function: params.get("job_function_id") || "",
//     lead_type: params.get("lead_type_id") || "",
//   }));

//   setRefreshKey((prev) => prev + 1);
// }, [location.search]);

  

//   const fetchAllFilters = useCallback(async () => {
//     try {
//       const [
//         i, c, jl, jf, es, rs, qa, lt, ls
//       ] = await Promise.all([
//         fetchJson(ENDPOINTS.industries),
//         fetchJson(ENDPOINTS.countries),
//         fetchJson(ENDPOINTS.job_levels),
//         fetchJson(ENDPOINTS.job_functions),
//         fetchJson(ENDPOINTS.employee_sizes),
//         fetchJson(ENDPOINTS.revenue_sizes),
//         fetchJson(ENDPOINTS.qa_statuses),
//         fetchJson(ENDPOINTS.lead_types),
//         fetchJson(ENDPOINTS.lead_sources)
//       ]);

//       setIndustries(toOptions(i.industries || []));
//       setCountries(toOptions(c.countries || []));
//       setJobLevels(toOptions(jl.job_levels || []));
//       setJobFunctions(toOptions(jf.job_functions || []));
//       setEmployeeSizes(toOptions(es.employee_sizes || []));
//       setRevenueSizes(toOptions(rs.revenue_sizes || []));
//       setQaStatuses(toOptions(qa.qa_statuses || []));
//       setLeadTypes(toOptions(lt.lead_types || []));
//       setLeadSources(toOptions(ls.lead_sources || []));
//     } catch (e) {
//       console.error("Failed to load ICP filters", e);
//     }
//   }, []);

//   const findIdByLabel = (list, label) => {
//   const match = list.find((x) => x.label === label);
//   return match ? match.id : "";
// };
//   useEffect(() => {
//     fetchAllFilters();
//   }, []);


//   const updateFilter = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//   };

//   const runICP = () => {
//     setRefreshKey(prev => prev + 1);
//   };

//   const clearFilters = () => {
//     setFilters({
//       campaign_id: "",
//       country: "",
//       industry: "",
//       job_level: "",
//       job_function: "",
//       employee_size: "",
//       revenue_size: "",
//       qa_status: "",
//       lead_type: "",
//       lead_source: "",
//       campaign_suppression: "all",
//       start_date: "",
//       end_date: "",
//       limit: 1000
//     });
//     setRefreshKey(prev => prev + 1);
//   };

//   const isCampaignSelected = Boolean(filters.campaign_id);
  

//   return (
//     <div className="container-fluid bg-light min-vh-100 py-4 px-md-5">
//       {error && <div className="alert alert-danger shadow-sm border-0 mb-4">{error}</div>}
//       {/* Results Table Section */}
//       <div className="mt-5">
//         <div className="d-flex justify-content-between align-items-end mb-3">
//           <h5 className="fw-bold mb-0">ICP Score Result</h5>
          
//         </div>
//         <ICPMainGride
//         filters={filters}
//         refreshKey={refreshKey}
//          pageSize={pageSize}
//       />
//       </div>
//     </div>
//   );
// }


// frontend/src/components/ICP/GenerateICP.js

import React, { useEffect, useState } from "react";
import ICPMainGride from "./ICPMainGride";

export default function GenerateICP({ embeddedQuery }) {
  const [filters, setFilters] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Load Filters from Parent Query
  useEffect(() => {
    if (!embeddedQuery) return;

    const params = new URLSearchParams(embeddedQuery);

    const loadedFilters = {
      country: params.get("country_id") || "",
      industry: params.get("industry_id") || "",
      employee_size: params.get("employee_size_id") || "",
      revenue_size: params.get("revenue_size_id") || "",
      job_level: params.get("job_level_id") || "",
      job_function: params.get("job_function_id") || "",
      lead_type: params.get("lead_type_id") || "",
      limit: 1000,
    };

    setFilters(loadedFilters);

    // Refresh Grid
    setRefreshKey((prev) => prev + 1);
  }, [embeddedQuery]);

  return (
    <div className="card shadow-sm border-0 rounded-4 p-4 ">
      <h4 className="fw-bold mb-3">ICP Leads Result</h4>

      <ICPMainGride
        filters={filters}
        refreshKey={refreshKey}
        pageSize={10}
      />
    </div>
  );
}
