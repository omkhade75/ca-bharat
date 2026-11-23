import React from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  User,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileText,
  Building2,
  ExternalLink,
} from 'lucide-react'
import StepInteractiveSimulation from './StepInteractiveSimulation'

export default function StepDetailModal({ step, allSteps, onClose, onSelectStep }) {
  if (!step) return null

  const currentIndex = allSteps.findIndex((s) => s.number === step.number)
  const prevStep = currentIndex > 0 ? allSteps[currentIndex - 1] : null
  const nextStep = currentIndex < allSteps.length - 1 ? allSteps[currentIndex + 1] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-xs shadow-xs">
              {String(step.number).padStart(2, '0')}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Stage {step.stageNumber}: {step.shortName}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-500 font-medium">Module {step.moduleId}: {step.moduleName}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {step.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Main Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <p className="text-slate-700 leading-relaxed font-normal">
              {step.description}
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Primary Operator / Actor
              </span>
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{step.actor}</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Governing Platform Controls
              </span>
              <div className="flex flex-wrap gap-1.5">
                {step.controls?.map((c, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Inputs & Outputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider block mb-1.5">
                Required Inputs
              </span>
              <ul className="space-y-1 text-slate-700">
                {step.inputs?.map((inp, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{inp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider block mb-1.5">
                Produced Outputs
              </span>
              <ul className="space-y-1 text-slate-700">
                {step.outputs?.map((out, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{out}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Simulation Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-700" />
                Live Interactive Simulation / Evidence View
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Demo Taxpayer: Rahul Sharma</span>
            </div>
            <StepInteractiveSimulation step={step} clientPersona="rahul" />
          </div>

          {/* Key Rule Takeaway Callout */}
          {step.keyTakeaway && (
            <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Core Statutory & Operational Rule: </span>
                <span>{step.keyTakeaway}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => prevStep && onSelectStep(prevStep)}
            disabled={!prevStep}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              prevStep
                ? 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Step ({prevStep ? String(prevStep.number).padStart(2, '0') : '--'})
          </button>

          <span className="text-xs font-mono text-slate-500 font-medium">
            Step {step.number} of 33
          </span>

          <button
            onClick={() => nextStep && onSelectStep(nextStep)}
            disabled={!nextStep}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              nextStep
                ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs'
                : 'text-slate-300 cursor-not-allowed'
            }`}
          >
            Next Step ({nextStep ? String(nextStep.number).padStart(2, '0') : '--'})
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
