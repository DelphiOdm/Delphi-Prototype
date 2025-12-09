import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/"; // default to "/"

    const handleLogin = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            setError("Email and password are required");
            return;
        }

        // Static Super Admin Bypass
        if (email === "superadmin@xdbs.in" && password === "super@1234") {
            const staticUser = {
                email: "superadmin@xdbs.in",
                fullname: "Sameer Datta",
                roleName: "super_admin",
                id: 0,
                role: 0
            };

            localStorage.setItem("user", JSON.stringify(staticUser));
            localStorage.setItem("roleName", "super_admin");

            navigate("/SuperManagerDashboard"); // Redirect to correct dashboard
            return;
        }

        try {
            const res = await axios.post("http://172.16.60.17:8000/login", {
                user_email: email,
                user_password: password,
            }, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            const user = res.data.user;
            localStorage.setItem("user", JSON.stringify(user));

            const Prole_id = parseInt(user.role);
            const getRole = async (Prole_id) => {
                try {
                    const roleRes = await axios.get(`http://172.16.60.17:8000/get_role`, {
                        params: { prole_id: Prole_id }
                    });
                    return roleRes.data.role_name;
                } catch (error) {
                    console.error("Error fetching role:", error);
                    return null;
                }
            };

            const roleName = await getRole(Prole_id);
            localStorage.setItem("roleName", roleName);

            switch (roleName) {
                case "Operation_Admin":
                    navigate("/SuperAdmin");
                    break;
                case "Operations - Team Leader":
                    navigate("/TeamLeadDashboard");
                    break;
                case "Operations - Associate":
                    navigate("/AgentDashboard");
                    break;
                default:
                    navigate("/dashboard");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("Invalid email or password");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div
                className="card shadow-lg border-0 rounded-4 p-4"
                style={{ maxWidth: "420px", width: "100%" }}
            >
                <div className="text-center mb-4">
                    <div
                        className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center shadow-sm"
                        style={{ width: "60px", height: "60px" }}
                    >
                        <i className="bi bi-person-lock fs-3"></i>
                    </div>
                    <h3 className="mt-3 fw-bold">Welcome Back</h3>
                    <p className="text-muted small">
                        Sign in to continue to your dashboard
                    </p>
                </div>

                {error && <div className="alert alert-danger py-2">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Email</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-envelope"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light">
                                <i className="bi bi-lock"></i>
                            </span>
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100 shadow-sm fw-semibold"
                    >
                        <i className="bi bi-box-arrow-in-right me-2"></i> Login
                    </button>
                </form>

                {/* <div className="text-center mt-3">
                    <a
                        href="#"
                        className="text-decoration-none small text-primary"
                    >
                        Forgot Password?
                    </a>
                </div> */}
            </div>
        </div>
    );
}

export default Login;
