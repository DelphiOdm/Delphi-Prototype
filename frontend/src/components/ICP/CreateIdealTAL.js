// // frontend/src/components/ICP/CreateIdealTAL.js
// import React, { useEffect, useState, useCallback } from "react";
// import axios from "axios";
// import "../../styles/common.css";
// import PromptBox from "./PromptBox";
// import { toast } from "react-toastify";
// import { ClipLoader } from "react-spinners";




// export default function CreateIdealTAL() {
//   const [loadingSnapshot, setLoadingSnapshot] = useState(false);
//   const [industries, setIndustries] = useState([]);
//   const [brands, setBrands] = useState([]);
//   const [countries, setCountries] = useState([]);

//   const [employeeSizes, setEmployeeSizes] = useState([]);
//   const [revenueSizes, setRevenueSizes] = useState([]);
//   const [jobLevels, setJobLevels] = useState([]);
//   const [jobFunctions, setJobFunctions] = useState([]);
//   const [leadTypes, setLeadTypes] = useState([]);

//   const [error, setError] = useState("");
//   const [snapshot, setSnapshot] = useState([]);
//   const [icpFilters, setIcpFilters] = useState(null);

//   const [showResults, setShowResults] = useState(false);
//   const [generatedQuery, setGeneratedQuery] = useState("");


//   // ----------------------------
//   // Filters State
//   // ----------------------------
//   const [filters, setFilters] = useState({
//     industries: "",
//     brand: "",
//     countries: "",
//   });

//   // ----------------------------
//   // API Base URL
//   // ----------------------------
//   const API_BASE = (
//     process.env.REACT_APP_API_DOMAIN || "http://localhost:8000"
//   ).replace(/\/$/, "");

//   // ----------------------------
//   // Endpoints
//   // ----------------------------
//   const ENDPOINTS = {
//     industries: `${API_BASE}/leadscores/filters/industries`,
//     countries: `${API_BASE}/leadscores/filters/countries`,
//     brands: `${API_BASE}/leadscores/filters/brands`,

//     employee_sizes: `${API_BASE}/leadscores/filters/employee_sizes`,
//     revenue_sizes: `${API_BASE}/leadscores/filters/revenue_sizes`,
//     job_levels: `${API_BASE}/leadscores/filters/job_levels`,
//     job_functions: `${API_BASE}/leadscores/filters/job_functions`,
//     lead_types: `${API_BASE}/leadscores/filters/lead-types`,
//   };

//   // ----------------------------
//   // Convert API response to dropdown format
//   // ----------------------------
//   const toOptions = (arr) =>
//     Array.isArray(arr)
//       ? arr.map((it) => ({
//           id: it.id ?? it.value ?? "",
//           label: it.label ?? it.name ?? "",
//         }))
//       : [];

//   // ----------------------------
//   // Fetch JSON Helper
//   // ----------------------------
//   const fetchJson = async (url) => (await axios.get(url)).data;

//   // ----------------------------
//   // Load All Filters (IMPORTANT)
//   // ----------------------------
//   const fetchInitialFilters = useCallback(async () => {
//     try {
//       const [
//         industryRes,
//         countryRes,
//         empRes,
//         revRes,
//         jlRes,
//         jfRes,
//         ltRes,
//       ] = await Promise.all([
//         fetchJson(ENDPOINTS.industries),
//         fetchJson(ENDPOINTS.countries),
//         fetchJson(ENDPOINTS.employee_sizes),
//         fetchJson(ENDPOINTS.revenue_sizes),
//         fetchJson(ENDPOINTS.job_levels),
//         fetchJson(ENDPOINTS.job_functions),
//         fetchJson(ENDPOINTS.lead_types),
//       ]);

//       setIndustries(toOptions(industryRes.industries || []));
//       setCountries(toOptions(countryRes.countries || []));

//       setEmployeeSizes(toOptions(empRes.employee_sizes || []));
//       setRevenueSizes(toOptions(revRes.revenue_sizes || []));
//       setJobLevels(toOptions(jlRes.job_levels || []));
//       setJobFunctions(toOptions(jfRes.job_functions || []));
//       setLeadTypes(toOptions(ltRes.lead_types || []));
//     } catch (e) {
//       console.error("Failed to load filters", e);
//       setError("Failed to load dropdown filters.");
//     }
//   }, []);

//   //  MUST RUN ON PAGE LOAD
//   useEffect(() => {
//     fetchInitialFilters();
//   }, [fetchInitialFilters]);

//   // ----------------------------
//   // Find ID by Label OR Return Number Directly
//   // ----------------------------
//   const resolveValueToId = (list, value) => {
//     if (!value) return null;

//     // If snapshot already gives ID
//     if (!isNaN(value)) return Number(value);

//     // Otherwise match by label
//     const match = list.find(
//       (x) => x.label.trim().toLowerCase() === value.trim().toLowerCase()
//     );

//     return match ? match.id : null;
//   };

//   // ----------------------------
//   // Load Brands When Industry Changes
//   // ----------------------------
//   useEffect(() => {
//     if (!filters.industries) {
//       setBrands([]);
//       return;
//     }

//     const fetchBrands = async () => {
//       try {
//         const res = await fetchJson(
//           `${ENDPOINTS.brands}?industry_id=${filters.industries}`
//         );

//         setBrands(toOptions(res.brands || []));
//       } catch (e) {
//         console.error("Failed to load brands", e);
//         setError("Failed to load brands.");
//       }
//     };

//     fetchBrands();
//   }, [filters.industries]);

//   // ----------------------------
//   // Update Filters Function
//   // ----------------------------
//   const updateFilter = (key, value) => {
//     setFilters((prev) => {
//       let updated = { ...prev, [key]: value };

//       if (key === "industries") {
//         updated.brand = "";
//       }

//       return updated;
//     });
//   };

//   // ----------------------------
//   // Clear All Filters
//   // ----------------------------
//   const clearFilters = () => {
//     setFilters({
//       industries: "",
//       brand: "",
//       countries: "",
//     });

//     setBrands([]);
//     setSnapshot([]);
//     setIcpFilters(null);
//   };

//   // ----------------------------
//   // Convert Snapshot → Backend Filter IDs
//   // ----------------------------
//   const mapSnapshotToFilters = (snapshotArr) => {
//     const mapped = {};
//     mapped.country_id = filters.countries || null;
//     mapped.industry_id = filters.industries || null;

//     snapshotArr.forEach((row) => {
//       const key = row.parameter.toLowerCase();

//     //   if (key.includes("country"))
//     //     mapped.country_id = resolveValueToId(countries, row.ideal_value);

//     //   if (key.includes("industry"))
//     //     mapped.industry_id = resolveValueToId(industries, row.ideal_value);

//       if (key.includes("employee"))
//         mapped.employee_size_id = resolveValueToId(
//           employeeSizes,
//           row.ideal_value
//         );

//       if (key.includes("revenue"))
//         mapped.revenue_size_id = resolveValueToId(
//           revenueSizes,
//           row.ideal_value
//         );

//       if (key.includes("job level"))
//         mapped.job_level_id = resolveValueToId(jobLevels, row.ideal_value);

//       if (key.includes("job function"))
//         mapped.job_function_id = resolveValueToId(
//           jobFunctions,
//           row.ideal_value
//         );

//       if (key.includes("lead type"))
//         mapped.lead_type_id = resolveValueToId(leadTypes, row.ideal_value);
//     });

//     return mapped;
//   };

//   // ----------------------------
//   // Create ICP Snapshot
//   // ----------------------------
//   const handleCreateICP = async () => {
//     setSnapshot([]);
//     setIcpFilters(null);
//     setLoadingSnapshot(true);

//     try {
//       const res = await axios.get(
//         `${API_BASE}/leadscores/scoring/icp/ideal-snapshot`,
//         {
//           params: {
//             industry_id: filters.industries,
//             brand_id: filters.brand,
//             country_id: filters.countries,
//           },
//         }
//       );

//       const snap = res.data.snapshot;
//       setSnapshot(snap);

//       const mappedFilters = mapSnapshotToFilters(snap);

//       setIcpFilters(mappedFilters);

//       console.log("Generated ICP Filters:", mappedFilters);
//     } catch (e) {
//     console.error("Snapshot failed", e);

//     toast.error("Not enough data to generate ICP Snapshot.", {
//     position: "top-right",
//     autoClose: 3000,
//   });
// }finally {
//     setLoadingSnapshot(false); 
//   }
//   };

//   // ----------------------------
//   // Show Leads Button
//   // ----------------------------
//   const handleShowLeads = () => {
//     if (!snapshot || snapshot.length === 0) return;

//     const filterPayload = mapSnapshotToFilters(snapshot);

//     // Remove null keys
//    Object.keys(filterPayload).forEach((k) => {
//     if (filterPayload[k] === null || filterPayload[k] === "")
//       delete filterPayload[k];
//   });
//     console.log("Passing Filters:", filterPayload);

//     const query = new URLSearchParams(filterPayload).toString();

//     window.open(`/ICP/GenerateICP?${query}`, "_blank");
//   };

//   // ----------------------------
//   // UI Rendering (UNCHANGED)
//   // ----------------------------
//   return (
//     <div className="container-fluid bg-light min-vh-100 py-4 px-md-5">
//       <h1 className="title-style">Ideal Customer Profile</h1>

//       {error && (
//         <div className="alert alert-danger shadow-sm border-0 mb-4">
//           {error}
//         </div>
//       )}

//       <div className="row justify-content-center">
//         <div className="col-10 pt-4">
//           <div className="card mt-5 border-0 shadow-sm rounded-4">
//             <div className="card-body p-4 border-start border-warning border-4 rounded-4">
//               <h6 className="fw-bold text-warning mb-3">
//                 Industry And Brand Selection
//               </h6>

//               <div className="row g-3">
//                 {/* Industry */}
//                 <div className="col-md-3">
//                   <select
//                     className="form-select form-select-sm"
//                     value={filters.industries}
//                     onChange={(e) =>
//                       updateFilter("industries", e.target.value)
//                     }
//                   >
//                     <option value="">Select Industry</option>
//                     {industries.map((i) => (
//                       <option key={i.id} value={i.id}>
//                         {i.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Brand */}
//                 <div className="col-md-3">
//                   <select
//                     className="form-select form-select-sm"
//                     value={filters.brand}
//                     disabled={!filters.industries}
//                     onChange={(e) => updateFilter("brand", e.target.value)}
//                   >
//                     <option value="">
//                       {filters.industries
//                         ? "Select Brand"
//                         : "Select Industry First"}
//                     </option>

//                     {brands.map((b) => (
//                       <option key={b.id} value={b.id}>
//                         {b.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Country */}
//                 <div className="col-md-3">
//                   <select
//                     className="form-select form-select-sm"
//                     value={filters.countries}
//                     onChange={(e) =>
//                       updateFilter("countries", e.target.value)
//                     }
//                   >
//                     <option value="">Select Country</option>
//                     {countries.map((c) => (
//                       <option key={c.id} value={c.id}>
//                         {c.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Clear */}
//                 <div className="col-md-3">
//                   <button
//                     className="btn btn-outline-danger btn-sm w-100"
//                     onClick={clearFilters}
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               </div>

//               {/* Prompt */}
//               <div className="mt-4">
//                 <PromptBox onSend={handleCreateICP} />
//               </div>

//               {/* Create ICP */}
//               <div className="chatgpt-prompt-wrapper">
//                 <button
//                   className="btn btn-primary px-4 fw-bold"
//                   onClick={handleCreateICP}
//                   disabled={loadingSnapshot}
//                 >
//                   {loadingSnapshot ? (
//     <>
//       <ClipLoader size={18} />
//       Generating...
//     </>
//   ) : (
//     "ICP Snapshot"
//   )}
//                 </button>
//               </div>

             

//               {/* Snapshot */}
//               {snapshot.length > 0 && (
//                 <div className="mt-4">
//                   <h5 className="fw-bold">Ideal ICP Snapshot</h5>

//                   <div className="row">
//                     {snapshot.map((s, idx) => (
//                       <div key={idx} className="col-md-4 mt-3">
//                         <div className="card shadow-sm rounded-4 p-3">
//                           <h6 className="text-muted">{s.parameter}</h6>
//                           <h5 className="fw-bold">{s.ideal_value}</h5>
//                           <small>Frequency: {s.frequency}</small>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="chatgpt-prompt-wrapper">
//                     <button
//                       className="btn btn-primary px-4 fw-bold"
//                       onClick={handleShowLeads}
//                     >
//                       Show Leads for ICP
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// frontend/src/components/ICP/CreateIdealTAL.js

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "../../styles/common.css";
import PromptBox from "./PromptBox";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

import GenerateICP from "./GenerateICP"; // ✅ Import Embedded Component

export default function CreateIdealTAL() {
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  const [industries, setIndustries] = useState([]);
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);

  const [employeeSizes, setEmployeeSizes] = useState([]);
  const [revenueSizes, setRevenueSizes] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [jobFunctions, setJobFunctions] = useState([]);
  const [leadTypes, setLeadTypes] = useState([]);

  const [error, setError] = useState("");
  const [snapshot, setSnapshot] = useState([]);

  // ✅ NEW: Show GenerateICP Below Snapshot
  const [showResults, setShowResults] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState("");

  // ----------------------------
  // Filters State
  // ----------------------------
  const [filters, setFilters] = useState({
    industries: "",
    brand: "",
    countries: "",
  });

  // ----------------------------
  // API Base URL
  // ----------------------------
  const API_BASE = (
    process.env.REACT_APP_API_DOMAIN || "http://localhost:8000"
  ).replace(/\/$/, "");

  // ----------------------------
  // Endpoints
  // ----------------------------
  const ENDPOINTS = {
    industries: `${API_BASE}/leadscores/filters/industries`,
    countries: `${API_BASE}/leadscores/filters/countries`,
    brands: `${API_BASE}/leadscores/filters/brands`,

    employee_sizes: `${API_BASE}/leadscores/filters/employee_sizes`,
    revenue_sizes: `${API_BASE}/leadscores/filters/revenue_sizes`,
    job_levels: `${API_BASE}/leadscores/filters/job_levels`,
    job_functions: `${API_BASE}/leadscores/filters/job_functions`,
    lead_types: `${API_BASE}/leadscores/filters/lead-types`,
  };

  // ----------------------------
  // Convert API response → dropdown options
  // ----------------------------
  const toOptions = (arr) =>
    Array.isArray(arr)
      ? arr.map((it) => ({
          id: it.id ?? it.value ?? "",
          label: it.label ?? it.name ?? "",
        }))
      : [];

  const fetchJson = async (url) => (await axios.get(url)).data;

  // ----------------------------
  // Load All Dropdown Filters
  // ----------------------------
  const fetchInitialFilters = useCallback(async () => {
    try {
      const [
        industryRes,
        countryRes,
        empRes,
        revRes,
        jlRes,
        jfRes,
        ltRes,
      ] = await Promise.all([
        fetchJson(ENDPOINTS.industries),
        fetchJson(ENDPOINTS.countries),
        fetchJson(ENDPOINTS.employee_sizes),
        fetchJson(ENDPOINTS.revenue_sizes),
        fetchJson(ENDPOINTS.job_levels),
        fetchJson(ENDPOINTS.job_functions),
        fetchJson(ENDPOINTS.lead_types),
      ]);

      setIndustries(toOptions(industryRes.industries || []));
      setCountries(toOptions(countryRes.countries || []));

      setEmployeeSizes(toOptions(empRes.employee_sizes || []));
      setRevenueSizes(toOptions(revRes.revenue_sizes || []));
      setJobLevels(toOptions(jlRes.job_levels || []));
      setJobFunctions(toOptions(jfRes.job_functions || []));
      setLeadTypes(toOptions(ltRes.lead_types || []));
    } catch (e) {
      console.error("Failed to load filters", e);
      setError("Failed to load dropdown filters.");
    }
  }, []);

  useEffect(() => {
    fetchInitialFilters();
  }, [fetchInitialFilters]);

  // ----------------------------
  // Load Brands When Industry Changes
  // ----------------------------
  useEffect(() => {
    if (!filters.industries) {
      setBrands([]);
      return;
    }

    const fetchBrands = async () => {
      try {
        const res = await fetchJson(
          `${ENDPOINTS.brands}?industry_id=${filters.industries}`
        );
        setBrands(toOptions(res.brands || []));
      } catch (e) {
        console.error("Failed to load brands", e);
        setError("Failed to load brands.");
      }
    };

    fetchBrands();
  }, [filters.industries]);

  // ----------------------------
  // Update Filters
  // ----------------------------
  const updateFilter = (key, value) => {
    setFilters((prev) => {
      let updated = { ...prev, [key]: value };

      if (key === "industries") {
        updated.brand = "";
      }

      return updated;
    });
  };

  // ----------------------------
  // Clear Filters + Reset Everything
  // ----------------------------
  const clearFilters = () => {
    setFilters({
      industries: "",
      brand: "",
      countries: "",
    });

    setBrands([]);
    setSnapshot([]);

    //  Hide Results Table
    setShowResults(false);
    setGeneratedQuery("");
  };

  // ----------------------------
  // Create ICP Snapshot
  // ----------------------------
  const handleCreateICP = async () => {
    setSnapshot([]);
    setShowResults(false);

    setLoadingSnapshot(true);

    try {
      const res = await axios.get(
        `${API_BASE}/leadscores/scoring/icp/ideal-snapshot`,
        {
          params: {
            industry_id: filters.industries,
            brand_id: filters.brand,
            country_id: filters.countries,
          },
        }
      );

      setSnapshot(res.data.snapshot || []);
    } catch (e) {
      console.error("Snapshot failed", e);

      toast.error("Not enough data to generate ICP Snapshot.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingSnapshot(false);
    }
  };

  // ----------------------------
  // Show Leads Below Snapshot
  // ----------------------------
  const handleShowLeads = () => {
    if (!snapshot || snapshot.length === 0) return;

    // Build Query Payload
    const filterPayload = {
      country_id: filters.countries,
      industry_id: filters.industries,
    };

    snapshot.forEach((row) => {
      const key = row.parameter.toLowerCase();

      if (key.includes("employee"))
        filterPayload.employee_size_id = row.ideal_value_id;

      if (key.includes("revenue"))
        filterPayload.revenue_size_id = row.ideal_value_id;

      if (key.includes("job level"))
        filterPayload.job_level_id = row.ideal_value_id;

      if (key.includes("job function"))
        filterPayload.job_function_id = row.ideal_value_id;

      if (key.includes("lead type"))
        filterPayload.lead_type_id = row.ideal_value_id;
    });

    // Remove Empty Keys
    Object.keys(filterPayload).forEach((k) => {
      if (!filterPayload[k]) delete filterPayload[k];
    });

    const query = new URLSearchParams(filterPayload).toString();

    // Show Embedded GenerateICP
    setGeneratedQuery(query);
    setShowResults(true);
  };

  // ----------------------------
  // UI Rendering
  // ----------------------------
  return (
    <div className="container-fluid bg-light min-vh-100 py-4 px-md-5 ">
      <h1 className="title-style mt-4">Ideal Customer Profile</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Industry Selection Block */}
      <div className="row justify-content-center ">
        <div className="col-10 pt-4">
          <div
            className={`card border-0 shadow-sm rounded-4 ${
              showResults ? "p-2" : "p-4"
            }`}
          >
            <div className="card-body p-4 border-start border-warning border-4 rounded-4">
              <h6 className="fw-bold text-warning mb-3 ">
                Industry And Brand Selection
              </h6>

              {/* Dropdown Row */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                {/* Industry */}
                <div className="col-md-3">
                  <div><p>Select Industry</p></div>
                  <select
                    className="form-select form-select-sm rounded-4"
                    value={filters.industries}
                    onChange={(e) =>
                      updateFilter("industries", e.target.value)
                    }
                  >
                    <option value="">Select Industry</option>
                    {industries.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div className="col-md-3">
                  <div><p>Select Brand</p></div>
                  <select
                    className="form-select form-select-sm rounded-4"
                    value={filters.brand}
                    disabled={!filters.industries}
                    onChange={(e) => updateFilter("brand", e.target.value)}
                  >
                    <option value="">
                      {filters.industries
                        ? "Select Brand"
                        : "Select Industry First"}
                    </option>

                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className="col-md-3 ">
                  <div><p>Select Country</p></div>
                  <select
                    className="form-select form-select-sm rounded-4"
                    value={filters.countries}
                    onChange={(e) =>
                      updateFilter("countries", e.target.value)
                    }
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompt */}
              <div className="mt-4">
                <PromptBox onSend={handleCreateICP} />
              </div>
                    
              {/* Snapshot Button */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <button
                  className="btn btn-primary fw-bold px-4"
                  onClick={handleCreateICP}
                  disabled={loadingSnapshot}
                >
                  {loadingSnapshot ? (
                    <>
                      <ClipLoader size={18} /> Generating...
                    </>
                  ) : (
                    "ICP Snapshot"
                  )}
                </button>
              {/* </div> */}

              {/* Clear */}
                {/* <div className="col-md-6 mt-3 "> */}
                  <button
                    className="btn btn-outline-danger btn-sm px-5"
                    onClick={clearFilters}
                  >
                    Reset
                  </button>
                </div>

              

              {/* Snapshot Display */}
              {snapshot.length > 0 && (
                <div className="mt-4">
                  <h5 className="fw-bold">Ideal ICP Snapshot</h5>

                  <div className="row">
                    {snapshot.map((s, idx) => (
                      <div key={idx} className="col-md-4 mt-3">
                        <div className="card shadow-sm rounded-4 p-3 border-warning">
                          <h6 className="text-muted">{s.parameter}</h6>
                          <h5 className="fw-bold">{s.ideal_value}</h5>
                          <small>Frequency: {s.frequency}</small>
                          <small>Total: {s.total_leads}</small>
                          <small>Percentage: {s.percentage}</small>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show Leads Button */}
                  <div className="mt-4">
                    <button
                      className="btn btn-success fw-bold px-4"
                      onClick={handleShowLeads}
                    >
                      Show Leads for ICP
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Embedded GenerateICP Table Below Snapshot */}
          {showResults && (
            <div className="mt-5">
              <GenerateICP embeddedQuery={generatedQuery} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
