import React from 'react';

// Simple skeleton placeholders mimicking the exam cards layout.
// Uses Tailwind CSS animation classes. Adjust colors if dark mode changes.
export default function ExamsSkeleton() {
  // Render a grid with three placeholder cards (same as Exams page layout).
  const placeholders = Array.from({ length: 3 });
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {placeholders.map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-5 animate-pulse">
          <div className="h-2 w-3/4 bg-slate-700 rounded" />
          <div className="mt-2 h-4 w-5/6 bg-slate-700 rounded" />
          <div className="mt-4 h-4 w-1/3 bg-slate-700 rounded" />
          <div className="mt-2 h-4 w-1/2 bg-slate-700 rounded" />
          <div className="mt-5 h-10 w-full bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
