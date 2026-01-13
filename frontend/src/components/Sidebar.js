import React from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ isOpen, toggleSidebar }) {
    const navigate = useNavigate();

    return (
        <>
            {/* Overlay - Closes sidebar when clicking outside */}
            {isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark opacity-25" 
                    style={{ zIndex: 1040, backdropFilter: 'blur(2px)' }}
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar Slider */}
            <div 
                className="position-fixed top-0 end-0 h-100 bg-white shadow-lg border-start"
                style={{ 
                    width: "300px", 
                    zIndex: 1050, 
                    transform: isOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                }}
            >
                {/* Sidebar Header */}
                <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">Settings</h5>
                    <button className="btn-close" onClick={toggleSidebar}></button>
                </div>

                {/* Sidebar Body */}
                <div className="p-3">
                    <div className="list-group list-group-flush">
                        {/* Score Configuration Option */}
                        <button
                            onClick={() => {
                                navigate("/ScoreConfiguration"); // Path matched to App.js
                                toggleSidebar();
                            }}
                            className="list-group-item list-group-item-action border-0 py-3 rounded-3 d-flex align-items-center gap-3 mb-2"
                        >
                            <i className="bi bi-gear-fill fs-5 text-primary"></i>
                            <span className="fw-medium">Score Configuration</span>
                        </button>
                    </div>
                </div>

                {/* Footer Version Tag */}
                <div className="position-absolute bottom-0 w-100 p-4 text-center">
                    <small className="text-muted">Delphi v1.0</small>
                </div>
            </div>
        </>
    );
}   