interface CoverageBarProps {
  coverage: number;
  size?: "sm" | "md";
}

export function getCoverageBarColor(coverage: number): string {
  if (coverage < 50) return "bg-red-500";
  if (coverage < 80) return "bg-orange-500";
  if (coverage <= 100) return "bg-green-500";
  return "bg-purple-500";
}

export function CoverageBar({ coverage, size = "md" }: CoverageBarProps) {
  const height = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={`w-full rounded-full bg-gray-200 ${height}`}>
      <div
        className={`${height} rounded-full transition-all duration-300 ${getCoverageBarColor(coverage)}`}
        style={{ width: `${Math.min(coverage, 100)}%` }}
      />
    </div>
  );
}
