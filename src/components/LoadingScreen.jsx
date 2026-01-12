export default function LoadingScreen({ label = "加载中..." }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p className="mt-4 text-sm font-medium text-text-secondary">{label}</p>
    </div>
  );
}
