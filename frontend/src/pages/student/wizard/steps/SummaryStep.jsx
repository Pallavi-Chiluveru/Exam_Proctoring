import { CheckCircle2, Play } from 'lucide-react';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';
import { useAuth } from '../../../../context/AuthContext';

export default function SummaryStep({ onStart, verificationData }) {
  const { user } = useAuth();
  
  const candidateName = user?.name || 'Unknown Candidate';
  const candidateEmail = user?.email || 'Unknown Email';
  const candidateId = user?.candidateId || 'Pending';
  
  return (
    <WizardStepLayout
      title="Verification Summary"
      description="All verification steps have been completed successfully. You are now ready to begin the assessment."
      actionButton={
        <Button onClick={onStart} size="lg" className="bg-teal-500 text-black hover:bg-teal-400">
          <Play className="mr-2 h-5 w-5" /> Start Assessment
        </Button>
      }
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Candidate Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500">Name</p>
                <p className="font-medium text-slate-200">{candidateName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-200">{candidateEmail}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Candidate ID</p>
                <p className="font-mono text-sm font-medium text-slate-200">{candidateId}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">System Verification</h3>
            <div className="space-y-3">
              <SummaryCheckItem label="Browser Verified" passed={verificationData.browserVerified} />
              <SummaryCheckItem label="Webcam Verified" passed={verificationData.webcamVerified} />
              <SummaryCheckItem label="Microphone Verified" passed={verificationData.micVerified} />
              <SummaryCheckItem label="Screen Shared" passed={verificationData.screenVerified} />
              <SummaryCheckItem label="Network Stable" passed={verificationData.networkVerified} extra={verificationData.networkQuality} />
              <SummaryCheckItem label="WebRTC Enabled" passed={verificationData.webrtcVerified} />
              <SummaryCheckItem label="Identity Verified" passed={!!verificationData.candidatePhoto} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border-4 border-teal-500/20 bg-black">
            {verificationData.candidatePhoto ? (
              <img src={verificationData.candidatePhoto} alt="Identity verification" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">No Photo Available</div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-center font-medium text-white text-shadow-sm">Verified Candidate</p>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400">
            This image is securely stored and monitored by AI during your assessment.
          </p>
        </div>
      </div>
    </WizardStepLayout>
  );
}

function SummaryCheckItem({ label, passed, extra }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {passed ? <CheckCircle2 className="h-4 w-4 text-teal-400" /> : <div className="h-4 w-4 rounded-full border border-slate-600" />}
        <span className={`text-sm ${passed ? 'text-slate-200' : 'text-slate-500'}`}>{label}</span>
      </div>
      {extra && <span className="text-xs font-medium text-slate-400">({extra})</span>}
    </div>
  );
}
