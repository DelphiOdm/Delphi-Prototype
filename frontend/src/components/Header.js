import React from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        localStorage.removeItem("roleName");
        navigate("/");
    };

    // ✅ Lead Scoring button handler
    const leadScoring = () => {
        navigate("/leadscoring");
    };

    const user = localStorage.getItem("user");
    const get_role = localStorage.getItem("roleName");

    const page_title = {
        "super_admin": "Super Admin Dashboard",
        "Operation_Admin": "Manager Dashboard",
        "Operations - Team Leader": "Team Lead Dashboard",
        "Operations - Associate": "Agent Dashboard"
    };

    const parsedUser = user ? JSON.parse(user) : null;

    return parsedUser ? (
        <div className="container-fluid bg-white p-3 rounded-3 shadow-sm ">
            <div className="d-flex justify-content-between align-items-center container">
                
                {/* Title + user welcome */}
                <div>
                    <h2 className="fw-bold mb-1">{page_title[get_role]}</h2>
                    <div className="text-secondary">
                        Welcome back, {parsedUser.fullname}
                    </div>
                </div>

                {/* Lead Scoring Button */}
                <div className="d-flex gap-2">
                    <button
                        onClick={leadScoring}
                        className="btn btn-primary d-flex align-items-center gap-1"
                    >
                        <span className="bi bi-star"></span>
                        Lead Scoring
                    </button>
                </div>

                {/* Logout Button */}
                <div className="d-flex gap-2">
                    <button
                        onClick={logout}
                        className="btn btn-light border d-flex align-items-center gap-1"
                    >
                        <span className="bi bi-box-arrow-right"></span>
                        Logout
                    </button>
                </div>

            </div>
        </div>
    ) : null;
}
