const labels = {
  no_face: 'No Face Detected',
  multiple_faces: 'Multiple Faces',
  phone_detected: 'Mobile Phone Detected',
  eye_movement: 'Off-screen Eye Movement',
  gaze_tracking: 'Looking Away',
  audio_anomaly: 'Human Voice Detected',
  multiple_voices: 'Multiple Voices Detected',
  tab_switch: 'Tab Switch',
  fullscreen_exit: 'Fullscreen Exit',
  copy_paste: 'Copy/Paste Attempt',
  right_click: 'Right Click',
  devtools: 'Developer Tools Attempt',
  screen_share_lost: 'Screen Sharing Interrupted',
  window_blur: 'Window Minimized or Focus Lost',
};

const severityByType = {
  no_face: 6,
  multiple_faces: 8,
  phone_detected: 10,
  eye_movement: 5,
  gaze_tracking: 4,
  audio_anomaly: 5,
  multiple_voices: 8,
  tab_switch: 7,
  fullscreen_exit: 8,
  copy_paste: 6,
  right_click: 2,
  devtools: 9,
  screen_share_lost: 8,
  window_blur: 5,
};

function thresholdRisk(value, table) {
  const seconds = Number(value || 0);
  return table.reduce((risk, [limit, points]) => (seconds >= limit ? points : risk), 0);
}

export function getViolationLabel(type) {
  return labels[type] || 'Suspicious Activity';
}

export function computeRiskEvent(session, type, metadata = {}) {
  const previousScore = Number(session.finalRiskScore ?? session.proctor?.riskScore ?? session.proctor?.suspicionScore ?? 0);
  const previousCount = Number(session.violationCounts?.get?.(type) || 0);
  const occurrence = previousCount + 1;
  let riskAdded = 0;
  let disqualifying = false;
  let disqualificationReason = '';
  const alerts = [];

  switch (type) {
    case 'tab_switch':
      riskAdded = occurrence === 1 ? 10 : occurrence === 2 ? 20 : 30;
      if (occurrence >= 3) alerts.push('High Risk Alert');
      break;
    case 'fullscreen_exit':
      riskAdded = occurrence === 1 ? 20 : 30;
      if (occurrence >= 3) {
        disqualifying = true;
        disqualificationReason = 'Fullscreen exited three times.';
      }
      break;
    case 'no_face':
      riskAdded = thresholdRisk(metadata.absentSeconds, [[3, 10], [10, 20], [15, 30]]) || 10;
      break;
    case 'multiple_faces':
      riskAdded = occurrence === 1 ? 25 : 40;
      if (Number(metadata.persistentSeconds || 0) > 10) {
        disqualifying = true;
        disqualificationReason = 'Multiple faces remained visible for more than 10 seconds.';
      }
      break;
    case 'gaze_tracking':
      riskAdded = thresholdRisk(metadata.durationSeconds, [[5, 5], [10, 10], [15, 20]]) || 5;
      break;
    case 'eye_movement':
      riskAdded = metadata.eyeOffscreenOccurrences >= 15 ? 30 : metadata.eyeOffscreenOccurrences >= 10 ? 20 : 10;
      break;
    case 'audio_anomaly':
      riskAdded = occurrence === 1 ? 10 : occurrence === 2 ? 20 : 30;
      break;
    case 'multiple_voices':
      riskAdded = occurrence === 1 ? 25 : 40;
      break;
    case 'phone_detected':
      riskAdded = 40;
      if (occurrence >= 2) {
        disqualifying = true;
        disqualificationReason = 'Mobile phone detected twice.';
      }
      break;
    case 'copy_paste':
      riskAdded = 20;
      break;
    case 'right_click':
      riskAdded = 5;
      break;
    case 'screen_share_lost':
      riskAdded = 30;
      if (occurrence >= 2) {
        disqualifying = true;
        disqualificationReason = 'Screen sharing was disabled repeatedly.';
      }
      break;
    case 'window_blur':
      riskAdded = 15;
      break;
    case 'devtools':
      riskAdded = 30;
      break;
    default:
      riskAdded = 5;
  }

  const riskScoreAfter = Math.min(100, previousScore + riskAdded);
  if (riskScoreAfter >= 75 && !disqualifying) {
    disqualifying = true;
    disqualificationReason = 'Risk score reached 75.';
  }

  return {
    occurrence,
    riskAdded,
    riskScoreAfter,
    severity: Math.min(10, Math.max(1, Math.ceil(riskAdded / 10))),
    disqualifying,
    disqualificationReason,
    alerts,
  };
}

export function createViolationNarrative(type) {
  const copy = {
    no_face: 'AI vision lost the candidate face.',
    multiple_faces: 'Multiple faces appeared inside the webcam frame.',
    phone_detected: 'A mobile-device-like object was detected near the candidate.',
    eye_movement: 'Sustained off-screen gaze pattern detected.',
    head_pose: 'Head pose drifted outside normal exam posture.',
    audio_anomaly: 'Audio anomaly exceeded room baseline.',
    multiple_voices: 'More than one voice pattern was detected in the room audio.',
    tab_switch: 'Candidate moved away from the secure exam tab.',
    fullscreen_exit: 'Fullscreen exam mode was interrupted.',
    copy_paste: 'Copy or paste gesture blocked.',
    right_click: 'Context menu attempt was blocked.',
    devtools: 'Developer tools inspection pattern detected.',
    screen_share_lost: 'Screen sharing stream was lost.',
    window_blur: 'Exam window lost focus or was minimized.',
    gaze_tracking: 'Candidate looked away from the exam screen continuously.',
  };
  return copy[type] || 'Suspicious activity detected.';
}
