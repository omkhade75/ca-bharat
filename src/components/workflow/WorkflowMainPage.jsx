import React, { useState } from 'react'
import Navbar from './Navbar'
import HeroSection from './HeroSection'
import WorkflowStagesExplorer from './WorkflowStagesExplorer'
import SimulatorWorkspace from './SimulatorWorkspace'
import WorkflowComparisonSection from './WorkflowComparisonSection'
import WorkflowComparisonModal from './WorkflowComparisonModal'
import ModulesMatrixSection from './ModulesMatrixSection'
import ControlsSection from './ControlsSection'
import RoadmapSection from './RoadmapSection'
import GlobalSearchModal from './GlobalSearchModal'
import StepDetailModal from './StepDetailModal'
import Footer from './Footer'
import { WORKFLOW_STAGES } from '../../data/workflowStagesData'

export default function WorkflowMainPage() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [selectedStepModal, setSelectedStepModal] = useState(null)
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)

  const allSteps = WORKFLOW_STAGES.flatMap((stage) => stage.steps)

  const handleOpenStepByNumber = (stepNumber) => {
    const found = allSteps.find((s) => s.number === stepNumber)
    if (found) {
      setSelectedStepModal(found)
    }
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900 antialiased">
      {/* Sticky Navigation */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSimulator={() => scrollToSection('simulator')}
      />

      {/* Main Content Sections */}
      <main className="flex-1 space-y-16 pb-16">
        {/* Hero & Overview */}
        <HeroSection
          onExploreSteps={() => scrollToSection('workflow-stages')}
          onLaunchSimulator={() => scrollToSection('simulator')}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* The 7 Stages & 33 Steps Explorer */}
          <WorkflowStagesExplorer
            onOpenSimulator={(step) => {
              scrollToSection('simulator')
            }}
          />

          {/* Interactive Live Case Simulator */}
          <SimulatorWorkspace />

          {/* Workflow Comparison: Traditional CA Software (SAG Infotech Genius) vs CA Bharat AI */}
          <WorkflowComparisonSection
            onOpenFullModal={() => setIsComparisonModalOpen(true)}
          />

          {/* The 12 Developer Modules Matrix */}
          <ModulesMatrixSection
            onSelectStepNumber={(num) => handleOpenStepByNumber(num)}
          />

          {/* The 8 Essential Platform Controls */}
          <ControlsSection />

          {/* Product Roadmap (Phases 1 - 4) */}
          <RoadmapSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStep={(step) => setSelectedStepModal(step)}
      />

      {/* Step Detail Modal */}
      {selectedStepModal && (
        <StepDetailModal
          step={selectedStepModal}
          allSteps={allSteps}
          onClose={() => setSelectedStepModal(null)}
          onSelectStep={(next) => setSelectedStepModal(next)}
        />
      )}

      {/* Comprehensive SAG Infotech vs CA Bharat AI Comparison Modal */}
      <WorkflowComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
      />
    </div>
  )
}
