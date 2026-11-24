import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import AppLayout from './components/layout/AppLayout'
import WorkflowMainPage from './components/workflow/WorkflowMainPage'
import MainDashboard from './components/modules/dashboard/MainDashboard'
import FirmClientsModule from './components/modules/firm-clients/FirmClientsModule'
import DocumentIntelligenceModule from './components/modules/document-intelligence/DocumentIntelligenceModule'
import TaxReconciliationModule from './components/modules/tax-reconciliation/TaxReconciliationModule'
import InsightsDeliveryModule from './components/modules/insights-delivery/InsightsDeliveryModule'
import SettingsModule from './components/modules/settings/SettingsModule'
import HelpModule from './components/modules/help/HelpModule'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Primary Master Static Site & End-to-End Business Workflow */}
          <Route path="/" element={<WorkflowMainPage />} />
          <Route path="/workflow" element={<WorkflowMainPage />} />
          <Route path="/landing" element={<WorkflowMainPage />} />

          {/* Internal CA Application Workspace */}
          <Route element={<AppLayout />}>
            <Route path="dashboard" element={<MainDashboard />} />
            <Route path="firm-clients" element={<FirmClientsModule />} />
            <Route path="document-intelligence" element={<DocumentIntelligenceModule />} />
            <Route path="tax-reconciliation" element={<TaxReconciliationModule />} />
            <Route path="insights-delivery" element={<InsightsDeliveryModule />} />
            <Route path="settings" element={<SettingsModule />} />
            <Route path="help" element={<HelpModule />} />
          </Route>

          {/* Fallback Aliases */}
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
          <Route path="/workspace/clients" element={<Navigate to="/firm-clients" replace />} />
          <Route path="/clients" element={<Navigate to="/firm-clients" replace />} />
          <Route path="/documents" element={<Navigate to="/document-intelligence" replace />} />
          <Route path="/reconciliation" element={<Navigate to="/tax-reconciliation" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
