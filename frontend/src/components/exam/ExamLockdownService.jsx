import { useEffect, useState } from 'react';
import { Maximize, MonitorUp, VideoOff } from 'lucide-react';
import { Button } from '../ui';

export function ExamLockdownService({ children, signals, locked, requestScreenShare, monitoringEnabled }) {
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const needsFullscreen = !isFullscreen;
  const needsScreenShare = signals.screen && signals.screen !== 'shared' && signals.screen !== 'pending';
  const cameraLost = signals.camera === 'lost' || signals.camera === 'blocked';

  const isBlocked = monitoringEnabled && !locked && (needsFullscreen || needsScreenShare || cameraLost);

  return (
    <>
      <div className={isBlocked ? 'pointer-events-none select-none blur-sm' : ''}>
        {children}
      </div>

      {monitoringEnabled && !locked && needsFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-rose-950/40 border border-rose-500/20 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Maximize className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Fullscreen Required</h2>
            <p className="text-slate-300">You have exited fullscreen mode. This is a strict violation of exam integrity policies. You must return to fullscreen immediately to continue your exam.</p>
            <Button onClick={() => {
              document.documentElement.requestFullscreen().catch(() => null);
              if (requestScreenShare && signals.screen !== 'shared') requestScreenShare();
            }} className="w-full bg-rose-500 hover:bg-rose-600">
              Return to Fullscreen
            </Button>
          </div>
        </div>
      )}

      {monitoringEnabled && !locked && !needsFullscreen && needsScreenShare && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-amber-950/40 border border-amber-500/20 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MonitorUp className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Screen Share Required</h2>
            <p className="text-slate-300">Your screen sharing session has ended or was interrupted. You must re-share your entire screen to continue the exam.</p>
            <Button onClick={requestScreenShare} className="w-full bg-amber-500 hover:bg-amber-600">
              Resume Screen Sharing
            </Button>
          </div>
        </div>
      )}

      {monitoringEnabled && !locked && !needsFullscreen && !needsScreenShare && cameraLost && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4">
          <div className="max-w-md w-full bg-rose-950/40 border border-rose-500/20 rounded-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <VideoOff className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Camera Disconnected</h2>
            <p className="text-slate-300">Your camera feed was lost. Please check your connection or permissions. You cannot continue the exam without an active camera.</p>
          </div>
        </div>
      )}
    </>
  );
}
