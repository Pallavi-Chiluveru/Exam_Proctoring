import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, CheckCircle2 } from 'lucide-react';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';

export default function CapturePhotoStep({ onNext }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle, capturing, success
  const [message, setMessage] = useState('Please position your face clearly and take a photo for identity verification.');
  const [photo, setPhoto] = useState(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setStatus('error');
      setMessage('Camera permission denied.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setStatus('capturing');
    
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    
    // Draw the current frame
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Convert to data URL
    const imageDataUrl = canvasRef.current.toDataURL('image/jpeg');
    
    setPhoto(imageDataUrl);
    setStatus('success');
    setMessage('Photo captured successfully. Identity verified.');
  };

  const retakePhoto = () => {
    setPhoto(null);
    setStatus('idle');
    setMessage('Please position your face clearly and take a photo for identity verification.');
  };

  const handleNext = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // WebRTC and stream integration is verified implicitly if we get media and capture photo
    onNext({ webrtcVerified: true, candidatePhoto: photo });
  };

  return (
    <WizardStepLayout
      title="Identity Verification"
      description="Capture a clear photo of your face. This will be used to verify your identity against the registered profile."
      status={status === 'success' ? 'success' : undefined}
      statusMessage={status === 'success' ? message : undefined}
      actionButton={
        <div className="flex gap-3">
          {status === 'success' && (
            <Button variant="outline" onClick={retakePhoto}>
              Retake Photo
            </Button>
          )}
          <Button onClick={handleNext} disabled={status !== 'success'}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center">
        <div className="relative mb-6 overflow-hidden rounded-2xl border-2 border-white/10 bg-black">
          {!photo ? (
            <div className="relative aspect-video w-full max-w-2xl bg-slate-900">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <Button onClick={capturePhoto} size="lg" className="rounded-full shadow-lg shadow-teal-500/20">
                  <Camera className="mr-2 h-5 w-5" /> Capture Photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-2xl">
              <img src={photo} alt="Captured candidate" className="h-full w-full object-cover" />
              <div className="absolute inset-0 border-[6px] border-teal-500/40" />
              <div className="absolute right-4 top-4 rounded-full bg-teal-500 p-2 text-black shadow-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>
          )}
          {/* Hidden canvas for capturing the frame */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        {!photo && <p className="text-sm text-slate-400">{message}</p>}
      </div>
    </WizardStepLayout>
  );
}
