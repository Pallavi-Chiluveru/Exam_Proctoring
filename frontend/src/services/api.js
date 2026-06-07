import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aegis_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const demo = {
  metrics: {
    totalExams: 12,
    activeStudents: 284,
    suspiciousActivities: 37,
    liveSessions: 42,
    averageScore: 81,
  },
  performance: Array.from({ length: 8 }, (_, index) => ({
    name: `W${index + 1}`,
    score: 68 + index * 4 + (index % 2 ? 5 : 0),
    integrity: 96 - index * 2,
  })),
  heatmap: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    risk: Math.round(25 + Math.sin(hour / 3) * 18 + (hour % 4) * 7),
  })),
  exams: [
    {
      _id: 'demo-exam',
      title: 'Advanced Algorithms and Systems Design',
      category: 'Coding Round',
      status: 'live',
      durationMinutes: 120,
      startsAt: new Date().toISOString(),
      description: 'Enterprise coding and reasoning assessment with AI proctoring.',
      questions: [
        {
          _id: 'q1',
          type: 'mcq',
          title: 'Distributed cache invalidation',
          prompt: 'Which strategy best minimizes stale reads in a globally distributed cache?',
          options: ['Client-side TTL only', 'Write-through with versioned keys', 'Manual purge windows', 'Randomized eviction'],
        },
        {
          _id: 'q2',
          type: 'coding',
          title: 'Detect anomalous windows',
          prompt: 'Given suspicion scores, return the longest contiguous window whose average is below threshold.',
          language: 'javascript',
          starterCode:
            'function longestCleanWindow(scores, threshold) {\n  // Return the length of the longest valid window\n}\n\nconsole.log(longestCleanWindow([12, 20, 61, 18, 19], 30));',
        },
        {
          _id: 'q3',
          type: 'descriptive',
          title: 'Incident response design',
          prompt: 'Design a low-latency alerting pipeline for live online exam monitoring.',
        },
      ],
    },
  ],
  sessions: [
    { _id: 's1', student: { name: 'Maya Chen', department: 'Data Science' }, exam: { title: 'Advanced Algorithms' }, progress: 72, proctor: { suspicionScore: 64, gaze: 'left', audioLevel: 61, camera: 'active', screen: 'shared' } },
    { _id: 's2', student: { name: 'Arjun Rao', department: 'Computer Science' }, exam: { title: 'Advanced Algorithms' }, progress: 58, proctor: { suspicionScore: 18, gaze: 'center', audioLevel: 22, camera: 'active', screen: 'shared' } },
    { _id: 's3', student: { name: 'Ishan Mehta', department: 'Software Engineering' }, exam: { title: 'Systems Design' }, progress: 91, proctor: { suspicionScore: 27, gaze: 'center', audioLevel: 18, camera: 'active', screen: 'shared' } },
  ],
  violations: [
    { _id: 'v1', type: 'eye_movement', severity: 5, student: { name: 'Maya Chen' }, exam: { title: 'Advanced Algorithms' }, message: 'Sustained off-screen gaze pattern detected.', createdAt: new Date().toISOString() },
    { _id: 'v2', type: 'tab_switch', severity: 7, student: { name: 'Arjun Rao' }, exam: { title: 'Advanced Algorithms' }, message: 'Candidate moved away from secure exam tab.', createdAt: new Date(Date.now() - 500000).toISOString() },
    { _id: 'v3', type: 'audio_anomaly', severity: 6, student: { name: 'Maya Chen' }, exam: { title: 'Advanced Algorithms' }, message: 'Audio anomaly exceeded room baseline.', createdAt: new Date(Date.now() - 720000).toISOString() },
  ],
};
