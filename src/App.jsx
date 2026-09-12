import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useStore } from './data/store'
import { ROLES } from './data/seed'
import PublicShell from './pages/public/PublicShell'
import Home from './pages/public/Home'
import AboutREC from './pages/public/AboutREC'
import HowItWorks from './pages/public/HowItWorks'
import Technology from './pages/public/Technology'
import VerifyPublic from './pages/public/VerifyPublic'
import Login from './pages/public/Login'
import Layout from './components/Layout'
import Dashboard from './pages/app/Dashboard'
import Analytics from './pages/app/Analytics'
import FraudIntelligence from './pages/app/FraudIntelligence'
import Certificates from './pages/app/Certificates'
import CertificateDetail from './pages/app/CertificateDetail'
import GenerationData from './pages/app/GenerationData'
import Traceability from './pages/app/Traceability'
import Investigations from './pages/app/Investigations'
import InvestigationDetail from './pages/app/InvestigationDetail'
import Producers from './pages/app/Producers'
import Reports from './pages/app/Reports'
import SettingsPage from './pages/app/Settings'

function ScrollToTop() {
  const { pathname } = useLocation()
  // Block body: an implicit return would hand React a non-function "cleanup".
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Protected({ children }) {
  const { user } = useStore()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

/**
 * Route-level role gate. The sidebar already hides what a role cannot use;
 * this stops the same pages being reached by typing the URL.
 */
function RoleGate({ allow, children }) {
  const { user } = useStore()
  if (!user) return null
  if (!allow.includes(user.role)) return <Navigate to="/app" replace />
  return children
}

const OVERSIGHT = [ROLES.REGULATOR, ROLES.ISSUER, ROLES.AUDITOR]
const TELEMETRY = [ROLES.REGULATOR, ROLES.ISSUER, ROLES.PRODUCER, ROLES.AUDITOR]

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutREC />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/verify" element={<VerifyPublic />} />
        </Route>
        <Route path="/login" element={<Login />} />

        <Route
          path="/app"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="analytics"
            element={
              <RoleGate allow={OVERSIGHT}>
                <Analytics />
              </RoleGate>
            }
          />
          <Route
            path="fraud"
            element={
              <RoleGate allow={OVERSIGHT}>
                <FraudIntelligence />
              </RoleGate>
            }
          />
          <Route path="certificates" element={<Certificates />} />
          <Route path="certificates/:id" element={<CertificateDetail />} />
          <Route
            path="generation"
            element={
              <RoleGate allow={TELEMETRY}>
                <GenerationData />
              </RoleGate>
            }
          />
          <Route path="traceability" element={<Traceability />} />
          <Route path="traceability/:id" element={<Traceability />} />
          <Route
            path="investigations"
            element={
              <RoleGate allow={OVERSIGHT}>
                <Investigations />
              </RoleGate>
            }
          />
          <Route
            path="investigations/:id"
            element={
              <RoleGate allow={OVERSIGHT}>
                <InvestigationDetail />
              </RoleGate>
            }
          />
          <Route
            path="producers"
            element={
              <RoleGate allow={OVERSIGHT}>
                <Producers />
              </RoleGate>
            }
          />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
