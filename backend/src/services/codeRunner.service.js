import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

/**
 * Execute code securely using child_process with timeout.
 * @param {string} code - The source code to run
 * @param {string} language - 'javascript', 'python', etc.
 * @param {string} input - stdin for the process
 * @returns {Promise<{stdout: string, stderr: string, runtimeMs: number, error: string|null}>}
 */
const runCodeSafely = async (code, language, input) => {
  const timeoutMs = 2000; // 2 seconds limit
  let command;
  let args;
  let tmpFilePath;
  let tmpDir = os.tmpdir();
  
  const fileId = crypto.randomBytes(8).toString('hex');

  try {
    if (language === 'javascript') {
      command = 'node';
      tmpFilePath = path.join(tmpDir, `run_${fileId}.js`);
      await fs.writeFile(tmpFilePath, code);
      args = [tmpFilePath];
    } else if (language === 'python') {
      // Use 'python' or 'python3' depending on environment, usually 'python' on Windows
      command = 'python';
      tmpFilePath = path.join(tmpDir, `run_${fileId}.py`);
      await fs.writeFile(tmpFilePath, code);
      args = [tmpFilePath];
    } else if (language === 'cpp') {
       // Mock for cpp if compiler not found
       return { stdout: '', stderr: 'C++ execution is not supported in this local environment yet.', runtimeMs: 0, error: 'Unsupported language' };
    } else if (language === 'java') {
       return { stdout: '', stderr: 'Java execution is not supported in this local environment yet.', runtimeMs: 0, error: 'Unsupported language' };
    } else {
      return { stdout: '', stderr: `Language ${language} is not supported.`, runtimeMs: 0, error: 'Unsupported language' };
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let error = null;

      const proc = spawn(command, args);

      if (input) {
        proc.stdin.write(input);
        proc.stdin.end();
      }

      proc.stdout.on('data', (data) => {
        stdout += data.toString();
        // Prevent huge output attacks
        if (stdout.length > 1024 * 1024) { 
          proc.kill();
          error = 'Output exceeded limit';
        }
      });

      proc.stderr.on('data', (data) => {
        stderr += data.toString();
        if (stderr.length > 1024 * 1024) {
          proc.kill();
          error = 'Error output exceeded limit';
        }
      });

      let timer = setTimeout(() => {
        error = 'Execution Timed Out (2000ms limit)';
        proc.kill();
      }, timeoutMs);

      proc.on('close', (code) => {
        clearTimeout(timer);
        const runtimeMs = Date.now() - startTime;
        if (code !== 0 && !error) {
           error = `Process exited with code ${code}`;
        }
        resolve({ stdout, stderr, runtimeMs, error });
      });
      
      proc.on('error', (err) => {
        clearTimeout(timer);
        resolve({ stdout, stderr, runtimeMs: Date.now() - startTime, error: err.message });
      });
    }).finally(async () => {
      if (tmpFilePath) {
        try {
          await fs.unlink(tmpFilePath);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    });

  } catch (err) {
    return { stdout: '', stderr: '', runtimeMs: 0, error: err.message };
  }
};

/**
 * Evaluates code against multiple test cases
 */
export const evaluateCode = async (code, language, testCases) => {
  if (!testCases || testCases.length === 0) {
    return { passed: 0, total: 0, results: [], overallStatus: 'failed' };
  }

  const results = [];
  let passedCount = 0;
  let totalRuntime = 0;

  for (const tc of testCases) {
    const { stdout, stderr, runtimeMs, error } = await runCodeSafely(code, language, tc.input);
    totalRuntime += runtimeMs;
    
    // Normalize outputs for comparison (trim whitespace, normalize line endings)
    const normalizedActual = stdout.trim().replace(/\r\n/g, '\n');
    const normalizedExpected = (tc.output || '').trim().replace(/\r\n/g, '\n');
    
    const isPassed = !error && normalizedActual === normalizedExpected;
    if (isPassed) passedCount++;

    results.push({
      input: tc.input,
      expectedOutput: tc.output,
      actualOutput: stdout,
      errorOutput: stderr,
      runtimeMs,
      passed: isPassed,
      errorMsg: error,
      hidden: tc.hidden
    });
  }

  return {
    passed: passedCount,
    total: testCases.length,
    results,
    overallStatus: passedCount === testCases.length ? 'accepted' : 'partial',
    totalRuntimeMs: totalRuntime
  };
};
