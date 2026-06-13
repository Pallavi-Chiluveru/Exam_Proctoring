import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const FACE_OPTIONS = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 });

let faceModelsPromise;
let objectModelPromise;

function loadFaceModels() {
  if (!faceModelsPromise) {
    faceModelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
    ]);
  }
  return faceModelsPromise;
}

// function loadObjectModel() {
//   if (!objectModelPromise) objectModelPromise = cocoSsd.load();
//   return objectModelPromise;
// }

function nowSeconds(startedAt) {
  return Math.floor((Date.now() - startedAt) / 1000);
}

function drawVideoFrame(video) {
  if (!video?.videoWidth || !video?.videoHeight) return null;
  const canvas = document.createElement('canvas');
  canvas.width = Math.min(640, video.videoWidth);
  canvas.height = Math.round((canvas.width / video.videoWidth) * video.videoHeight);
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}

function inferGaze(video, detection) {
  if (!video?.videoWidth || !detection?.detection?.box) return 'center';
  const { box } = detection.detection;
  const faceCenter = box.x + box.width / 2;
  const frameCenter = video.videoWidth / 2;
  const drift = Math.abs(faceCenter - frameCenter) / video.videoWidth;
  return drift > 0.18 ? 'off-screen' : 'center';
}

export function useProctoring(onViolation, options = {}) {
  const enabled = options.enabled ?? true;
  const videoRef = useRef(null);
  const webcamStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const reportRef = useRef(onViolation);
  const stateRef = useRef({
    noFaceStartedAt: null,
    noFaceMilestones: new Set(),
    multiFaceStartedAt: null,
    multiFaceReported: false,
    gazeStartedAt: null,
    gazeMilestones: new Set(),
    eyeOffscreenOccurrences: 0,
    eyeMilestones: new Set(),
    voiceOccurrences: 0,
    multipleVoiceCooldownUntil: 0,
    phoneDetections: 0,
    lastPhoneAt: 0,
    lastVoiceAt: 0,
  });
  const isRequestingScreenRef = useRef(false);
  const [signals, setSignals] = useState({
    camera: 'warming',
    microphone: 'warming',
    screen: 'pending',
    faceCount: 0,
    gaze: 'center',
    headPose: 'neutral',
    audioLevel: 0,
    suspicionScore: 0,
    riskScore: 0,
  });

  useEffect(() => {
    reportRef.current = onViolation;
  }, [onViolation]);

  const report = useCallback((type, metadata = {}) => {
    const webcamEvidence = metadata.webcamEvidence === false ? null : drawVideoFrame(videoRef.current);
    reportRef.current?.(type, { ...metadata, webcamEvidence });
  }, []);

  const requestScreenShare = useCallback(async () => {
    isRequestingScreenRef.current = true;
    try {
      let mediaStream = window.__proctorScreenStream;
      const isReusingStream = mediaStream && mediaStream.active;

      if (!isReusingStream) {
        mediaStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
          audio: false,
        });
      }
      
      // Clear the global reference after claiming it
      window.__proctorScreenStream = null;

      const track = mediaStream.getVideoTracks()[0];
      const settings = track?.getSettings?.() || {};
      if (settings.displaySurface && settings.displaySurface !== 'monitor') {
        track.stop();
        setSignals((current) => ({ ...current, screen: 'blocked' }));
        report('screen_share_lost', { reason: 'non_monitor_surface', displaySurface: settings.displaySurface });
        toast.error('Share your entire screen to continue the secure exam.');
        return false;
      }
      screenStreamRef.current?.getTracks().forEach((item) => item.stop());
      screenStreamRef.current = mediaStream;
      setSignals((current) => ({ ...current, screen: 'shared' }));
      track.onended = () => {
        setSignals((current) => ({ ...current, screen: 'lost' }));
        report('screen_share_lost', { reason: 'screen_track_ended' });
        toast.error('Screen sharing stopped. Re-share immediately.');
      };
      return true;
    } catch {
      setSignals((current) => ({ ...current, screen: 'blocked' }));
      report('screen_share_lost', { reason: 'permission_denied' });
      toast.error('Screen sharing is required during the exam.');
      return false;
    } finally {
      // Allow browser UI to settle before re-enabling fullscreen tracking
      setTimeout(() => {
        isRequestingScreenRef.current = false;
      }, 2000);
    }
  }, [report]);

  useEffect(() => {
    let cancelled = false;
    let faceInterval;
    let phoneInterval;
    let audioInterval;
    let healthInterval;

    async function startCameraAndMic(isRecovery = false) {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return false;
        }
        
        if (webcamStreamRef.current) {
          webcamStreamRef.current.getTracks().forEach(t => t.stop());
        }
        
        webcamStreamRef.current = media;
        if (videoRef.current) videoRef.current.srcObject = media;
        setSignals((current) => ({ ...current, camera: 'active', microphone: 'active' }));

        const track = media.getVideoTracks()[0];
        if (track) {
          track.onended = () => {
            setSignals((current) => ({ ...current, camera: 'lost' }));
          };
        }

        if (!isRecovery) {
          const audioContext = new AudioContext();
          const source = audioContext.createMediaStreamSource(media);
          const analyzer = audioContext.createAnalyser();
          analyzer.fftSize = 2048;
          source.connect(analyzer);
          audioContextRef.current = audioContext;
          analyzerRef.current = analyzer;
        }
        return true;
      } catch {
        setSignals((current) => ({ ...current, camera: 'blocked', microphone: 'blocked' }));
        if (!isRecovery) {
           report('no_face', { confidence: 1, absentSeconds: 3, reason: 'camera_or_microphone_blocked', webcamEvidence: false });
           toast.error('Camera and microphone permissions are required.');
        }
        return false;
      }
    }

    function startHardwareHealthMonitoring() {
      let cameraLostSince = null;
      let isRecovering = false;

      healthInterval = window.setInterval(async () => {
        const stream = webcamStreamRef.current;
        const track = stream?.getVideoTracks()[0];
        
        const isHealthy = stream && stream.active && track && track.readyState === 'live' && track.enabled;

        if (!isHealthy) {
          if (!cameraLostSince) {
            cameraLostSince = Date.now();
          }

          const offlineSeconds = (Date.now() - cameraLostSince) / 1000;

          if (offlineSeconds > 5 && !isRecovering) {
             setSignals((current) => ({ ...current, camera: 'lost' }));
          }

          if (!isRecovering) {
            isRecovering = true;
            try {
              const recovered = await startCameraAndMic(true);
              if (recovered) {
                cameraLostSince = null;
              }
            } finally {
              isRecovering = false;
            }
          }
        } else {
          cameraLostSince = null;
        }
      }, 2000);
    }

    async function startFaceMonitoring() {
      await loadFaceModels();
      faceInterval = window.setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        const detections = await faceapi.detectAllFaces(video, FACE_OPTIONS).withFaceLandmarks(true);
        const count = detections.length;
        const scan = stateRef.current;

        setSignals((current) => ({
          ...current,
          faceCount: count,
        }));

        if (count === 0) {
          scan.noFaceStartedAt ||= Date.now();
          const absentSeconds = nowSeconds(scan.noFaceStartedAt);
          [3, 10, 15].forEach((milestone) => {
            if (absentSeconds >= milestone && !scan.noFaceMilestones.has(milestone)) {
              scan.noFaceMilestones.add(milestone);
              report('no_face', { absentSeconds: milestone, confidence: 0.96 });
            }
          });
          scan.gazeStartedAt = null;
          scan.gazeMilestones.clear();
          return;
        }

        scan.noFaceStartedAt = null;
        scan.noFaceMilestones.clear();

        if (count > 1) {
          scan.multiFaceStartedAt ||= Date.now();
          const persistentSeconds = nowSeconds(scan.multiFaceStartedAt);
          if (!scan.multiFaceReported) {
            scan.multiFaceReported = true;
            report('multiple_faces', { faceCount: count, persistentSeconds, confidence: 0.95 });
          } else if (persistentSeconds > 10) {
            report('multiple_faces', { faceCount: count, persistentSeconds, confidence: 0.98 });
          }
          return;
        }

        scan.multiFaceStartedAt = null;
        scan.multiFaceReported = false;

        const gaze = inferGaze(video, detections[0]);
        setSignals((current) => ({ ...current, gaze }));
        if (gaze === 'off-screen') {
          scan.gazeStartedAt ||= Date.now();
          scan.eyeOffscreenOccurrences += 1;
          const durationSeconds = nowSeconds(scan.gazeStartedAt);
          [5, 10, 15].forEach((milestone) => {
            if (durationSeconds >= milestone && !scan.gazeMilestones.has(milestone)) {
              scan.gazeMilestones.add(milestone);
              report('gaze_tracking', { durationSeconds: milestone, confidence: 0.82 });
            }
          });
          [5, 10, 15].forEach((milestone) => {
            if (scan.eyeOffscreenOccurrences >= milestone && !scan.eyeMilestones.has(milestone)) {
              scan.eyeMilestones.add(milestone);
              report('eye_movement', { eyeOffscreenOccurrences: milestone, confidence: 0.8 });
            }
          });
        } else {
          scan.gazeStartedAt = null;
          scan.gazeMilestones.clear();
        }
      }, 1000);
    }

    // async function startPhoneMonitoring() {
    //   const model = await loadObjectModel();
    //   phoneInterval = window.setInterval(async () => {
    //     const video = videoRef.current;
    //     if (!video || video.readyState < 2) return;
    //     const predictions = await model.detect(video);
    //     const phone = predictions.find((item) => item.class === 'cell phone' && item.score >= 0.55);
    //     if (!phone) return;
    //     const scan = stateRef.current;
    //     if (Date.now() - scan.lastPhoneAt < 5000) return;
    //     scan.lastPhoneAt = Date.now();
    //     scan.phoneDetections += 1;
    //     report('phone_detected', {
    //       confidence: phone.score,
    //       label: phone.class,
    //       bbox: phone.bbox,
    //       detectionCount: scan.phoneDetections,
    //     });
    //   }, 2500);
    // }

    function startAudioMonitoring() {
      audioInterval = window.setInterval(() => {
        const analyzer = analyzerRef.current;
        if (!analyzer) return;
        const data = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(data);
        const speechBins = data.slice(8, 80);
        const level = Math.round(speechBins.reduce((sum, value) => sum + value, 0) / speechBins.length);
        const strongPeaks = speechBins.filter((value) => value > 128).length;
        const speechLike = level > 34 && strongPeaks > 5;
        const scan = stateRef.current;

        setSignals((current) => ({
          ...current,
          audioLevel: level,
          microphone: speechLike ? 'noisy' : 'active',
        }));

        if (speechLike && Date.now() - scan.lastVoiceAt > 6500) {
          scan.lastVoiceAt = Date.now();
          scan.voiceOccurrences += 1;
          report('audio_anomaly', { audioLevel: level, voiceOccurrences: scan.voiceOccurrences, confidence: Math.min(0.98, 0.68 + level / 180), webcamEvidence: false });
        }

        if (speechLike && strongPeaks > 20 && Date.now() > scan.multipleVoiceCooldownUntil) {
          scan.multipleVoiceCooldownUntil = Date.now() + 12000;
          report('multiple_voices', { audioLevel: level, overlappingSpeechPeaks: strongPeaks, confidence: 0.7, webcamEvidence: false });
        }
      }, 750);
    }

    if (!enabled) return undefined;

    startCameraAndMic(false).then((success) => {
      if (cancelled) return;
      if (success) {
        startHardwareHealthMonitoring();
      }
      startFaceMonitoring().catch(() => toast.error('Face monitoring model failed to load.'));
      // startPhoneMonitoring().catch(() => toast.error('Phone detection model failed to load.'));
      startAudioMonitoring();
      requestScreenShare();
    });

    return () => {
      cancelled = true;
      window.clearInterval(faceInterval);
      window.clearInterval(phoneInterval);
      window.clearInterval(audioInterval);
      window.clearInterval(healthInterval);
      webcamStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => null);
      }
    };
  }, [enabled, report, requestScreenShare]);

  useEffect(() => {
    if (!enabled) return undefined;

    const visibility = () => {
      if (document.hidden) report('tab_switch', { hidden: true, confidence: 1, webcamEvidence: false });
    };
    const fullscreen = () => {
      if (!document.fullscreenElement) {
        // Only report a violation if we are NOT currently requesting a screen share
        // The browser temporarily forces fullscreen exit during the permission dialog
        if (!isRequestingScreenRef.current) {
          report('fullscreen_exit', { confidence: 1, webcamEvidence: false });
        }
        toast.error('Fullscreen is required. Return to fullscreen immediately.');
      }
    };
    const focusLost = () => report('window_blur', { confidence: 0.9, webcamEvidence: false });
    const blockClipboard = (event) => {
      event.preventDefault();
      report('copy_paste', { action: event.type, confidence: 1, webcamEvidence: false });
    };
    const blockContextMenu = (event) => {
      event.preventDefault();
      report('right_click', { confidence: 1, webcamEvidence: false });
    };
    const blockUnload = (event) => {
      report('fullscreen_exit', { reason: 'page_reload_attempt', confidence: 1, webcamEvidence: false });
    };
    const keys = (event) => {
      const key = event.key?.toLowerCase();
      const clipboard = event.ctrlKey && ['c', 'v', 'x'].includes(key);
      const devtools = event.key === 'F12' || (event.ctrlKey && event.shiftKey && key === 'i');
      if (clipboard || devtools) event.preventDefault();
      if (clipboard) report('copy_paste', { action: `ctrl_${key}`, confidence: 1, webcamEvidence: false });
      if (devtools) report('devtools', { action: event.key === 'F12' ? 'f12' : 'ctrl_shift_i', confidence: 1, webcamEvidence: false });
    };

    document.addEventListener('visibilitychange', visibility);
    document.addEventListener('fullscreenchange', fullscreen);
    window.addEventListener('blur', focusLost);
    document.addEventListener('copy', blockClipboard);
    document.addEventListener('cut', blockClipboard);
    document.addEventListener('paste', blockClipboard);
    document.addEventListener('contextmenu', blockContextMenu);
    window.addEventListener('beforeunload', blockUnload);
    document.addEventListener('keydown', keys, true);

    return () => {
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('fullscreenchange', fullscreen);
      window.removeEventListener('blur', focusLost);
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      document.removeEventListener('paste', blockClipboard);
      document.removeEventListener('contextmenu', blockContextMenu);
      window.removeEventListener('beforeunload', blockUnload);
      document.removeEventListener('keydown', keys, true);
    };
  }, [enabled, report]);

  return { videoRef, signals, setSignals, requestScreenShare };
}
