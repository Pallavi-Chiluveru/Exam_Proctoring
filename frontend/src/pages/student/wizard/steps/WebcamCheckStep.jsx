import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, RefreshCcw, User, Users, UserX } from 'lucide-react';
import * as faceapi from 'face-api.js';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';

export default function WebcamCheckStep({ onNext }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading, capturing, success, error
  const [message, setMessage] = useState('Requesting camera permissions...');
  const [faces, setFaces] = useState(null); // null, 0, 1, 2+
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);
  const validFaceStartedAtRef = useRef(null);

  const startCamera = async () => {
    setStatus('loading');
    setMessage('Requesting camera permissions...');
    setFaces(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setMessage('Analyzing video feed for 5 continuous seconds...');
      await analyzeFace();
    } catch (err) {
      setStatus('error');
      setMessage('Camera permission denied or device not found.');
    }
  };

  const detectionIntervalRef = useRef(null);

  const analyzeFace = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/');
      
      const detect = async () => {
        if (!videoRef.current) return;
        if (videoRef.current.readyState < 2) {
          return; // Wait for video to have dimensions
        }
        
        // Continuous detection loop
        detectionIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          
          try {
            const detections = await faceapi.detectAllFaces(
              videoRef.current, 
              new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            );
            
            const count = detections.length;
            setFaces(count);
            
            // Draw visual debugging
            const canvas = document.getElementById('debug-canvas');
            if (canvas && videoRef.current) {
              const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
              faceapi.matchDimensions(canvas, displaySize);
              const resizedDetections = faceapi.resizeResults(detections, displaySize);
              canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
              faceapi.draw.drawDetections(canvas, resizedDetections);
              
              resizedDetections.forEach(det => {
                const text = [
                  `Faces Detected: ${count}`,
                  `Detection Confidence: ${Math.round(det.score * 100)}%`
                ];
                const anchor = { x: det.box.x, y: det.box.y };
                const drawOptions = {
                  anchorPosition: 'TOP_LEFT',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)'
                };
                const drawBox = new faceapi.draw.DrawTextField(text, anchor, drawOptions);
                drawBox.draw(canvas);
              });
            }

            if (count === 1) {
              validFaceStartedAtRef.current ||= Date.now();
              const stableSeconds = Math.floor((Date.now() - validFaceStartedAtRef.current) / 1000);
              if (stableSeconds >= 5) {
                setStatus('success');
                setMessage('Single candidate verified for 5 continuous seconds.');
              } else {
                setStatus('loading');
                setMessage(`Keep one face visible for ${5 - stableSeconds} more second${5 - stableSeconds === 1 ? '' : 's'}.`);
              }
            } else if (count === 0) {
              validFaceStartedAtRef.current = null;
              setStatus('error');
              setMessage('Only one candidate may be visible during verification.');
            } else {
              validFaceStartedAtRef.current = null;
              setStatus('error');
              setMessage('Only one candidate may be visible during verification.');
            }
          } catch (e) {
            // Ignore temporary detection errors to keep console clean
          }
        }, 500); // Check twice a second
      };

      // Add a slight delay to let video stream stabilize before starting interval
      setTimeout(detect, 500);
      
    } catch (e) {
      setStatus('error');
      setMessage('Face verification model could not load. Check your connection and retest.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    streamRef.current?.getTracks().forEach(track => track.stop());
    onNext({ webcamVerified: true, faceCount: faces });
  };

  return (
    <WizardStepLayout
      title="Webcam Verification"
      description="Position your face clearly in the frame. We are verifying that your camera works and only one person is present."
      status={status}
      statusMessage={message}
      actionButton={
        <div className="flex gap-3">
          {status === 'error' && (
            <Button variant="outline" onClick={startCamera}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Retest
            </Button>
          )}
          <Button onClick={handleNext} disabled={status !== 'success'}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
          <div className="relative aspect-video w-full bg-slate-900">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`h-full w-full object-cover transition-opacity duration-500 ${status === 'loading' && !stream ? 'opacity-0' : 'opacity-100'}`}
            />
            {/* Debug canvas overlay */}
            <canvas id="debug-canvas" className="absolute inset-0 h-full w-full object-cover pointer-events-none" />
            
            {status === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
                  <span className="text-sm font-medium text-teal-400">Initializing camera...</span>
                </div>
              </div>
            )}
            {/* Guide overlay */}
            <div className="absolute inset-0 border-[6px] border-transparent" style={{ borderColor: status === 'success' ? 'rgba(20, 184, 166, 0.4)' : status === 'error' ? 'rgba(244, 63, 94, 0.4)' : 'transparent' }}></div>
            <div className="absolute left-1/2 top-1/2 h-[60%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-[100%] border-2 border-dashed border-white/30" />
          </div>
        </div>

        <div className="space-y-3">
          <CheckItem 
            label="Camera Access" 
            icon={Camera}
            passed={!!stream} 
            loading={status === 'loading' && !stream} 
            error={status === 'error' && !stream}
          />
          <CheckItem 
            label="Face Detected" 
            icon={faces === 0 ? UserX : User}
            passed={faces !== null && faces > 0} 
            loading={status === 'loading' && !!stream} 
            error={faces === 0}
          />
          <CheckItem 
            label="Single Face Only" 
            icon={faces > 1 ? Users : User}
            passed={faces === 1} 
            loading={status === 'loading' && !!stream} 
            error={faces > 1}
          />
        </div>
      </div>
    </WizardStepLayout>
  );
}

function CheckItem({ label, icon: Icon, passed, loading, error }) {
  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${passed ? 'border-teal-500/30 bg-teal-500/10' : error ? 'border-rose-500/30 bg-rose-500/10' : 'border-white/10 bg-white/5'}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${passed ? 'text-teal-400' : error ? 'text-rose-400' : 'text-slate-400'}`} />
        <span className="text-sm font-medium text-slate-200">{label}</span>
      </div>
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
      ) : passed ? (
        <span className="text-xs font-semibold text-teal-400">Pass</span>
      ) : error ? (
        <span className="text-xs font-semibold text-rose-400">Fail</span>
      ) : null}
    </div>
  );
}
