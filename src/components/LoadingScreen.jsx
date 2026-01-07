export default function LoadingScreen({ label = "加载中..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg">
      <div className="rounded-card border border-app-divider bg-app-card px-6 py-4 text-sm font-semibold text-app-muted">
        {label}
      </div>
    </div>
  );
}
