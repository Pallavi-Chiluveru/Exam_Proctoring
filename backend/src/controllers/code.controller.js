import { asyncHandler } from '../utils/asyncHandler.js';

export const runCode = asyncHandler(async (req, res) => {
  const { language = 'javascript', code = '' } = req.body;
  const passed = Math.max(1, Math.min(7, Math.floor(code.length / 70) + 1));
  const total = 8;
  res.json({
    language,
    status: passed >= total - 1 ? 'accepted' : 'partial',
    runtimeMs: 38 + code.length,
    memoryMb: 42,
    output: language === 'javascript' ? 'Executed in secure sandbox simulation.' : 'Queued on remote runner simulation.',
    tests: Array.from({ length: total }, (_, index) => ({
      name: index > 4 ? `Hidden ${index - 4}` : `Sample ${index + 1}`,
      hidden: index > 4,
      passed: index < passed,
    })),
  });
});

export const leaderboard = asyncHandler(async (_req, res) => {
  res.json({
    leaderboard: [
      { rank: 1, name: 'Maya Chen', score: 98, language: 'Python', runtime: '41ms' },
      { rank: 2, name: 'Arjun Rao', score: 95, language: 'JavaScript', runtime: '53ms' },
      { rank: 3, name: 'Nora Smith', score: 91, language: 'C++', runtime: '47ms' },
      { rank: 4, name: 'Ishan Mehta', score: 88, language: 'Java', runtime: '68ms' },
    ],
  });
});
