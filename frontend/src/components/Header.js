// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Sidebar from "./Sidebar";


// export default function Header() {
//     const navigate = useNavigate();
//     const [isSidebarOpen, setSidebarOpen] = useState(false);

//     const toggleSidebar = () => {
//         setSidebarOpen(!isSidebarOpen);
//     };

//     const logout = () => {
//         localStorage.removeItem("token");
//         localStorage.removeItem("user");
//         localStorage.removeItem("role");
//         localStorage.removeItem("roleName");
//         navigate("/");
//     };

//     const leadScoring = () => {
//         navigate("/leadscoring");
//     };

    
//     const Build_ICP = () => {
//         navigate("/ICP/GenerateICP");
//     };

//     const user = localStorage.getItem("user");
//     const get_role = localStorage.getItem("roleName");
//     const page_title = { "super_admin": "Delphi" };
//     const parsedUser = user ? JSON.parse(user) : null;

//     return parsedUser ? (
//         <>
            
//             <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//             <div className="container-fluid bg-white p-3 rounded-3 shadow-sm sticky-top">
//                 <div className="d-flex justify-content-between align-items-center container">
                    
//                     {/* LEFT: Title & Home Icon */}
//                     <div className="d-flex align-items-center gap-2">
//                         {/* Home Symbol */}
//                         <i 
//                             className="bi bi-house-door fs-4 text-dark me-2" 
//                             style={{ cursor: "pointer" }} 
//                             onClick={() => navigate("/SuperManagerDashboard")}
//                             title="Go to Dashboard"
//                         ></i>
                        
//                         {/* Title - Also clickable for better UX */}
//                         <div 
//                             onClick={() => navigate("/SuperManagerDashboard")} 
//                             style={{ cursor: "pointer" }}
//                         >
//                             <h2 className="fw-bold mb-0">
//                                 {page_title[get_role] || "Dashboard"}
//                             </h2>
//                         </div>
//                     </div>

//                     {/* RIGHT: Actions + Hamburger */}
//                     <div className="d-flex align-items-center gap-2">
//                         <button
//                             onClick={leadScoring}
//                             className="btn btn-primary me-2 d-flex align-items-center gap-1 d-none d-md-flex"
//                         >
//                             Propensity Scoring
//                         </button>

//                          <button
//                             onClick={Build_ICP}
//                             className="btn btn-primary me-2 d-flex align-items-center gap-1 d-none d-md-flex"
//                         >
//                             Create ICP
//                         </button>

                        
//                         <button
//                             onClick={logout}
//                             className="btn btn-danger border d-flex align-items-center gap-1 d-none d-md-flex"
//                         >
//                             <span className="bi bi-box-arrow-right"></span>
//                             Logout
//                         </button>

//                         <button 
//                             className="btn btn-link text-dark p-1 border-0 ms-2" 
//                             onClick={toggleSidebar}
//                         >
//                             <div className="d-flex flex-column align-items-end" style={{ width: '24px' }}>
//                                 <div className="bg-dark mb-1" style={{ height: '2px', width: '100%', borderRadius: '2px' }}></div>
//                                 <div className="bg-dark mb-1" style={{ height: '2px', width: '100%', borderRadius: '2px' }}></div>
//                                 <div className="bg-dark" style={{ height: '2px', width: '100%', borderRadius: '2px' }}></div>
//                             </div>
//                         </button>
//                     </div>

//                 </div>
//             </div>
//         </>
//     ) : null;
// }

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Nav_Sidebar from "./Headerbar"; // Your updated dock

export default function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSettingsOpen, setSettingsOpen] = useState(false);

    // HIDE IF: On Login page OR No User Session
    const isAuthenticated = localStorage.getItem("token") && localStorage.getItem("user");
    if (location.pathname === "/" || location.pathname === "/login" ) return null;

    return (
        <>
            <Sidebar isOpen={isSettingsOpen} toggleSidebar={() => setSettingsOpen(false)} />
            
            {/* Main Wrapper: Balanced Fixed Header */}
            <nav className="navbar fixed-top bg-white border-bottom px-4 py-2 shadow-sm rounded-pill shadow-lg border" style={{ zIndex: 1050 }}>
                <div className="container-fluid d-flex align-items-center justify-content-between ">
                    
                    {/* LEFT: Branding - Fixed Width to prevent jumping */}
<div 
    className="d-flex align-items-center gap-3" 
    style={{ zIndex: 1040, cursor: 'pointer', minWidth: '180px' }}
    onClick={() => navigate("/SuperManagerDashboard")}
>
    {/* Enhanced Typography Logo */}
    <h5 className="mb-0 delphi-logo-text">
        DELPHI
    </h5>
    <style>{`
        .delphi-logo-text {
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
        .delphi-logo-text:hover {
            letter-spacing: 5px;
            opacity: 0.8;
        }
    `}</style>
</div>

                    {/* CENTER: The Navigation Dock (Integrated) */}
                    <div className="flex-grow-1 d-flex justify-content-center">
                        <Nav_Sidebar />
                    </div>

                    {/* RIGHT: Settings - Fixed Width to match left side balance */}
                    <div className="d-flex justify-content-end" style={{ minWidth: '180px' }}>
                        <button 
                            className="btn btn-light shadow-sm rounded-circle border p-0 d-flex align-items-center justify-content-center"
                            style={{ width: 38, height: 38, transition: 'all 0.2s' }}
                            onClick={() => setSettingsOpen(true)}
                        >
                            <i className="bi bi-gear-wide-connected text-dark fs-5"></i>
                        </button>
                    </div>
                </div>
            </nav>
            
            {/* Spacer for App.js content since Header is fixed */}
            <div style={{ height: '75px' }}></div>
        </>
    );
}