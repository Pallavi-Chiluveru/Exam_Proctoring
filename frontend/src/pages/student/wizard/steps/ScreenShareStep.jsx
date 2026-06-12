import { useEffect, useRef, useState } from 'react';
import { ArrowRight, MonitorUp, RefreshCcw } from 'lucide-react';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';

export default function ScreenShareStep({ onNext }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('Click the button below to share your ENTIRE screen.');
  const [stream, setStream] = useState(null);

  const startScreenShare = async () => {
    setStatus('loading');
    setMessage('Waiting for screen share selection...');
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: {
          displaySurface: 'monitor' // Prefers entire screen
        } 
      });
      
      // Check if user selected entire screen
      const track = mediaStream.getVideoTracks()[0];
      const settings = track.getSettings();
      
      // Heuristic to check if it's an entire screen: displaySurface === 'monitor'
      // If it's a window or browser, we reject it.
      if (settings.displaySurface && settings.displaySurface !== 'monitor') {
        track.stop();
        setStatus('error');
        setMessage('You must share your ENTIRE SCREEN. Window or Tab sharing is not allowed.');
        return;
      }

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStatus('success');
      setMessage('Screen sharing verified successfully.');
      
      // Listen for stop
      track.onended = () => {
        setStatus('error');
        setMessage('Screen sharing was stopped. You must keep it active.');
        setStream(null);
      };

    } catch (err) {
      setStatus('error');
      setMessage('Screen sharing was denied or cancelled.');
    }
  };

  const handleNext = () => {
    // Keep stream active for the exam if needed, or stop it and let exam re-request.
    // For this wizard, we'll stop it to clean up, ExamRoom re-requests if it has its own logic.
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    onNext({ screenVerified: true });
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <WizardStepLayout
      title="Screen Sharing Verification"
      description="You must share your entire screen to proceed. This ensures no unauthorized applications are running during the exam."
      status={status === 'success' || status === 'error' ? status : undefined}
      statusMessage={message}
      actionButton={
        <div className="flex gap-3">
          {status !== 'success' ? (
            <Button onClick={startScreenShare}>
              <MonitorUp className="mr-2 h-4 w-4" /> Start Screen Share
            </Button>
          ) : (
            <Button variant="outline" onClick={startScreenShare}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Restart Share
            </Button>
          )}
          <Button onClick={handleNext} disabled={status !== 'success'}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
        <div className="relative flex aspect-video w-full flex-col items-center justify-center bg-slate-900">
          {!stream ? (
            <div className="text-center p-6">
              <MonitorUp className="mx-auto mb-4 h-16 w-16 text-slate-500" />
              <p className="text-sm text-slate-400">Your screen preview will appear here.</p>
              <p className="mt-2 text-xs font-semibold text-teal-400">Important: Select "Entire Screen" in the popup.</p>
            </div>
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>
    </WizardStepLayout>
  );
}
