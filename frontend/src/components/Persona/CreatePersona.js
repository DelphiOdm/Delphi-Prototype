// frontend/src/components/Persona/persona.js
import React,{useEffect, useState} from "react";
import axios from "axios";
export default function Persona(){
    const [industries, setIndustries] = useState([]);
    const [countries, setCountries] = useState([]);
    const [jobLevels, setJobLevels] = useState([]);
    const [jobTitle, setJobTitle] = useState([]);
    const [jobFunctions, setJobFunctions] = useState([]);
    const [experience, setExperience] = useState([]);
    const [callEngagements, setCallEngagements] = useState([]);
    const [callRatings, setCallRatings] = useState([]);
    const [callStatuses, setCallStatuses] = useState([]);
    const [filters, setFilters] = useState({
    campaign_id: "",
    country: "",
    industry: "",
    job_level: "",
    job_titles: "",
    job_function: "",
    experience: "",
    call_engagement: "",
    call_rating: "",
    call_status: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [runInfo, setRunInfo] = useState(null);
  const [error, setError] = useState("");
  const [pageSize, setPageSize] = useState(100);
  const API_BASE = (process.env.REACT_APP_API_DOMAIN || "").replace(/\/$/, "");
  const ENDPOINTS = {
    campaigns:`${API_BASE}/leadscores/filters/campaigns`,
    industries:`${API_BASE}/leadscores/filters/industries`,
    countries:`${API_BASE}/leadscores/filters/countries`,
    job_levels:`${API_BASE}/leadscores/filters/job_levels`,
    job_titles:`${API_BASE}/leadscores/filters/job_titles`,
    job_functions:`${API_BASE}/leadscores/filters/job_functions`,
    experience:`${API_BASE}/leadscores/filters/experience`,
    call_engagement:`${API_BASE}/leadscores/filters/call-engagement`,
    call_rating:`${API_BASE}/leadscores/filters/call-rating`,
    call_status:`${API_BASE}/leadscores/filters/call-status`,
  };
//   const isAnyFilterSelected = Object.values(filters).some(v => v !== "" && v !== null);

  useEffect(() => {
  defaultScoring();
  fetchAllFilters();
  // eslint-disable-next-line
    }, [pageSize]);


  const fetchAllFilters = async () => {
    try {
      await Promise.all([
        fetchIndustries(),
        fetchCountries(),
        fetchJobLevels(),
        fetchJobTitle(),
        fetchJobFunctions(),
        fetchExperience(),
        fetchCallEngagements(),
        fetchCallRatings(),
        fetchCallStatuses()
      ]);
    } catch (e) { console.error("Filter Fetch Error", e); }
   };

  const toOptions = (arr, idKey = "id", labelKey = "label") => {
    if (!Array.isArray(arr)) return [];
    return arr.map((it) => ({
      id: it[idKey] ?? it.id ?? it.value ?? "",
      label: it[labelKey] ?? it.label ?? it.name ?? String(it[idKey] ?? it.id ?? "")
    }));
  };

  const fetchJson = async (url) => {
    const res = await axios.get(url);
    return res.data;
  };
  const fetchIndustries = async () => {
    const data = await fetchJson(ENDPOINTS.industries);
    setIndustries(toOptions(data.industries || []));
  };
  const fetchCountries = async () => {
    const data = await fetchJson(ENDPOINTS.countries);
    setCountries(toOptions(data.countries || []));
  };
  const fetchJobLevels = async () => {
    const data = await fetchJson(ENDPOINTS.job_levels);
    setJobLevels(toOptions(data.job_levels || []));
  };
  const fetchJobFunctions = async () => {
    const data = await fetchJson(ENDPOINTS.job_functions);
    setJobFunctions(toOptions(data.job_functions || []));
  };
  const fetchJobTitle = async () => {
    const data = await fetchJson(ENDPOINTS.job_titles);
    setJobTitle(toOptions(data.job_titles || []));
  };
  const fetchExperience = async () => {
  const res = await fetchJson(ENDPOINTS.experience);
  setExperience(toOptions(res.data || []));
};

    const fetchCallEngagements = async () => {
  const res = await fetchJson(ENDPOINTS.call_engagement);
  setCallEngagements(toOptions(res.data || []));
};

const fetchCallRatings = async () => {
  const res = await fetchJson(ENDPOINTS.call_rating);
  setCallRatings(toOptions(res.data || []));
};

const fetchCallStatuses = async () => {
  const res = await fetchJson(ENDPOINTS.call_status);
  setCallStatuses(toOptions(res.data || []));
};
  

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      campaign_id: "", country: "", industry: "", job_level: "",
      job_function: "", experience: "", call_engagement: "", call_rating: "", call_status: "", start_date: "", end_date: "", limit: 100
    });
    setResults([]);
    setRunInfo(null);
    setError("");
  };

  const runScoring = async () => {
    // setError("");
    // setLoading(true);
    // try {
    //   const params = { page: 1 };
    //     params.country_id = filters.country || null;
    //     params.industry_id = filters.industry || null;
    //     params.job_level_id = filters.job_level || null;
    //     params.job_function_id = filters.job_function || null;
    //     params.experience_id = filters.experience || null;
    //     params.call_engagement_id = filters.call_engagement || null;
    //     params.call_rating_id = filters.call_rating || null;
    //     params.call_status_id = filters.call_status || null;
    //     params.start_date = filters.start_date || null;
    //     params.end_date = filters.end_date || null;
      

    //   const res = await axios.get(ENDPOINTS.campaignLeads, { params });
    //   setResults(res.data.leads || []);
    //   setRunInfo({ total: res.data.total, total_pages: res.data.total_pages });
    // } catch (err) {
    //   setError("Failed to fetch leads");
    // } finally {
    //   setLoading(false);
    // }
  };

  const defaultScoring = async () => {
    // setError("");
    // setLoading(true);
    // try {
    //   const params = { page: 1 };

    //   if (pageSize !== "ALL") {
    //     params.page_size = pageSize;
    //   }
    //     params.country_id = filters.country || null;
    //     params.industry_id = filters.industry || null;
    //     params.job_level_id = filters.job_level || null;
    //     params.job_function_id = filters.job_function || null;
    //     params.experience = filters.experience || null;
    //     params.call_engagement = filters.call_engagement || null;
    //     params.call_rating = filters.call_rating || null;
    //     params.call_status = filters.call_status || null;
    //     params.start_date = filters.start_date || null;
    //     params.end_date = filters.end_date || null;
     
    //   const res = await axios.get(ENDPOINTS.campaignLeads, { params });
    //   setResults(res.data.leads || []);
    //   setRunInfo({ total: res.data.total, total_pages: res.data.total_pages });
    // } catch (err) {
    //   setError("Failed to fetch leads");
    // } finally {
    //   setLoading(false);
    // }
  };

    return (
  <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div >
        <h6 className="title-style ">
          Uncover Personas
        </h6>
      </div>

      
    </div>

    {error && (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl shadow-sm">
        {error}
      </div>
    )}

    {/* Card */}
    <div className="max-w-7xl mx-auto ">
      <div className="bg-white rounded-2xl shadow-xl border-3 border-red-500 p-8">

        <h3 className="text-lg font-semibold text-red-600 mb-6 border-l-4 border-red-500 pl-3">
          Persona Filters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Country
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.country}
              onChange={(e) => updateFilter("country", e.target.value)}
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Industry
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.industry}
              onChange={(e) => updateFilter("industry", e.target.value)}
            >
              <option value="">Select Industry</option>
              {industries.map(i => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>

          {/* Job Level */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Job Level
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.job_level}
              onChange={(e) => updateFilter("job_level", e.target.value)}
            >
              <option value="">Select Job Level</option>
              {jobLevels.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Job function */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Job Function
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.job_function}
              onChange={(e) => updateFilter("job_function", e.target.value)}
            >
              <option value="">Select Job Function</option>
              {jobFunctions.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Job Title
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.job_titles}
              onChange={(e) => updateFilter("job_titles", e.target.value)}
            >
              <option value="">Select Job Title</option>
              {jobTitle.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Years of Experience
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.experience}
              onChange={(e) => updateFilter("experience", e.target.value)}
            >
              <option value="">Select Experience</option>
              {experience.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Call Engagement */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Call Engagement
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.call_engagement}
              onChange={(e) => updateFilter("call_engagement", e.target.value)}
            >
              <option value="">Select Engagement</option>
              {callEngagements.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Call Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Call Rating
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.call_rating}
              onChange={(e) => updateFilter("call_rating", e.target.value)}
            >
              <option value="">Select Rating</option>
              {callRatings.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Call Status */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Call Status
            </label>
            <select
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.call_status}
              onChange={(e) => updateFilter("call_status", e.target.value)}
            >
              <option value="">Select Status</option>
              {callStatuses.map(j => (
                <option key={j.id} value={j.id}>{j.label}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.start_date}
              onChange={(e) => updateFilter("start_date", e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-red-400 shadow-sm"
              value={filters.end_date}
              onChange={(e) => updateFilter("end_date", e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-3 mt-4 md:mt-0">
        <button
          onClick={runScoring}
          disabled={loading}
          className="px-5 py-2.5 bg-blue-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-60"
        >
          {loading ? "Processing..." : "Create Persona"}
        </button>

        <button
          onClick={() => {
            clearFilters();
            defaultScoring();
          }}
          className="px-5 py-2.5 bg-white border-1 border-red-500 hover:bg-gray-100 text-red-500 font-medium rounded-xl shadow-sm transition-all"
        >
          Reset
        </button>
      </div>
    </div>
  </div>
);
}