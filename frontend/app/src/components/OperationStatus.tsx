interface OperationStatusProps {
  label: string;
  busy: boolean;
  progress: { percent: number | null; label: string } | null;
  progressName: string;
  error: string | null;
}

export function OperationStatus({
  label, busy, progress, progressName, error,
}: OperationStatusProps) {
  const showProgress = busy || progress !== null;
  const percent = progress?.percent ?? null;
  const message = progress?.label ?? label;
  return (
    <section className="section" aria-label="Operation status">
      <h2 className="section-title">Status</h2>
      <div className="status-row" role="status" aria-live="polite">
        {busy && <span className="spinner" aria-hidden="true" />}
        <span className="status-text">{label}</span>
      </div>
      {showProgress && (
        <div className="progress-block">
          <div className="progress-meta">
            <span>{message}</span>
            <span className="progress-value">{percent === null ? "Working..." : `${percent}%`}</span>
          </div>
          <div className="progress-track" role="progressbar"
            aria-label={progressName} aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={percent ?? undefined}
            aria-valuetext={percent === null ? message : `${message} ${percent}%`}>
            <div className={`progress-fill ${percent === null ? "indeterminate" : ""}`}
              style={percent === null ? undefined : { width: `${percent}%` }} />
          </div>
        </div>
      )}
      {error && <p role="alert" className="error-text">{error}</p>}
    </section>
  );
}
