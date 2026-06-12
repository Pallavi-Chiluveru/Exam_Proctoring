import { ShieldAlert, UserRoundCheck, MonitorX, MicOff, CameraOff, MonitorPlay } from 'lucide-react';
import { Glass, SectionTitle, StatusPill } from '../../components/ui';
import { api } from '../../services/api';
import { useApiResource } from '../../hooks/useApiResource';

export default function Students() {
  const { data } = useApiResource(async () => (await api.get('/admin/students')).data.students, [], []);

  return (
    <div>
      <SectionTitle eyebrow="Roster intelligence" title="Student management" />
      <Glass className="overflow-hidden pb-32">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="p-4">Student</th>
                <th>User ID</th>
                <th>Exams Attempted</th>
                <th>Device Posture</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((student) => {
                const posture = student.devicePosture || { camera: 'active', microphone: 'active', screen: 'shared' };
                const hasWarning = posture.camera !== 'active' || posture.microphone !== 'active' || posture.screen !== 'shared';
                
                return (
                  <tr key={student._id} className="border-b border-white/6 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold overflow-hidden">
                          {student.avatar ? <img src={student.avatar} alt="avatar" className="w-full h-full object-cover"/> : student.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-200">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-mono text-slate-300">{student.candidateId || 'N/A'}</td>
                    <td className="text-slate-300 pl-4">{student.examsAttempted || 0}</td>
                    <td>
                      {student.examsAttempted === 0 ? (
                        <span className="text-slate-500 text-xs uppercase tracking-widest">No Activity</span>
                      ) : hasWarning ? (
                        <div className="flex items-center gap-2 text-rose-400 text-xs uppercase tracking-widest font-semibold">
                          {posture.camera !== 'active' && <CameraOff className="h-4 w-4" title="Camera Missing" />}
                          {posture.microphone !== 'active' && <MicOff className="h-4 w-4" title="Microphone Missing" />}
                          {posture.screen !== 'shared' && <MonitorX className="h-4 w-4" title="Screen Lost" />}
                          Compromised
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-widest font-semibold">
                          <UserRoundCheck className="h-4 w-4" /> Secure
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="group relative inline-block">
                        <StatusPill tone={student.riskScore > 60 ? 'rose' : student.riskScore > 35 ? 'amber' : 'teal'}>
                          <ShieldAlert className="mr-1 inline h-3 w-3" /> {student.riskScore || 0}%
                        </StatusPill>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none z-10 shadow-lg">
                          Based on the student's latest proctored assessment activity.
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Glass>
    </div>
  );
}
