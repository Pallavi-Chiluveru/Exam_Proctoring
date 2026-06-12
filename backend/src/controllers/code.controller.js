import { evaluateCode } from '../services/codeRunner.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const runCode = asyncHandler(async (req, res) => {
  const { language = 'javascript', code = '', testCases = [] } = req.body;
  
  if (!testCases || testCases.length === 0) {
     return res.status(400).json({ message: 'No test cases provided for evaluation.' });
  }

  const evaluation = await evaluateCode(code, language, testCases);

  res.json({
    language,
    status: evaluation.overallStatus,
    runtimeMs: evaluation.totalRuntimeMs,
    memoryMb: 42, // Mocked for now
    output: evaluation.overallStatus === 'accepted' ? 'All test cases passed.' : 'Some test cases failed.',
    tests: evaluation.results.map((r, index) => ({
      name: r.hidden ? `Hidden ${index}` : `Sample ${index + 1}`,
      hidden: r.hidden,
      passed: r.passed,
      input: r.input,
      expectedOutput: r.expectedOutput,
      actualOutput: r.actualOutput,
      errorOutput: r.errorOutput,
      errorMsg: r.errorMsg
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
