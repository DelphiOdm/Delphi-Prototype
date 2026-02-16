// frontend/src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import ICPScoringConfig from "./components/ICP/ScoringConfig/ICPScoringConfig";
import ICPScoringConfigList from "./components/ICP/ScoringConfig/ICPScoringConfigList";
import GenerateICP from "./components/ICP/GenerateICP";
import CreateIdealTAL from "./components/ICP/CreateIdealTAL";
import ICPLeadAnalysis from "./components/ICP/ICPLeadAnalysis";

import Nav_Sidebar from "./components/Nav_Sidebar";
function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Nav_Sidebar />
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

        <Route
          path="/ICP/GenerateICP"
          element={
            <ProtectedRoute>
              <GenerateICP />
            </ProtectedRoute>
          }
        />

        <Route
        path="/ICP/CreateIdealTAL"
        element={
          <ProtectedRoute>
            <CreateIdealTAL/>
          </ProtectedRoute>
        }
        />

        <Route
          path="/ICP"
          element={
            <ProtectedRoute>
              <ICPScoringConfigList />
            </ProtectedRoute>
          }
        />

          <Route
            path="/ICP/values/:parameterId"
            element={
              <ProtectedRoute>
                <ICPScoringConfig />
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

            <Route
             path="/icp/leads/:leadId"
              element={
                <ProtectedRoute>
                  <ICPLeadAnalysis />
                </ProtectedRoute>
              
              } />


            {/* ================= FALLBACK ================= */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
