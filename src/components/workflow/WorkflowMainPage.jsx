import React, { useState } from 'react'
import Navbar from './Navbar'
import SimpleWorkflowOverview from './SimpleWorkflowOverview'
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
import { Sparkles, Layers, ArrowLeft } from 'lucide-react'

export default function WorkflowMainPage() {
  const [displayMode, setDisplayMode] = useState('simple') // 'simple' | 'technical'
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
      {/* Sticky Navigation with Mode Switcher */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSimulator={() => scrollToSection('simulator')}
        displayMode={displayMode}
        onToggleDisplayMode={(mode) => {
          setDisplayMode(mode)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />

      {/* Main Content Sections */}
      <main className="flex-1 pb-16">
        {displayMode === 'simple' ? (
          /* Short, Simple & Human-Centric UI (Default) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <SimpleWorkflowOverview
              onSwitchToFullSpec={() => {
                setDisplayMode('technical')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onOpenComparisonModal={() => setIsComparisonModalOpen(true)}
            />
          </div>
        ) : (
          /* Full 33-Step Engineering & Statutory Specification */
          <div className="space-y-16">
            {/* Top Switcher Notice Bar */}
            <div className="bg-slate-900 text-white py-2.5 px-4 text-xs">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="font-mono uppercase tracking-wider text-[11px] text-amber-300">
                    Full Engineering View Active
                  </span>
                  <span className="hidden sm:inline text-slate-400">
                    — Showing all 7 stages, 33 steps, 12 modules & 8 controls
                  </span>
                </div>
                <button
                  onClick={() => {
                    setDisplayMode('simple')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Simple Overview</span>
                </button>
              </div>
            </div>

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
          </div>
        )}
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
