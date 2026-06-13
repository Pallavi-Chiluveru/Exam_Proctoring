import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button, Page, SectionTitle } from '../../../components/ui';

import InstructionsStep from './steps/InstructionsStep';
import BrowserCheckStep from './steps/BrowserCheckStep';
import WebcamCheckStep from './steps/WebcamCheckStep';
import MicCheckStep from './steps/MicCheckStep';
import ScreenShareStep from './steps/ScreenShareStep';
import NetworkCheckStep from './steps/NetworkCheckStep';
import CapturePhotoStep from './steps/CapturePhotoStep';
import SummaryStep from './steps/SummaryStep';

const steps = [
  { id: 'instructions', label: 'Instructions', Component: InstructionsStep },
  { id: 'webcam', label: 'Webcam Check', Component: WebcamCheckStep },
  { id: 'mic', label: 'Microphone Check', Component: MicCheckStep },
  { id: 'screen', label: 'Screen Share Check', Component: ScreenShareStep },
  { id: 'browser', label: 'Browser Check', Component: BrowserCheckStep },
  { id: 'network', label: 'Network Check', Component: NetworkCheckStep },
  { id: 'photo', label: 'Capture Photo', Component: CapturePhotoStep },
  { id: 'summary', label: 'Verification Summary', Component: SummaryStep },
];

export default function VerificationWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [verificationData, setVerificationData] = useState({});

  const CurrentStepComponent = steps[currentStepIndex]?.Component;

  const handleNext = (stepData) => {
    setVerificationData((prev) => ({ ...prev, ...stepData }));
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleStartAssessment = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.error('Failed to enter fullscreen:', e);
    }
    // Navigate to exam room and pass verification completion state
    navigate(`/exam/${id}`, { state: { verified: true, verificationData } });
  };

  return (
    <Page className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <SectionTitle 
            eyebrow="Pre-Exam Verification" 
            title="System Verification" 
            action={<span className="flex items-center gap-2 text-sm text-teal-400"><ShieldCheck className="h-5 w-5" /> Secured Area</span>} 
          />
          
          <div className="mt-8 flex items-center justify-between gap-2">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;
              return (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${isActive ? 'border-teal-400 bg-teal-400/20 text-teal-300' : isPast ? 'border-teal-400 bg-teal-400 text-slate-950' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                  </div>
                  <span className={`hidden text-[10px] uppercase tracking-wider md:block ${isActive ? 'text-teal-300' : isPast ? 'text-teal-400/70' : 'text-slate-600'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="min-h-[500px]">
          {CurrentStepComponent && (
            <CurrentStepComponent
              onNext={handleNext}
              verificationData={verificationData}
              isLastStep={currentStepIndex === steps.length - 1}
              onStart={handleStartAssessment}
              stepInfo={{
                current: currentStepIndex + 1,
                total: steps.length
              }}
            />
          )}
        </div>
      </div>
    </Page>
  );
}
