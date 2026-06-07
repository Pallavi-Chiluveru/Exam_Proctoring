import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export function useProctoring(onViolation) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [signals, setSignals] = useState({
    camera: 'warming',
    microphone: 'warming',
    screen: 'pending',
    faceCount: 1,
    gaze: 'center',
    headPose: 'neutral',
    audioLevel: 18,
    suspicionScore: 12,
  });

  useEffect(() => {
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: true, audio: true })
      .then((media) => {
        if (cancelled) return;
        setStream(media);
        if (videoRef.current) videoRef.current.srcObject = media;
        setSignals((current) => ({ ...current, camera: 'active', microphone: 'active' }));
      })
      .catch(() => {
        setSignals((current) => ({ ...current, camera: 'blocked', microphone: 'blocked', suspicionScore: current.suspicionScore + 20 }));
        toast.error('Camera or microphone permission blocked');
        onViolation?.('no_face', { confidence: 0.82 });
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSignals((current) => {
        const audioLevel = Math.max(8, Math.min(86, current.audioLevel + Math.round(Math.random() * 18 - 7)));
        const noisy = audioLevel > 68;
        if (noisy) onViolation?.('audio_anomaly', { confidence: 0.72, audioLevel });
        return {
          ...current,
          audioLevel,
          gaze: Math.random() > 0.86 ? 'off-screen' : 'center',
          headPose: Math.random() > 0.9 ? 'tilted' : 'neutral',
          suspicionScore: Math.min(96, Math.max(8, current.suspicionScore + (noisy ? 5 : Math.round(Math.random() * 4 - 1)))),
        };
      });
    }, 4500);

    const visibility = () => {
      if (document.hidden) onViolation?.('tab_switch', { confidence: 0.95 });
    };
    const fullscreen = () => {
      if (!document.fullscreenElement) onViolation?.('fullscreen_exit', { confidence: 0.91 });
    };
    const block = (event) => event.preventDefault();

    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('fullscreenchange', fullscreen);
    document.addEventListener('contextmenu', block);
    document.addEventListener('copy', block);
    document.addEventListener('paste', block);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('fullscreenchange', fullscreen);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('copy', block);
      document.removeEventListener('paste', block);
    };
  }, [onViolation]);

  return { videoRef, signals, setSignals };
}
