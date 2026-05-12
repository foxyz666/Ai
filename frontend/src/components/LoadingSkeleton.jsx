export default function LoadingSkeleton({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-3 rounded-md"
          style={{ width: `${80 - i * 12}%` }}
        />
      ))}
    </div>
  );
}
