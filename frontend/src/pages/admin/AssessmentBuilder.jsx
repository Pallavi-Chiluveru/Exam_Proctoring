import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Save, Eye, ArrowLeft, ArrowRight, Plus, Copy, Trash2, 
  Settings, Code, AlignLeft, CheckSquare, ListChecks, ChevronRight,
  GripVertical, EyeOff
} from 'lucide-react';
import { Button, Glass, SectionTitle } from '../../components/ui';
import { api } from '../../services/api';

const DEFAULT_QUESTION_TEMPLATES = {
  mcq: { type: 'mcq', title: '', prompt: '', points: 10, difficulty: 'medium', options: ['', '', '', ''], correctAnswers: [], explanation: '' },
  msq: { type: 'msq', title: '', prompt: '', points: 10, difficulty: 'medium', options: ['', '', '', ''], correctAnswers: [], explanation: '' },
  descriptive: { type: 'descriptive', title: '', prompt: '', points: 20, difficulty: 'medium', expectedAnswer: '', keywords: [], explanation: '' },
  coding: { 
    type: 'coding', title: '', prompt: '', points: 50, difficulty: 'hard', 
    language: 'javascript', supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    starterCode: '// Write your code here\n', constraints: '', inputFormat: '', outputFormat: '',
    sampleInput: '', sampleOutput: '', explanation: '',
    testCases: [] 
  }
};

export default function AssessmentBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(id && id !== 'new' ? true : false);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  const [exam, setExam] = useState({
    title: '', category: '', assessmentType: 'Mixed',
    durationMinutes: 60, passingMarks: 50, status: 'draft'
  });
  
  const [questions, setQuestions] = useState([]);
  const [selectedQIdx, setSelectedQIdx] = useState(0);

  useEffect(() => {
    if (id && id !== 'new') {
      api.get(`/exams/${id}`).then(res => {
        const data = res.data.exam;
        setExam({
          title: data.title || '', category: data.category || '',
          assessmentType: data.assessmentType || 'Mixed', durationMinutes: data.durationMinutes || 60,
          passingMarks: data.passingMarks || 50, status: data.status || 'draft'
        });
        setQuestions(data.questions || []);
        setLoading(false);
      }).catch(err => {
        toast.error('Failed to load assessment');
        setLoading(false);
      });
    }
  }, [id]);

  const validateBeforeSave = () => {
    if (!exam.title || exam.title.trim().length < 3) {
      toast.error('Exam Title must be at least 3 characters long (Step 1).');
      return false;
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.type === 'coding' && (!q.title || !q.title.trim())) {
        toast.error(`Question ${i + 1} is missing a title.`);
        return false;
      }
      if (!q.prompt || !q.prompt.trim()) {
        toast.error(`Question ${i + 1} is missing a problem statement/prompt.`);
        return false;
      }
    }
    
    if (exam.durationMinutes < 5) {
      toast.error('Exam duration must be at least 5 minutes.');
      return false;
    }
    
    if (exam.passingMarks > summary.totalMarks) {
      toast.error('Passing Marks cannot exceed Total Marks.');
      return false;
    }
    return true;
  };

  const handlePublishClick = () => {
    if (validateBeforeSave()) {
      setShowPublishModal(true);
    }
  };

  const saveAssessment = async (publish = false) => {
    if (!validateBeforeSave()) return;

    try {
      setSaving(true);
      const payload = {
        ...exam,
        status: publish ? 'scheduled' : 'draft',
        questions: questions
      };
      
      if (id && id !== 'new') {
        await api.patch(`/exams/${id}`, payload);
        toast.success(publish ? 'Assessment Published' : 'Draft Saved');
      } else {
        const res = await api.post('/exams', payload);
        toast.success(publish ? 'Assessment Published' : 'Draft Saved');
        navigate(`/admin/exams/builder/${res.data.exam._id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = (type) => {
    const newQ = JSON.parse(JSON.stringify(DEFAULT_QUESTION_TEMPLATES[type]));
    newQ.title = `Q${questions.length + 1}`;
    setQuestions([...questions, newQ]);
    setSelectedQIdx(questions.length);
  };

  const updateSelectedQ = (updates) => {
    const updated = [...questions];
    updated[selectedQIdx] = { ...updated[selectedQIdx], ...updates };
    setQuestions(updated);
  };

  const summary = useMemo(() => {
    let mcq = 0, msq = 0, coding = 0, descriptive = 0;
    let easy = 0, medium = 0, hard = 0;
    let totalMarks = 0;
    
    questions.forEach(q => {
      totalMarks += (q.points || 0);
      if (q.type === 'mcq') mcq++;
      if (q.type === 'msq') msq++;
      if (q.type === 'coding') coding++;
      if (q.type === 'descriptive') descriptive++;
      
      if (q.difficulty === 'easy') easy++;
      if (q.difficulty === 'medium') medium++;
      if (q.difficulty === 'hard') hard++;
    });

    return { totalQuestions: questions.length, totalMarks, mcq, msq, coding, descriptive, easy, medium, hard };
  }, [questions]);

  const removeQuestion = (idx) => {
    const updated = questions.filter((_, i) => i !== idx);
    setQuestions(updated);
    if (selectedQIdx >= updated.length) setSelectedQIdx(Math.max(0, updated.length - 1));
  };

  const duplicateQuestion = (idx) => {
    const clone = JSON.parse(JSON.stringify(questions[idx]));
    clone.title = `Q${questions.length + 1}`;
    setQuestions([...questions, clone]);
    setSelectedQIdx(questions.length);
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Assessment Builder...</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mt-4">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between bg-slate-900/50 p-4 border-b border-white/10 rounded-t-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => navigate('/admin/exams')}><ArrowLeft className="w-4 h-4" /></Button>
          <div>
            <h2 className="font-bold text-white flex items-center gap-2">
              {exam.title || 'Untitled Assessment'}
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${exam.status === 'draft' ? 'bg-amber-500/20 text-amber-400' : 'bg-teal-500/20 text-teal-400'}`}>
                {exam.status}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Step {activeStep} of 2: {activeStep === 1 ? 'Assessment Details' : 'Question Builder'}</p>
          </div>
        </div>
        
        {activeStep === 2 && (
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-300 font-medium bg-slate-950 px-5 py-2 rounded-xl border border-white/5 shadow-sm">
            <div>Questions: <span className="text-white font-bold">{summary.totalQuestions}</span></div>
            <div className="w-px h-4 bg-white/10"></div>
            <div>Total Marks: <span className="text-white font-bold">{summary.totalMarks}</span></div>
            <div className="w-px h-4 bg-white/10"></div>
            <div>Status: <span className={`font-bold ${exam.status === 'draft' ? 'text-amber-400' : 'text-teal-400'}`}>{exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}</span></div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => saveAssessment(false)} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> Save Draft
          </Button>
          <Button onClick={handlePublishClick} disabled={saving}>
            <Eye className="w-4 h-4 mr-2" /> Publish
          </Button>
        </div>
      </div>

      {/* WORKSPACE CONTENT */}
      <div className="flex-1 overflow-hidden relative flex">
        {activeStep === 1 ? (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-teal-400" /> Assessment Configuration
            </h3>
            <Glass className="p-6 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="field col-span-2"><span>Exam Title</span>
                  <div><input value={exam.title} onChange={(e) => setExam({...exam, title: e.target.value})} placeholder="e.g., Senior Frontend Engineering Test" /></div>
                </label>
                <label className="field"><span>Category / Subject</span>
                  <div><input value={exam.category} onChange={(e) => setExam({...exam, category: e.target.value})} placeholder="e.g., React & Redux" /></div>
                </label>
                <label className="field"><span>Assessment Type</span>
                  <div>
                    <select value={exam.assessmentType} onChange={(e) => setExam({...exam, assessmentType: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-teal-500">
                      <option value="Mixed">Mixed (All Types)</option>
                      <option value="MCQ Only">MCQ Only</option>
                      <option value="Coding Only">Coding Only</option>
                      <option value="Descriptive Only">Descriptive Only</option>
                    </select>
                  </div>
                </label>
                <label className="field"><span>Duration (Minutes)</span>
                  <div><input type="number" value={exam.durationMinutes} onChange={(e) => setExam({...exam, durationMinutes: Number(e.target.value)})} /></div>
                </label>
                <label className="field"><span>Passing Marks</span>
                  <div><input type="number" value={exam.passingMarks} onChange={(e) => setExam({...exam, passingMarks: Number(e.target.value)})} /></div>
                </label>
              </div>
            </Glass>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setActiveStep(2)}>Continue to Questions <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 h-full overflow-hidden">
            {/* LEFT SIDEBAR: QUESTION LIST */}
            <div className="w-72 bg-slate-900/50 border-r border-white/10 flex flex-col">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h4 className="font-semibold text-sm">Questions ({questions.length})</h4>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {questions.map((q, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedQIdx(idx)}
                    className={`p-3 rounded-lg border cursor-pointer transition flex items-start gap-3 group ${selectedQIdx === idx ? 'bg-teal-500/10 border-teal-500/50' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="mt-0.5 text-slate-500 group-hover:text-white transition">
                      {q.type === 'mcq' ? <CheckSquare className="w-4 h-4" /> : q.type === 'msq' ? <ListChecks className="w-4 h-4" /> : q.type === 'coding' ? <Code className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${selectedQIdx === idx ? 'text-teal-400' : 'text-slate-200'}`}>{q.title || `Question ${idx + 1}`}</p>
                      <p className="text-xs text-slate-500 capitalize">{q.type} • {q.points} pts</p>
                    </div>
                  </div>
                ))}
                {questions.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-lg mt-4">
                    No questions added yet.
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-slate-950">
                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Add Question</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" className="h-8 text-xs px-2" onClick={() => addQuestion('mcq')}><Plus className="w-3 h-3 mr-1" /> MCQ</Button>
                  <Button variant="secondary" className="h-8 text-xs px-2" onClick={() => addQuestion('msq')}><Plus className="w-3 h-3 mr-1" /> MSQ</Button>
                  <Button variant="secondary" className="h-8 text-xs px-2" onClick={() => addQuestion('descriptive')}><Plus className="w-3 h-3 mr-1" /> Essay</Button>
                  <Button variant="secondary" className="h-8 text-xs px-2" onClick={() => addQuestion('coding')}><Plus className="w-3 h-3 mr-1" /> Code</Button>
                </div>
              </div>
            </div>

            {/* RIGHT WORKSPACE: EDITOR */}
            <div className="flex-1 overflow-y-auto bg-slate-950 p-6">
              {questions.length > 0 && selectedQIdx < questions.length ? (
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      Edit {questions[selectedQIdx].type.toUpperCase()} Question
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => duplicateQuestion(selectedQIdx)} className="h-8 px-2 text-slate-400 hover:text-white"><Copy className="w-4 h-4 mr-2"/> Duplicate</Button>
                      <Button variant="ghost" onClick={() => removeQuestion(selectedQIdx)} className="h-8 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"><Trash2 className="w-4 h-4 mr-2"/> Delete</Button>
                    </div>
                  </div>

                  {/* COMMON FIELDS */}
                  <Glass className="p-6 space-y-6">
                    <div className="grid gap-6 sm:grid-cols-3">
                      {questions[selectedQIdx].type === 'coding' && (
                        <label className="field col-span-2 sm:col-span-3"><span>Problem Title</span>
                          <div><input value={questions[selectedQIdx].title} onChange={(e) => updateSelectedQ({ title: e.target.value })} /></div>
                        </label>
                      )}
                      <label className="field col-span-2 sm:col-span-3"><span>{questions[selectedQIdx].type === 'coding' ? 'Problem Statement' : 'Question'}</span>
                        <div><textarea rows="4" value={questions[selectedQIdx].prompt} onChange={(e) => updateSelectedQ({ prompt: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white" /></div>
                      </label>
                      <label className="field"><span>Points / Marks</span>
                        <div><input type="number" value={questions[selectedQIdx].points} onChange={(e) => updateSelectedQ({ points: Number(e.target.value) })} /></div>
                      </label>
                      <label className="field"><span>Difficulty</span>
                        <div>
                          <select value={questions[selectedQIdx].difficulty} onChange={(e) => updateSelectedQ({ difficulty: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-2.5 text-sm text-white">
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </label>
                    </div>
                  </Glass>

                  {/* TYPE SPECIFIC FIELDS */}
                  {(questions[selectedQIdx].type === 'mcq' || questions[selectedQIdx].type === 'msq') && (
                    <Glass className="p-6">
                      <h4 className="font-semibold text-sm mb-4">Options & Answers</h4>
                      <div className="space-y-4">
                        {questions[selectedQIdx].options.map((opt, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded bg-slate-900 border border-white/10 text-xs font-bold text-slate-400">
                              {String.fromCharCode(65 + i)}
                            </div>
                            <input 
                              className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...questions[selectedQIdx].options];
                                const oldVal = newOpts[i];
                                newOpts[i] = e.target.value;
                                
                                let newCorrect = [...(questions[selectedQIdx].correctAnswers || [])];
                                if (newCorrect.includes(oldVal)) {
                                  newCorrect = newCorrect.map(c => c === oldVal ? e.target.value : c);
                                }
                                
                                updateSelectedQ({ options: newOpts, correctAnswers: newCorrect });
                              }}
                              placeholder={`Option ${i + 1}`}
                            />
                            {questions[selectedQIdx].type === 'mcq' ? (
                              <input 
                                type="radio" 
                                name={`q-${selectedQIdx}-ans`} 
                                checked={questions[selectedQIdx].correctAnswers?.includes(opt)}
                                onChange={() => updateSelectedQ({ correctAnswers: [opt] })}
                                className="w-4 h-4 accent-teal-500"
                              />
                            ) : (
                              <input 
                                type="checkbox" 
                                checked={questions[selectedQIdx].correctAnswers?.includes(opt)}
                                onChange={(e) => {
                                  let current = [...(questions[selectedQIdx].correctAnswers || [])];
                                  if (e.target.checked) current.push(opt);
                                  else current = current.filter(c => c !== opt);
                                  updateSelectedQ({ correctAnswers: current });
                                }}
                                className="w-4 h-4 accent-teal-500 rounded"
                              />
                            )}
                          </div>
                        ))}
                        <Button variant="secondary" className="mt-2 text-xs" onClick={() => updateSelectedQ({ options: [...questions[selectedQIdx].options, ''] })}>
                          <Plus className="w-3 h-3 mr-1" /> Add Option
                        </Button>
                      </div>
                    </Glass>
                  )}

                  {questions[selectedQIdx].type === 'descriptive' && (
                    <Glass className="p-6 space-y-6">
                      <h4 className="font-semibold text-sm mb-4">Evaluation Criteria</h4>
                      <label className="field"><span>Expected Answer (Model Answer)</span>
                        <div><textarea rows="4" value={questions[selectedQIdx].expectedAnswer || ''} onChange={(e) => updateSelectedQ({ expectedAnswer: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white" /></div>
                      </label>
                      <label className="field"><span>Keywords (Comma separated)</span>
                        <div>
                          <input 
                            value={(questions[selectedQIdx].keywords || []).join(', ')} 
                            onChange={(e) => updateSelectedQ({ keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })} 
                            placeholder="e.g., polymorphism, inheritance, encapsulation" 
                          />
                        </div>
                      </label>
                    </Glass>
                  )}

                  {questions[selectedQIdx].type === 'coding' && (
                    <div className="space-y-6">
                      <Glass className="p-6 grid gap-6 sm:grid-cols-2">
                        <h4 className="font-semibold text-sm col-span-2">Problem Configuration</h4>
                        <label className="field col-span-2"><span>Constraints</span>
                          <div><textarea rows="2" value={questions[selectedQIdx].constraints || ''} onChange={(e) => updateSelectedQ({ constraints: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="e.g., 1 <= N <= 10^5" /></div>
                        </label>
                        <label className="field"><span>Sample Input</span>
                          <div><textarea rows="3" value={questions[selectedQIdx].sampleInput || ''} onChange={(e) => updateSelectedQ({ sampleInput: e.target.value })} className="w-full bg-slate-950 font-mono border border-white/10 rounded-lg p-3 text-sm text-white" /></div>
                        </label>
                        <label className="field"><span>Sample Output</span>
                          <div><textarea rows="3" value={questions[selectedQIdx].sampleOutput || ''} onChange={(e) => updateSelectedQ({ sampleOutput: e.target.value })} className="w-full bg-slate-950 font-mono border border-white/10 rounded-lg p-3 text-sm text-white" /></div>
                        </label>
                        <label className="field col-span-2"><span>Starter Code</span>
                          <div><textarea rows="6" value={questions[selectedQIdx].starterCode || ''} onChange={(e) => updateSelectedQ({ starterCode: e.target.value })} className="w-full bg-slate-950 font-mono border border-white/10 rounded-lg p-3 text-sm text-teal-400" /></div>
                        </label>
                      </Glass>

                      <Glass className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-sm">Test Cases</h4>
                          <Button variant="secondary" className="h-8 text-xs" onClick={() => {
                            const newTc = [...(questions[selectedQIdx].testCases || []), { input: '', output: '', hidden: false }];
                            updateSelectedQ({ testCases: newTc });
                          }}>
                            <Plus className="w-3 h-3 mr-1" /> Add Test Case
                          </Button>
                        </div>
                        <div className="space-y-4">
                          {(questions[selectedQIdx].testCases || []).map((tc, tcIdx) => (
                            <div key={tcIdx} className="border border-white/10 rounded-lg p-4 bg-slate-900/50 relative group">
                              <div className="absolute top-4 right-4 flex gap-2">
                                <Button variant="ghost" className="h-6 px-2 py-0 text-[10px]" onClick={() => {
                                  const updated = [...questions[selectedQIdx].testCases];
                                  updated[tcIdx].hidden = !updated[tcIdx].hidden;
                                  updateSelectedQ({ testCases: updated });
                                }}>
                                  {tc.hidden ? <EyeOff className="w-3 h-3 mr-1 text-rose-400" /> : <Eye className="w-3 h-3 mr-1 text-teal-400" />}
                                  {tc.hidden ? 'Hidden' : 'Visible'}
                                </Button>
                                <Button variant="ghost" className="h-6 w-6 p-0 text-rose-400 hover:bg-rose-500/20" onClick={() => {
                                  const updated = [...questions[selectedQIdx].testCases];
                                  updated.splice(tcIdx, 1);
                                  updateSelectedQ({ testCases: updated });
                                }}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <h5 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Test Case {tcIdx + 1}</h5>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <label className="field"><span>Input</span>
                                  <div><textarea rows="2" value={tc.input} onChange={(e) => {
                                    const updated = [...questions[selectedQIdx].testCases];
                                    updated[tcIdx].input = e.target.value;
                                    updateSelectedQ({ testCases: updated });
                                  }} className="w-full bg-slate-950 font-mono border border-white/10 rounded-lg p-2 text-xs text-white" /></div>
                                </label>
                                <label className="field"><span>Expected Output</span>
                                  <div><textarea rows="2" value={tc.output} onChange={(e) => {
                                    const updated = [...questions[selectedQIdx].testCases];
                                    updated[tcIdx].output = e.target.value;
                                    updateSelectedQ({ testCases: updated });
                                  }} className="w-full bg-slate-950 font-mono border border-white/10 rounded-lg p-2 text-xs text-white" /></div>
                                </label>
                              </div>
                            </div>
                          ))}
                          {(!questions[selectedQIdx].testCases || questions[selectedQIdx].testCases.length === 0) && (
                            <p className="text-xs text-slate-500 text-center py-4">No test cases defined. Code cannot be evaluated automatically.</p>
                          )}
                        </div>
                      </Glass>
                    </div>
                  )}
                  
                  {/* EXPLANATION */}
                  <Glass className="p-6">
                    <label className="field"><span>Explanation / Solution (Visible after exam)</span>
                      <div><textarea rows="3" value={questions[selectedQIdx].explanation || ''} onChange={(e) => updateSelectedQ({ explanation: e.target.value })} className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-sm text-white" placeholder="Explain the correct approach..." /></div>
                    </label>
                  </Glass>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center border border-white/5 mb-6">
                    <AlignLeft className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Build Your Assessment</h3>
                  <p className="text-sm text-slate-400 mb-8">Select a question type from the sidebar to start building your assessment. You can add MCQs, descriptive essays, and automated coding challenges.</p>
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => addQuestion('mcq')}><Plus className="w-4 h-4 mr-2" /> Add MCQ</Button>
                    <Button onClick={() => addQuestion('coding')}><Code className="w-4 h-4 mr-2" /> Add Coding Question</Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* RIGHT SIDEBAR: ASSESSMENT SUMMARY CARD */}
            <div className="w-72 bg-slate-900/50 border-l border-white/10 p-5 flex flex-col overflow-y-auto hidden lg:flex">
              <h4 className="font-semibold text-sm mb-5 text-white">Assessment Summary</h4>
              
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span>MCQ Questions</span>
                  <span className="font-bold text-white">{summary.mcq}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span>MSQ Questions</span>
                  <span className="font-bold text-white">{summary.msq}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span>Coding Questions</span>
                  <span className="font-bold text-white">{summary.coding}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span>Descriptive Questions</span>
                  <span className="font-bold text-white">{summary.descriptive}</span>
                </div>
              </div>

              <div className="my-5 border-t border-white/10" />
              
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between items-center bg-teal-500/10 p-2.5 rounded-lg border border-teal-500/20">
                  <span className="font-medium text-teal-400">Total Questions</span>
                  <span className="font-bold text-teal-400">{summary.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                  <span className="font-medium text-emerald-400">Total Marks</span>
                  <span className="font-bold text-emerald-400">{summary.totalMarks}</span>
                </div>
              </div>

              <div className="my-5 border-t border-white/10" />

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400"></div> Easy Questions</span>
                  <span className="font-bold text-white">{summary.easy}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> Medium Questions</span>
                  <span className="font-bold text-white">{summary.medium}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-white/5">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-400"></div> Hard Questions</span>
                  <span className="font-bold text-white">{summary.hard}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRE-PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Assessment Overview</h3>
              <p className="text-sm text-slate-400 mt-1">Review the details before publishing.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-xs text-slate-400 font-medium mb-1">Total Questions</p>
                  <p className="text-2xl font-bold text-white">{summary.totalQuestions}</p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 text-center">
                  <p className="text-xs text-slate-400 font-medium mb-1">Total Marks</p>
                  <p className="text-2xl font-bold text-white">{summary.totalMarks}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Estimated Duration</span>
                  <span className="text-white font-medium">{exam.durationMinutes} Minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Passing Marks</span>
                  <span className="text-white font-medium">{exam.passingMarks}</span>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-4 space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty Distribution</p>
                <div className="flex gap-2">
                  <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 text-center">
                    <p className="text-emerald-400 text-xs font-medium">Easy</p>
                    <p className="text-emerald-400 font-bold">{summary.easy}</p>
                  </div>
                  <div className="flex-1 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2 text-center">
                    <p className="text-amber-400 text-xs font-medium">Medium</p>
                    <p className="text-amber-400 font-bold">{summary.medium}</p>
                  </div>
                  <div className="flex-1 bg-rose-500/10 border border-rose-500/20 rounded-lg p-2 text-center">
                    <p className="text-rose-400 text-xs font-medium">Hard</p>
                    <p className="text-rose-400 font-bold">{summary.hard}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-slate-950 flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowPublishModal(false)}>Cancel</Button>
              <Button onClick={() => {
                setShowPublishModal(false);
                saveAssessment(true);
              }} disabled={saving}>
                Confirm Publish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
