// // src/components/LeadScoring.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import TopLeadsTable from "./TopLeadsTable";

export default function LeadScoring() {
  const [campaigns, setCampaigns] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [countries, setCountries] = useState([]);
 // const [jobTitles, setJobTitles] = useState([]);
  const [jobLevels, setJobLevels] = useState([]);
  const [jobFunctions, setJobFunctions] = useState([]);
  const [employeeSizes, setEmployeeSizes] = useState([]);
  const [revenueSizes, setRevenueSizes] = useState([]);

  // FINAL FILTER LIST
  const [filters, setFilters] = useState({
    campaign_id: "",
    country: "",
    industry: "",
    //job_title: "",
    job_level: "",
    job_function: "",
    employee_size: "",
    revenue_size: "",
    start_date: "",
    end_date: "",
    limit: 100
  });

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [runInfo, setRunInfo] = useState(null);
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState(30); // ✅ Added missing state

  /* ===================== NEW FLAGS ===================== */
  const isCampaignSelected = Boolean(filters.campaign_id);

  const isAnyOtherFilterSelected = Boolean(
    filters.country ||
    filters.industry ||
    //filters.job_title ||
    filters.job_level ||
    filters.job_function ||
    filters.employee_size ||
    filters.revenue_size ||
    filters.start_date ||
    filters.end_date
  );
  /* ===================================================== */
  // API base — must be provided in .env as REACT_APP_API_DOMAIN (example: http://localhost:8000)
  const API_BASE = (process.env.REACT_APP_API_DOMAIN || "").replace(/\/$/, "");

  if (!API_BASE) {
    console.warn("REACT_APP_API_DOMAIN not set — LeadScoring requires backend API URL.");
  }

  // Backend endpoints (no mocks)
  const ENDPOINTS = {
    campaigns: `${API_BASE}/leadscores/filters/campaigns`,
    industries: `${API_BASE}/leadscores/filters/industries`,
    countries: `${API_BASE}/leadscores/filters/countries`,
    //job_titles: `${API_BASE}/leadscores/filters/job_titles`,
    job_levels: `${API_BASE}/leadscores/filters/job_levels`,
    job_functions: `${API_BASE}/leadscores/filters/job_functions`,
    employee_sizes: `${API_BASE}/leadscores/filters/employee_sizes`,
    revenue_sizes: `${API_BASE}/leadscores/filters/revenue_sizes`,
    campaignLeads: `${API_BASE}/leadscores/leads/campaign-leads`,
    score: `${API_BASE}/leadscores/score`
  };

  /* ====== Fetch reference data ====== */
  useEffect(() => {
    if (results.length > 0) {
    runScoring();
  }
    // run all fetches in parallel
    fetchAllFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const fetchAllFilters = async () => {
    try {
      await Promise.all([
        fetchCampaigns(),
        fetchIndustries(),
        fetchCountries(),
        //fetchJobTitles(),
        fetchJobLevels(),
        fetchJobFunctions(),
        fetchEmployeeSizes(),
        fetchRevenueSizes()
      ]);
    } catch (e) {
      // individual functions set their own errors/logs
      console.error("fetchAllFilters error", e);
    }
  };

  /* ====== Helper utilities ====== */
  const safeGet = (obj, key, fallback = []) => {
    try {
      if (!obj) return fallback;
      return obj[key] ?? fallback;
    } catch {
      return fallback;
    }
  };

  const toOptions = (arr, idKey = "id", labelKey = "label") => {
    if (!Array.isArray(arr)) return [];
    return arr.map((it) => ({
      id: it[idKey] ?? it.id ?? it.value ?? "",
      label: it[labelKey] ?? it.label ?? it.name ?? String(it[idKey] ?? it.id ?? "")
    }));
  };

  const fetchJson = async (url) => {
    if (!API_BASE) throw new Error("API base URL not configured (REACT_APP_API_DOMAIN)");
    const res = await axios.get(url);
    return res.data;
  };

  /* ====== Individual fetchers ====== */
  const fetchCampaigns = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.campaigns);
      // expect backend shape: { campaigns: [ { Order_key_id, Campaign_name, ... } ] }
      const raw = safeGet(data, "campaigns", []);
      // normalize: use Order_key_id / Campaign_name if present
      const opts = toOptions(
        raw,
        raw && raw.length && raw[0].Order_key_id !== undefined ? "Order_key_id" : "id",
        raw && raw.length && raw[0].Campaign_name !== undefined ? "Campaign_name" : "label"
      );
      setCampaigns(opts);
    } catch (err) {
      console.error("fetchCampaigns failed:", err);
      setCampaigns([]);
    }
  };

  const fetchIndustries = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.industries);
      const raw = safeGet(data, "industries", []);
      setIndustries(toOptions(raw));
    } catch (err) {
      console.error("fetchIndustries failed:", err);
      setIndustries([]);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.countries);
      const raw = safeGet(data, "countries", []);
      setCountries(toOptions(raw));
    } catch (err) {
      console.error("fetchCountries failed:", err);
      setCountries([]);
    }
  };

  // const fetchJobTitles = async () => {
  //   try {
  //     const data = await fetchJson(ENDPOINTS.job_titles);
  //     // accept either job_titles or jobTitles key
  //     const raw = safeGet(data, "job_titles", safeGet(data, "jobTitles", []));
  //     setJobTitles(toOptions(raw));
  //   } catch (err) {
  //     console.error("fetchJobTitles failed:", err);
  //     setJobTitles([]);
  //   }
  // };

  const fetchJobLevels = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.job_levels);
      const raw = safeGet(data, "job_levels", []);
      setJobLevels(toOptions(raw));
    } catch (err) {
      console.error("fetchJobLevels failed:", err);
      setJobLevels([]);
    }
  };

  const fetchJobFunctions = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.job_functions);
      const raw = safeGet(data, "job_functions", []);
      setJobFunctions(toOptions(raw));
    } catch (err) {
      console.error("fetchJobFunctions failed:", err);
      setJobFunctions([]);
    }
  };

  const fetchEmployeeSizes = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.employee_sizes);
      const raw = safeGet(data, "employee_sizes", []);
      setEmployeeSizes(toOptions(raw));
    } catch (err) {
      console.error("fetchEmployeeSizes failed:", err);
      setEmployeeSizes([]);
    }
  };

  const fetchRevenueSizes = async () => {
    try {
      const data = await fetchJson(ENDPOINTS.revenue_sizes);
      const raw = safeGet(data, "revenue_sizes", []);
      setRevenueSizes(toOptions(raw));
    } catch (err) {
      console.error("fetchRevenueSizes failed:", err);
      setRevenueSizes([]);
    }
  };

  /* ====== Filter update ====== */
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      campaign_id: "",
      country: "",
      industry: "",
      //job_title: "",
      job_level: "",
      job_function: "",
      employee_size: "",
      revenue_size: "",
      start_date: "",
      end_date: "",
      limit: 100
    });
    setResults([]);
    setRunInfo(null);
    setError("");
    setPageSize(30); // Reset pagination
  };

 /* ===================== MAIN LOGIC ===================== */
  const runScoring = async () => {
  setError("");
  setLoading(true);
  setResults([]);
  setRunInfo(null);

  try {
    const params = {
      page: 1,
      page_size: pageSize === "ALL" ? 10000 : pageSize
    };

    /* ================= CAMPAIGN FLOW ================= */
    if (filters.campaign_id) {
      params.order_id = filters.campaign_id;
    }

    /* ================= FILTER FLOW ================= */
    else {
      params.country_id = filters.country || null;
      params.industry_id = filters.industry || null;
      //params.job_title = filters.job_title || null;
      params.job_level_id = filters.job_level || null;
      params.job_function_id = filters.job_function || null;
      params.employee_size_id = filters.employee_size || null;
      params.revenue_size_id = filters.revenue_size || null;
      params.start_date = filters.start_date || null;
      params.end_date = filters.end_date || null;
    }

    const res = await axios.get(ENDPOINTS.campaignLeads, { params });

    setResults(res.data.leads || []);
    setRunInfo({
      total: res.data.total,
      total_pages: res.data.total_pages
    });

  } catch (err) {
    console.error(err);
    setError("Failed to fetch leads");
  } finally {
    setLoading(false);
  }
};

  /* ===================================================== */
  return (
    <div className="container-fluid bg-light g-0 vh-100 pt-4">
      <div className="card mb-3 container">
        <div className="card-body">
          <h4 className="card-title mb-3">Lead Scoring - Filters</h4>

          <div className="row g-3">

            {/* Campaign */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Campaign</label>
              <select className="form-select"
                value={filters.campaign_id}
                onChange={(e) => updateFilter("campaign_id", e.target.value)} disabled={isAnyOtherFilterSelected}
              >
                <option value="">All Campaigns</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Country */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Country</label>
              <select className="form-select"
                value={filters.country}
                onChange={(e) => updateFilter("country", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Countries</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Industry</label>
              <select className="form-select"
                value={filters.industry}
                onChange={(e) => updateFilter("industry", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Industries</option>
                {industries.map(i => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </div>

            {/* Job Title */}
            {/* <div className="col-md-3">
              <label className="form-label small text-secondary">Job Title</label>
              <select className="form-select"
                value={filters.job_title}
                onChange={(e) => updateFilter("job_title", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Job Titles</option>
                {jobTitles.map(j => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            </div> */}

            {/* Job Level */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Job Level</label>
              <select className="form-select"
                value={filters.job_level}
                onChange={(e) => updateFilter("job_level", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Levels</option>
                {jobLevels.map(j => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            </div>

            {/* Job Function */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Job Function</label>
              <select className="form-select"
                value={filters.job_function}
                onChange={(e) => updateFilter("job_function", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Functions</option>
                {jobFunctions.map(j => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            </div>

            {/* Employee Size */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Employee Size</label>
              <select className="form-select"
                value={filters.employee_size}
                onChange={(e) => updateFilter("employee_size", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Sizes</option>
                {employeeSizes.map(j => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            </div>

            {/* Revenue Size */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Revenue Size</label>
              <select className="form-select"
                value={filters.revenue_size}
                onChange={(e) => updateFilter("revenue_size", e.target.value)} disabled={isCampaignSelected}
              >
                <option value="">All Sizes</option>
                {revenueSizes.map(j => (
                  <option key={j.id} value={j.id}>{j.label}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">Start Date</label>
              <input type="date" className="form-control"
                value={filters.start_date}
                onChange={(e) => updateFilter("start_date", e.target.value)} disabled={isCampaignSelected}
              />
            </div>

            {/* End Date */}
            <div className="col-md-3">
              <label className="form-label small text-secondary">End Date</label>
              <input type="date" className="form-control"
                value={filters.end_date}
                onChange={(e) => updateFilter("end_date", e.target.value)} disabled={isCampaignSelected}
              />
            </div>

            {/* Buttons */}
            <div className="col-md-3 d-flex align-items-end">
              <button className="btn btn-primary me-2" onClick={runScoring}
                disabled={loading}
              >
                {loading ? "Running..." : "Score Leads"}
              </button>

              <button className="btn btn-secondary" onClick={clearFilters} disabled={loading}>
                Reset
              </button>
            </div>
                
          </div>
                
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          {/* run info (optional) */}
          {runInfo && runInfo.run_id && (
            <div className="text-muted small mt-2">Run ID: {runInfo.run_id}</div>
          )}

          
        </div>
        
      </div>

      {/* ===== Pagination Selector ===== */}
      {results.length > 0 && (
        <div className="container mb-2 d-flex justify-content-between align-items-center">
          <div className="text-muted">
            
            
          </div>
          <div className="d-flex align-items-center">
            <label className="me-2 small text-muted">Show per page:</label>
            <select
              className="form-select form-select-sm w-auto"
              value={pageSize}
              onChange={(e) =>
                setPageSize(
                  e.target.value === "ALL"
                    ? "ALL"
                    : parseInt(e.target.value)
                )
              }
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="container">
        <TopLeadsTable 
          leads={results} 
          loading={loading}
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}

