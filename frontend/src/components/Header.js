import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Header() {
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!isSidebarOpen);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("roleName");
        navigate("/");
    };

    const leadScoring = () => {
        navigate("/leadscoring");
    };

    const user = localStorage.getItem("user");
    const get_role = localStorage.getItem("roleName");
    const page_title = { "super_admin": "Delphi" };
    const parsedUser = user ? JSON.parse(user) : null;

    return parsedUser ? (
        <>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            <div className="container-fluid bg-white p-3 rounded-3 shadow-sm sticky-top">
                <div className="d-flex justify-content-between align-items-center container">
                    
                    {/* LEFT: Title & Home Icon */}
                    <div className="d-flex align-items-center gap-2">
                        {/* Home Symbol */}
                        <i 
                            className="bi bi-house-door fs-4 text-dark me-2" 
                            style={{ cursor: "pointer" }} 
                            onClick={() => navigate("/SuperManagerDashboard")}
                            title="Go to Dashboard"
                        ></i>
                        
                        {/* Title - Also clickable for better UX */}
                        <div 
                            onClick={() => navigate("/SuperManagerDashboard")} 
                            style={{ cursor: "pointer" }}
                        >
                            <h2 className="fw-bold mb-0">
                                {page_title[get_role] || "Dashboard"}
                            </h2>
                        </div>
                    </div>

                    {/* RIGHT: Actions + Hamburger */}
                    <div className="d-flex align-items-center gap-2">
                        <button
                            onClick={leadScoring}
                            className="btn btn-primary me-2 d-flex align-items-center gap-1 d-none d-md-flex"
                        >
                            Propensity Scoring
                        </button>
                        
                        <button
                            onClick={logout}
                            className="btn btn-danger border d-flex align-items-center gap-1 d-none d-md-flex"
                        >
                            <span className="bi bi-box-arrow-right"></span>
                            Logout
                        </button>

                        <button 
                            className="btn btn-link text-dark p-1 border-0 ms-2" 
                            onClick={toggleSidebar}
                        >
                            <div className="d-flex flex-column align-items-end" style={{ width: '24px' }}>
                                <div className="bg-dark mb-1" style={{ height: '2px', width: '100%', borderRadius: '2px' }}></div>
                                <div className="bg-dark mb-1" style={{ height: '2px', width: '100%', borderRadius: '2px' }}></div>
                                <div className="bg-dark" style={{ height: '2px', width: '100%', borderRadius: '2px' }}></div>
                            </div>
                        </button>
                    </div>

                </div>
            </div>
        </>
    ) : null;
}