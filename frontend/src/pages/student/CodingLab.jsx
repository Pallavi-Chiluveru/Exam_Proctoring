import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Trophy } from 'lucide-react';
import { Button, Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';

const starter = 'function longestCleanWindow(scores, threshold) {\n  let best = 0;\n  for (let left = 0; left < scores.length; left++) {\n    let sum = 0;\n    for (let right = left; right < scores.length; right++) {\n      sum += scores[right];\n      const average = sum / (right - left + 1);\n      if (average <= threshold) best = Math.max(best, right - left + 1);\n    }\n  }\n  return best;\n}\n';

export default function CodingLab() {
  const [code, setCode] = useState(starter);
  const [result, setResult] = useState(null);

  async function run() {
    const { data } = await api.post('/code/run', { language: 'javascript', code }).catch(() => ({ data: { status: 'accepted', runtimeMs: 82, memoryMb: 42, output: 'Executed in demo sandbox.', tests: Array.from({ length: 8 }, (_, index) => ({ name: index > 4 ? `Hidden ${index - 4}` : `Sample ${index + 1}`, passed: index !== 6, hidden: index > 4 })) } }));
    setResult(data);
  }

  return (
    <div>
      <SectionTitle eyebrow="Coding round" title="Monaco secure coding lab" action={<StatusPill tone="sky"><Trophy className="mr-1 inline h-3 w-3" /> Rank #2</StatusPill>} />
      <div className="grid gap-4 xl:grid-cols-[1.35fr_.8fr]">
        <Glass className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 p-3"><span className="text-sm font-semibold">JavaScript · Secure sandbox</span><Button onClick={run}><Play className="h-4 w-4" /> Run Code</Button></div>
          <Editor height="620px" theme="vs-dark" language="javascript" value={code} onChange={(value) => setCode(value || '')} options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 18 }, smoothScrolling: true }} />
        </Glass>
        <Glass className="p-5">
          <SectionTitle eyebrow="Execution" title={result ? result.status : 'Awaiting run'} />
          <pre className="min-h-24 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-slate-300">{result?.output || 'Console output will appear here.'}</pre>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3"><p className="text-xs text-slate-400">Runtime</p><p className="text-lg font-semibold">{result?.runtimeMs || 0}ms</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/6 p-3"><p className="text-xs text-slate-400">Memory</p><p className="text-lg font-semibold">{result?.memoryMb || 0}MB</p></div>
          </div>
          <div className="mt-4 space-y-2">
            {(result?.tests || []).map((test) => (
              <div key={test.name} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-sm"><span>{test.name}</span><StatusPill tone={test.passed ? 'teal' : 'rose'}>{test.passed ? 'Passed' : 'Failed'}</StatusPill></div>
            ))}
          </div>
        </Glass>
      </div>
    </div>
  );
}
