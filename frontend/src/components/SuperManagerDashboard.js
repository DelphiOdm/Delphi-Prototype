// src/SuperAdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

export default function SuperAdminDashboard() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [period, setPeriod] = useState("Monthly");
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [allCampaigns, setCampaigns] = useState([]);
    const [filterType, setFilterType] = useState("dateRange"); // default to dateRange
    const navigate = useNavigate();

    const fetchCampaignList = async (startDate = null, endDate = null) => {
        try {
            const response = await axios.get("http://172.16.60.17:8000/get_all_campaigns", {
                params: {
                    start_date: startDate,
                    end_date: endDate,
                },
            });
            const campaigns = Array.isArray(response.data.campaigns)
                ? response.data.campaigns
                : [];



            setCampaigns(campaigns); // Adjust the state name if needed
            console.log("Fetched Campaigns:", campaigns);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const handleApplyFilters = () => {
        // If "Date Range" radio is selected
        if (filterType === "dateRange") {
            if (!startDate || !endDate) {
                alert("Please select both Start Date and End Date.");
                return;
            }
            // Pass formatted dates to fetch function
            fetchCampaignList(startDate, endDate);
        }

        // If "Period" radio is selected
        else if (filterType === "period") {
            if (!period) {
                alert("Please select a Period Type (Monthly or Yearly).");
                return;
            }

            // If Monthly
            if (period === "Monthly") {
                if (!selectedMonth || !selectedYear) {
                    alert("Please select both Month and Year.");
                    return;
                }

                const month = parseInt(selectedMonth); // 1–12
                const year = parseInt(selectedYear);
                const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;

                // Last day of selected month
                const end = new Date(year, month, 0);
                const endDate = `${year}-${month.toString().padStart(2, "0")}-${end.getDate()}`;

                fetchCampaignList(startDate, endDate); // Keep format as YYYY-MM-DD for backend
            }

            // If Yearly
            else if (period === "Yearly") {
                if (!selectedYear) {
                    alert("Please select a Year.");
                    return;
                }

                const year = parseInt(selectedYear);
                const startDate = `${year}-01-01`;
                const endDate = `${year}-12-31`;

                fetchCampaignList(startDate, endDate); // YYYY-MM-DD
            }
        }
    };

    const handleClearFilters = () => {
        setStartDate("");
        setEndDate("");
        setSelectedMonth("");
        setSelectedYear("");
        setPeriod("");
        setFilterType("dateRange"); // or keep current if you don’t want to reset radio
        fetchCampaignList();
    };

    useEffect(() => {
        fetchCampaignList();
    }, []);

    return (
        <div className="container-fluid bg-light g-0 vh-500 pt-4">
            {/* Header */}
            {/* <div className="container-fluid bg-white p-3 rounded-3 shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3 container">
                    <div>
                        <h2 className="fw-bold mb-1">Super Admin Dashboard</h2>
                        <div className="text-secondary">Welcome back, Super Admin</div>
                    </div>
                    <div className="d-flex gap-2">
                        <button onClick={logout} className="btn btn-light border d-flex align-items-center gap-1">
                            <span className="bi bi-box-arrow-right"></span> Logout
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Filter Card */}
            <div className="card mb-3 container">
                <div className="card-body">
                    <h4 className="card-title d-flex align-items-center gap-2 mb-3">
                        <span className="bi bi-funnel"></span> Campaign Filters
                    </h4>

                    <div className="row g-3 align-items-end">
                        {/* Column 1 - Filter Type */}
                        <div className="col-md-3">
                            <label className="orm-label small text-secondary pb-2 d-block">
                                Filter Type:
                            </label>
                            <div className="form-check mb-2">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="filterType"
                                    id="dateRange"
                                    value="dateRange"
                                    checked={filterType === "dateRange"}
                                    onChange={(e) => setFilterType(e.target.value)}
                                />
                                <label className="form-check-label" htmlFor="dateRange">
                                    Date Range
                                </label>
                            </div>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="filterType"
                                    id="period"
                                    value="period"
                                    checked={filterType === "period"}
                                    onChange={(e) => setFilterType(e.target.value)}
                                />
                                <label className="form-check-label" htmlFor="period">
                                    Period (Monthly/Yearly)
                                </label>
                            </div>
                        </div>

                        {/* Column 2 - Filters */}
                        <div className="col-md-6">
                            <div className="row g-3">
                                {filterType === "dateRange" && (
                                    <>
                                        {/* Start Date */}
                                        <div className="col-md-6">
                                            <label className="form-label small text-secondary">Start Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div className="col-md-6">
                                            <label className="form-label small text-secondary">End Date</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {filterType === "period" && (
                                    <>
                                        {/* Period Type */}
                                        <div className="col-md-4">
                                            <label className="form-label small text-secondary">Period Type</label>
                                            <select
                                                className="form-select"
                                                value={period}
                                                onChange={(e) => setPeriod(e.target.value)}
                                            >
                                                <option value="">Select Period</option>
                                                <option value="Monthly">Monthly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>

                                        {/* Month (if Monthly selected) */}
                                        {period === "Monthly" && (
                                            <div className="col-md-4">
                                                <label className="form-label small text-secondary">Month</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedMonth}
                                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                                >
                                                    <option value="">All Months</option>
                                                    {months.map((month, index) => (
                                                        <option key={index + 1} value={index + 1}>
                                                            {month}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Year Dropdown */}
                                        {(period === "Monthly" || period === "Yearly") && (
                                            <div className="col-md-4">
                                                <label className="form-label small text-secondary">Year</label>
                                                <select
                                                    className="form-select"
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                >
                                                    <option value="">All Years</option>
                                                    {years.map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Column 3 - Buttons (always aligned end) */}
                        <div className="col-md-3 d-flex justify-content-end">
                            <div>
                                <button
                                    className="btn bg_nevy_blue text-white me-2"
                                    onClick={handleApplyFilters}
                                >
                                    Apply Filters
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={handleClearFilters}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Campaigns */}
            <div className="card container">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <h4 className="mb-2">Campaigns ({allCampaigns.length})</h4>
                    </div>

                    <div className="vstack gap-3">
                        {allCampaigns.map((c) => (
                            <div key={c.Order_key_id} className="border rounded p-3 mb-2">
                                <div className="row g-3 align-items-center">
                                    <div className="col-12 col-lg">
                                        <table className="table table-borderless table-sm mb-0 align-middle">
                                            <tbody>
                                                <tr>
                                                    <th colSpan={4}>
                                                        <h5 className="mb-2 d-inline">{c.Campaign_name}</h5>
                                                        <StatusBadge status={c.Status} />
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <td className="text-secondary" colSpan={2}>
                                                        <span className="fw-bold">Client: </span>{c.Client_name}
                                                    </td>
                                                    <td className="text-secondary" colSpan={2}>
                                                        <span className="fw-bold">Code: </span> {c.Order_id}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-secondary">
                                                        <span className="fw-bold">Lead Scored: </span>{c.Total_Leads_Scored}
                                                    </td>
                                                    <td className="text-secondary">
                                                        <span className="fw-bold">Qualified: </span>{c.SMTP_Qualified_Count}
                                                    </td>
                                                    <td className="text-secondary">
                                                        <span className="fw-bold">Success Rate: </span>{c.success_ratio}%
                                                    </td>
                                                    <td className="text-secondary d-flex justify-content-between align-items-center">
                                                        <span>
                                                            <span className="fw-bold">Disqualified: </span>{c.SMTP_Disqualified_Count}
                                                        </span>

                                                        <button
                                                            className="btn btn-outline-secondary btn-sm ms-2 custom-hover-btn"
                                                            onClick={() =>
                                                                navigate(`/campaigns/${c.Order_key_id}`, { state: { campaign: c } })
                                                            }
                                                        >
                                                            <i className="bi bi-eye me-1"></i> View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="text-secondary" colSpan={2}>
                                                        <span className="fw-bold">Start Date: </span>{formatDate(c.Campaign_start_date)}
                                                    </td>
                                                    <td className="text-secondary" colSpan={2}>
                                                        <span className="fw-bold">End Date: </span>{formatDate(c.Campaign_end_date)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {allCampaigns.length === 0 && (
                            <div className="alert alert-warning mb-0">No campaigns found for selected filters.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Status badge for campaign
function StatusBadge({ status }) {
    if (status === "Live") return <span className="badge bg_nevy_blue ms-2">Live</span>;
    if (status === "Completed") return <span className="badge bg_nevy_blue text-white border ms-2">Completed</span>;
    if (status === "Rectified") return <span className="badge bg-warning text-dark ms-2">Rectified</span>;
    if (status === "Relive") return <span className="badge bg-success ms-2">Relive</span>;

    return <span className="badge bg-secondary ms-2">Unknown</span>;
}

// Format ISO date string to readable format
function formatDate(iso) {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}
