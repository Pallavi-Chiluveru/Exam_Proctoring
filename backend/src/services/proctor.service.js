const severityByType = {
  no_face: 6,
  multiple_faces: 8,
  phone_detected: 9,
  eye_movement: 4,
  head_pose: 4,
  audio_anomaly: 5,
  tab_switch: 7,
  fullscreen_exit: 7,
  copy_paste: 6,
  devtools: 9,
  screen_share_lost: 8,
};

export function scoreViolation(type, metadata = {}) {
  const base = severityByType[type] || 3;
  const confidence = Number(metadata.confidence || 0.75);
  return Math.min(10, Math.max(1, Math.round(base * confidence + base * 0.25)));
}

export function buildSuspicionScore(previousScore, violation) {
  const decay = Math.max(0, previousScore * 0.94);
  return Math.min(100, Math.round(decay + violation.severity * 5.5));
}

export function createViolationNarrative(type) {
  const copy = {
    no_face: 'AI vision lost the candidate face.',
    multiple_faces: 'Multiple faces appeared inside the webcam frame.',
    phone_detected: 'A mobile-device-like object was detected near the candidate.',
    eye_movement: 'Sustained off-screen gaze pattern detected.',
    head_pose: 'Head pose drifted outside normal exam posture.',
    audio_anomaly: 'Audio anomaly exceeded room baseline.',
    tab_switch: 'Candidate moved away from the secure exam tab.',
    fullscreen_exit: 'Fullscreen exam mode was interrupted.',
    copy_paste: 'Copy or paste gesture blocked.',
    devtools: 'Developer tools inspection pattern detected.',
    screen_share_lost: 'Screen sharing stream was lost.',
  };
  return copy[type] || 'Suspicious activity detected.';
}
