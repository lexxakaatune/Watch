export function VideoSkeleton() {
  return (
    <div className="video-skeleton">
      <div className="skeleton skeleton-thumbnail"></div>
      <div className="flex gap-3 mt-2">
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}></div>
        <div className="flex-1">
          <div className="skeleton skeleton-text mb-2"></div>
          <div className="skeleton skeleton-text-short"></div>
        </div>
      </div>
    </div>
  );
}

export function ShortSkeleton() {
  return (
    <div className="short-card">
      <div className="skeleton w-full h-full"></div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton" style={{ width: 80, height: 14 }}></div>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10 }}></div>
      </div>
      <div className="skeleton" style={{ width: 60, height: 28, marginBottom: 8 }}></div>
      <div className="skeleton" style={{ width: 100, height: 14 }}></div>
    </div>
  );
}
