'use client';

interface PercentileDisplayProps {
  percentile: number | null;
  loading: boolean;
}

export function PercentileDisplay({
  percentile,
  loading,
}: PercentileDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span>Calculating ranking...</span>
      </div>
    );
  }

  if (percentile === null) {
    return null;
  }

  const roundedPercentile = Math.round(percentile);

  return (
    <div className="rounded-lg bg-muted p-4 text-center">
      <p className="text-sm text-muted-foreground">
        You solved this faster than
      </p>
      <p className="text-3xl font-bold text-primary tabular-nums mt-1">
        {roundedPercentile}%
      </p>
      <p className="text-sm text-muted-foreground mt-1">of players</p>
    </div>
  );
}
