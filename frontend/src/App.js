// // frontend/src/App.js
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./components/Login";
import Onboarding from "./components/Onboarding/Onboarding";
import Enrichment from "./components/Onboarding/Enrichment";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./components/Dashboard/Dashboard";

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
import CreatePersona from "./components/Persona/CreatePersona";
import PersonaScoringConfig from "./components/Persona/ScoringConfig/PersonaScoringConfig";
import PersonaScoringConfigList from "./components/Persona/ScoringConfig/PersonaScoringConfigList";
import Nav_Sidebar from "./components/Headerbar";

function Layout() {
  const location = useLocation();

  // Pages where header/sidebar should NOT show
  const hideLayoutRoutes = ["/", "/Onboarding", "/Enrichment"];


  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />

      {!shouldHideLayout && <Nav_Sidebar />}
      {!shouldHideLayout && <Header />}

      <div className="d-flex">
        <div className="flex-grow-1">
          <Routes>

            {/* PUBLIC */}
            <Route path="/" element={<Login />} />
            <Route path="/Onboarding" element={<Onboarding />} />
            <Route path="/Enrichment" element={<Enrichment />} />

            {/* PROTECTED */}
            <Route
              path="/Dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
                  <CreateIdealTAL />
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

            <Route
              path="/Persona/CreatePersona"
              element={
                <ProtectedRoute>
                  <CreatePersona />
                </ProtectedRoute>
              }
            />

            <Route
              path="/Persona"
              element={
                <ProtectedRoute>
                  <PersonaScoringConfigList/>
                </ProtectedRoute>
              }
            />

            <Route
              path="/persona/values/:parameterId"
              element={
                <ProtectedRoute>
                  <PersonaScoringConfig/>
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
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Login />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;