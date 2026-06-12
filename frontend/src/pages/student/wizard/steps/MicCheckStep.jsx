import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Mic, RefreshCcw, Volume2 } from 'lucide-react';
import WizardStepLayout from '../WizardStepLayout';
import { Button } from '../../../../components/ui';

export default function MicCheckStep({ onNext }) {
  const [status, setStatus] = useState('loading'); // loading, capturing, success, error
  const [message, setMessage] = useState('Requesting microphone permissions...');
  const [volume, setVolume] = useState(0);
  const [stream, setStream] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  const startMic = async () => {
    setStatus('loading');
    setMessage('Requesting microphone permissions...');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(mediaStream);
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      
      setMessage('Please speak something to test your microphone...');
      
      // Auto success after detecting significant audio (or after a few seconds of testing)
      let audioDetectedCount = 0;
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const average = sum / dataArray.length;
        setVolume(average);

        if (average > 15) {
          audioDetectedCount++;
          if (audioDetectedCount > 20 && status !== 'success') {
            setStatus('success');
            setMessage('Microphone is working perfectly.');
          }
        }
        
        animationRef.current = requestAnimationFrame(updateVolume);
      };
      
      updateVolume();

    } catch (err) {
      setStatus('error');
      setMessage('Microphone permission denied or device not found.');
    }
  };

  useEffect(() => {
    startMic();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => null);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => null);
    }
    onNext({ micVerified: true });
  };

  // Convert volume (0-100ish) to percentage for meter
  const meterWidth = Math.min(100, Math.max(0, (volume / 80) * 100));
  
  // Create an array of blocks for the visualizer
  const blocks = Array.from({ length: 20 }).map((_, i) => i * 5);

  return (
    <WizardStepLayout
      title="Microphone Check"
      description="We need to ensure your audio is clear. Please speak into your microphone to verify."
      status={status === 'success' || status === 'error' ? status : undefined}
      statusMessage={message}
      actionButton={
        <div className="flex gap-3">
          {status === 'error' && (
            <Button variant="outline" onClick={startMic}>
              <RefreshCcw className="mr-2 h-4 w-4" /> Retest
            </Button>
          )}
          <Button onClick={handleNext} disabled={status !== 'success'}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 ${status === 'success' ? 'border-teal-500 bg-teal-500/20 text-teal-400' : status === 'error' ? 'border-rose-500 bg-rose-500/20 text-rose-400' : 'border-slate-500 bg-slate-500/20 text-slate-400'} transition-all duration-300`} style={{ transform: `scale(${1 + volume / 200})` }}>
          {status === 'success' ? <Volume2 className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
        </div>
        
        <h3 className="mb-2 text-lg font-medium text-white">Live Audio Feed</h3>
        <p className="mb-8 text-sm text-slate-400">{message}</p>

        <div className="flex justify-between gap-1 overflow-hidden rounded-lg bg-black/40 p-2">
          {blocks.map((threshold, idx) => {
            const isActive = meterWidth > threshold;
            return (
              <div 
                key={idx} 
                className={`h-8 flex-1 rounded-sm transition-all duration-75 ${
                  isActive 
                    ? idx > 15 ? 'bg-rose-500' : idx > 10 ? 'bg-amber-400' : 'bg-teal-400' 
                    : 'bg-white/10'
                }`}
              />
            );
          })}
        </div>
      </div>
    </WizardStepLayout>
  );
}
