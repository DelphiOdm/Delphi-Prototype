import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SuperManagerDashboard from "./components/Dashboard/SuperManagerDashboard";
import CampaignDetails from "./components/CampaignDetails";
import CompanyDetails from "./components/CompanyDetails";
import Header from "./components/Header";
import LeadScoring from "./components/LeadScoring/LeadScoring";
import LeadDetail from "./components/LeadScoring/LeadDetail";
import ScoreConfiguration from "./components/LeadScoring/ScoreConfiguration";
import ScoreValuesConfig from "./components/LeadScoring/ScoreValuesConfig";

function App() {
  return (
    <Router>
      <Header />
      <div className="d-flex">
        <div className="flex-grow-1">
          <Routes>
            {/* ================= PUBLIC ================= */}
            <Route path="/" element={<Login />} />

            {/* ================= PROTECTED ================= */}
                        
            <Route
              path="/SuperManagerDashboard"
              element={
                <ProtectedRoute>
                  <SuperManagerDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/LeadScoring"
              element={
                <ProtectedRoute>
                  <LeadScoring />
                </ProtectedRoute>
              }
            />

                    <Route
          path="/ScoreConfiguration"
          element={
            <ProtectedRoute>
              <ScoreConfiguration />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ScoreConfiguration/values/:parameterId"
          element={
            <ProtectedRoute>
              <ScoreValuesConfig />
            </ProtectedRoute>
          }
        />


            {/* ===== Campaign flow ===== */}
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

            {/* ===== Lead Detail (NEW) ===== */}
            <Route
              path="/leads/:leadId"
              element={
                <ProtectedRoute>
                  <LeadDetail />
                </ProtectedRoute>
              }
            />

            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
