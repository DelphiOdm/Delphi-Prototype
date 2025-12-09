import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Dashboard from "./components/Dashboard";
// import Sidebar from "./components/Sidebar";
// import SuperAdmin from "./components/SuperAdmin";
// import Leads from "./components/Leads";
import Login from "./components/Login";
// import AgentDashboard from "./components/AgentDashboard";
// import TeamLeadDashboard from "./components/TeamLeadDashboard";
// import OpManagerDashboard from "./components/OpManagerDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperManagerDashboard from "./components/SuperManagerDashboard";
import CampaignDetails from "./components/CampaignDetails";
import CompanyDetails from "./components/CompanyDetails";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <Header />
      <div className="d-flex">
        {/* <Sidebar /> */}
        <div className="flex-grow-1">
          <Routes>
            {/* ✅ Public Route */}
            <Route path="/" element={<Login />} />

            {/* ✅ Protected Routes */}
            {/* <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/superadmin"
              element={
                <ProtectedRoute>
                  <SuperAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/AgentDashboard"
              element={
                <ProtectedRoute>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/TeamLeadDashboard"
              element={
                <ProtectedRoute>
                  <TeamLeadDashboard />
                </ProtectedRoute>
              }
            /> */}
            {/* <Route
              path="/OpManagerDashboard"
              element={
                <ProtectedRoute>
                  <OpManagerDashboard />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/SuperManagerDashboard"
              element={
                <ProtectedRoute>
                  <SuperManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:campaignId"
              element={
                <ProtectedRoute>
                  <CampaignDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/campaigns/:campaignId/companies/:companyId"
              element={
                <ProtectedRoute>
                  <CompanyDetails />
                </ProtectedRoute>
              }
            />

            {/* Optional: Catch-all route to redirect unknown paths */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
