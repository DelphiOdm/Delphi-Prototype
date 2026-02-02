// frontend/src/components/ICP/GenerateICP.js
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import ICPMainGride from "./ICPMainGride";

export default function LeadScoring() {
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [jobFunctions, setJobFunctions] = useState([]);
  const [employeeSizes, setEmployeeSizes] = useState([]);
  const [revenueSizes, setRevenueSizes] = useState([]);
  const [qaStatuses, setQaStatuses] = useState([]);
  const [leadTypes, setLeadTypes] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [icpResult, setIcpResult] = useState([]);
  const [showTable, setShowTable] = useState(false);

  const [filters, setFilters] = useState({
    campaign_id: "",
    country: "",
    industry: "",
    job_level: "",
    job_function: "",
    employee_size: "",
    revenue_size: "",
    qa_status: "",
    lead_type: "",
    lead_source: "",
    campaign_suppression: "all",
    tal_suppression: "all",
    start_date: "",
    end_date: "",
    limit: 1000
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState(10);

  const isCampaignSelected = Boolean(filters.campaign_id);

  const API_BASE = (process.env.REACT_APP_API_DOMAIN || "").replace(/\/$/, "");

  const ENDPOINTS = {
    industries: `${API_BASE}/leadscores/filters/industries`,
    countries: `${API_BASE}/leadscores/filters/countries`,
    job_levels: `${API_BASE}/leadscores/filters/job_levels`,
    job_functions: `${API_BASE}/leadscores/filters/job_functions`,
    employee_sizes: `${API_BASE}/leadscores/filters/employee_sizes`,
    revenue_sizes: `${API_BASE}/leadscores/filters/revenue_sizes`,
    qa_statuses: `${API_BASE}/leadscores/filters/qa-statuses`,
    lead_types: `${API_BASE}/leadscores/filters/lead-types`,
    lead_sources: `${API_BASE}/leadscores/filters/lead-sources`,
    campaignLeads: `${API_BASE}/leadscores/leads/campaign-leads`,
  };

  const toOptions = (arr, idKey = "id", labelKey = "label") =>
    Array.isArray(arr)
      ? arr.map(it => ({
          id: it[idKey] ?? it.id ?? it.value ?? "",
          label: it[labelKey] ?? it.label ?? it.name ?? ""
        }))
      : [];

  const fetchJson = async url => (await axios.get(url)).data;

  const fetchAllFilters = useCallback(async () => {
    try {
      const [
        i, c, jl, jf, es, rs, qa, lt, ls
      ] = await Promise.all([
        fetchJson(ENDPOINTS.industries),
        fetchJson(ENDPOINTS.countries),
        fetchJson(ENDPOINTS.job_levels),
        fetchJson(ENDPOINTS.job_functions),
        fetchJson(ENDPOINTS.employee_sizes),
        fetchJson(ENDPOINTS.revenue_sizes),
        fetchJson(ENDPOINTS.qa_statuses),
        fetchJson(ENDPOINTS.lead_types),
        fetchJson(ENDPOINTS.lead_sources)
      ]);

      setIndustries(toOptions(i.industries || []));
      setCountries(toOptions(c.countries || []));
      setJobLevels(toOptions(jl.job_levels || []));
      setJobFunctions(toOptions(jf.job_functions || []));
      setEmployeeSizes(toOptions(es.employee_sizes || []));
      setRevenueSizes(toOptions(rs.revenue_sizes || []));
      setQaStatuses(toOptions(qa.qa_statuses || []));
      setLeadTypes(toOptions(lt.lead_types || []));
      setLeadSources(toOptions(ls.lead_sources || []));
    } catch (e) {
      console.error("Filter Fetch Error", e);
    }
  }, []);

  const runICP = async () => {
  setLoading(true);
  const res = await axios.post(`${API_BASE}/leadscores/generate-tal-demo`);
  setIcpResult(res.data.data);
  setShowTable(true);     // show table
  setLoading(false);
};

//   const runScoring = useCallback(async () => {
//     setError("");
//     setLoading(true);
//     try {
//       const params = { page: 1 };
//       if (pageSize !== "ALL") params.page_size = pageSize;

//       params.country_id = filters.country || null;
//       params.industry_id = filters.industry || null;
//       params.job_level_id = filters.job_level || null;
//       params.job_function_id = filters.job_function || null;
//       params.employee_size_id = filters.employee_size || null;
//       params.revenue_size_id = filters.revenue_size || null;
//       params.qa_status = filters.qa_status || null;
//       params.lead_type_id = filters.lead_type || null;
//       params.lead_source = filters.lead_source || null;
//       params.suppression = filters.tal_suppression;
//       params.start_date = filters.start_date || null;
//       params.end_date = filters.end_date || null;

//       const res = await axios.get(ENDPOINTS.campaignLeads, { params });
//       setResults(res.data.leads || []);
//     } catch {
//       setError("Failed to fetch leads");
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, pageSize]);

  useEffect(() => {
  fetchAllFilters();
}, []);   // run once only on mount

// useEffect(() => {
// //   runScoring();
//   runICP();
// }, []); 


  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      campaign_id: "",
      country: "",
      industry: "",
      job_level: "",
      job_function: "",
      employee_size: "",
      revenue_size: "",
      campaign_suppression: "all",
      tal_suppression: "all",
      qa_status: "",
      start_date: "",
      end_date: "",
      limit: 100,
      lead_type: "",
      lead_source: ""
    });
    // setResults([]);
    setIcpResult([]);
    setShowTable(false);    // hide table
    setError("");
  };

  

  return (
    <div className="container-fluid bg-light min-vh-100 py-4 px-md-5">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h3 className="fw-bold text-dark mb-1">Ideal Customer Profile</h3>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={runICP} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
            {loading ? "Loading..." : "Create ICP"}
          </button>
          <button className="btn btn-danger text-white btn-outline-secondary px-4 shadow-sm" onClick={()=>{clearFilters();}}>Reset</button>
        </div>
      </div>

      {error && <div className="alert alert-danger shadow-sm border-0 mb-4">{error}</div>}



        {/* ================= SECTION 2: •	ICP Dimensions  ================= */}
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 border-start border-warning border-4 rounded-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-warning mb-0">ICP Dimensions</h6>
                
              </div>

              <div className="row g-3">
                {/* Firmographics */}
                <div className="col-12"><small className="text-uppercase fw-bold text-muted letter-spacing-1">Firmographics</small></div>
                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.country} onChange={(e) => updateFilter("country", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Country</option>
                    {countries.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>

                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.industry} onChange={(e) => updateFilter("industry", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Industry</option>
                    {industries.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                  </select>
                </div>

                {/* Company Size */}
                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.employee_size} onChange={(e) => updateFilter("employee_size", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Employee Size</option>
                    {employeeSizes.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}
                  </select>
                </div>
                
                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.revenue_size} onChange={(e) => updateFilter("revenue_size", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Revenue Size</option>
                    {revenueSizes.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}
                  </select>
                </div>
                {/* Demographic */}
                <div className="col-12"><small className="text-uppercase fw-bold text-muted letter-spacing-1">Demographic / Channel / Intent</small></div>
                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.job_level} onChange={(e) => updateFilter("job_level", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Job Level</option>
                    {jobLevels.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}
                  </select>
                </div>

                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.job_function} onChange={(e) => updateFilter("job_function", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Job Function</option>
                    {jobFunctions.map(j => <option key={j.id} value={j.id}>{j.label}</option>)}
                  </select>
                </div>

                {/* Lead Source */}
              <div className="col-md-3">
                <select className="form-select form-select-sm" value={filters.lead_source} onChange={e => updateFilter("lead_source", e.target.value)} disabled={isCampaignSelected}>
                  <option value="">Lead Source</option>
                  {leadSources.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>

                {/* Intent */}
                <div className="col-md-3">
                  <select className="form-select form-select-sm" value={filters.qa_status} onChange={e => updateFilter("qa_status", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">QA Status</option>
                    {qaStatuses.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
                  </select>
                </div>


                {/* Behavioral */}
                <div className="col-12"><small className="text-uppercase fw-bold text-muted letter-spacing-1">Behavioral </small></div>
                
                <div className="col-md-3">
                  <select
                    className="form-select form-select-sm"
                    value={filters.tal_suppression}
                    onChange={(e) => updateFilter("tal_suppression", e.target.value)}
                    disabled={isCampaignSelected}
                  >
                    <option value="all">All Leads</option>
                    <option value="suppressed">Supression Leads</option>
                    <option value="not_suppressed">Not Supression Leads</option>
                  </select>
                </div>

                  {/* Lead Type */}
                <div className="col-md-3">
                    <select className="form-select form-select-sm" value={filters.lead_type} onChange={e => updateFilter("lead_type", e.target.value)} disabled={isCampaignSelected}>
                    <option value="">Lead Type</option>
                    {leadTypes.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                </div>

                <div className="col-md-3">
                  <input
                    type={filters.start_date ? "date" : "text"} // Switch to date if a value exists
                    className="form-control form-control-sm"
                    value={filters.start_date}
                    placeholder="Start Date"
                    onFocus={(e) => (e.target.type = "date")} // Switch to date on click
                    onBlur={(e) => !filters.start_date && (e.target.type = "text")} // Switch back to text if empty
                    onChange={(e) => updateFilter("start_date", e.target.value)}
                    disabled={isCampaignSelected}
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type={filters.end_date ? "date" : "text"}
                    className="form-control form-control-sm"
                    value={filters.end_date}
                    placeholder="End Date"
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => !filters.end_date && (e.target.type = "text")}
                    onChange={(e) => updateFilter("end_date", e.target.value)}
                    disabled={isCampaignSelected}
                  />
                </div>

              
            </div>
          </div>
        </div>
      </div>

      {/* Results Table Section */}
      <div className="mt-5">
        <div className="d-flex justify-content-between align-items-end mb-3">
          <h5 className="fw-bold mb-0">Master Grid View (Demo Purpose)</h5>
          {/* <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Show</span>
            <select className="form-select form-select-sm w-auto" value={pageSize} onChange={(e) => setPageSize(e.target.value === "ALL" ? "ALL" : parseInt(e.target.value))}>
              <option value={10}>10</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
          </div> */}
        </div>
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          {showTable && (
            <ICPMainGride data={icpResult} />
          )}

        </div>
        <h5 className="fw-bold mb-0">Work In Progress.....</h5>
      </div>
    </div>
  );
}