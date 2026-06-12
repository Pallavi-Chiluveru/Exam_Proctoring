import { useState } from 'react';
import { ArrowRight, CheckSquare, Maximize, Mic, Monitor, UserX, Video } from 'lucide-react';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';

export default function InstructionsStep({ onNext }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <WizardStepLayout
      title="Exam Rules & Instructions"
      description="Please read and accept the following rules to proceed with the verification."
      actionButton={
        <Button onClick={() => onNext({ instructionsAccepted: true })} disabled={!accepted}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">System Requirements</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-300"><Maximize className="mt-0.5 h-4 w-4 text-teal-400" /> Fullscreen mode is strictly enforced.</li>
            <li className="flex items-start gap-3 text-sm text-slate-300"><Video className="mt-0.5 h-4 w-4 text-teal-400" /> Webcam must be enabled and focused on your face.</li>
            <li className="flex items-start gap-3 text-sm text-slate-300"><Mic className="mt-0.5 h-4 w-4 text-teal-400" /> Microphone must be active. No background noise allowed.</li>
            <li className="flex items-start gap-3 text-sm text-slate-300"><Monitor className="mt-0.5 h-4 w-4 text-teal-400" /> Entire screen sharing is required. Window or Tab sharing is blocked.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">Strictly Prohibited</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-slate-300"><UserX className="mt-0.5 h-4 w-4 text-rose-400" /> No additional persons in the room.</li>
            <li className="flex items-start gap-3 text-sm text-slate-300"><UserX className="mt-0.5 h-4 w-4 text-rose-400" /> No mobile phones, tablets, or smartwatches.</li>
            <li className="flex items-start gap-3 text-sm text-slate-300"><UserX className="mt-0.5 h-4 w-4 text-rose-400" /> No tab switching or exiting fullscreen.</li>
            <li className="flex items-start gap-3 text-sm text-slate-300"><UserX className="mt-0.5 h-4 w-4 text-rose-400" /> No talking or reading questions aloud.</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-900"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span className="text-sm text-slate-300">
            I have read the instructions and I consent to audio, video, and screen monitoring for the duration of this exam.
          </span>
        </label>
      </div>
    </WizardStepLayout>
  );
}
