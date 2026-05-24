interface PermissionStepProps {
  error: string | null
  loading?: boolean
  waitingForBrowser?: boolean
  cameraActive?: boolean
  onRequest: () => void
  onContinue?: () => void
}

export function PermissionStep({
  error,
  loading,
  waitingForBrowser,
  cameraActive,
  onRequest,
  onContinue,
}: PermissionStepProps) {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <h2 className="text-2xl font-semibold tracking-wide text-white">
        Allow camera access
      </h2>

      {waitingForBrowser ? (
        <div className="max-w-md space-y-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-4 text-left">
          <p className="text-sm font-medium text-cyan-200">
            Step 2 — use the Chrome popup
          </p>
          <p className="text-sm text-slate-300">
            Click{' '}
            <strong className="text-white">Allow while visiting the site</strong>{' '}
            in the browser dialog (usually top-left). The page will continue
            automatically.
          </p>
        </div>
      ) : (
        <div className="max-w-md space-y-2 text-slate-400">
          <p className="text-sm">
            <span className="text-slate-300">Step 1:</span> Click the button
            below.
          </p>
          <p className="text-sm">
            <span className="text-slate-300">Step 2:</span> Then allow camera in
            the Chrome popup.
          </p>
          <p className="text-xs">
            Video stays on your device — nothing is uploaded.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {!waitingForBrowser && (
        <button
          type="button"
          onClick={onRequest}
          disabled={loading}
          className="rounded-full bg-violet-600 px-8 py-3 font-medium text-white transition hover:bg-violet-500 disabled:opacity-60"
        >
          {loading ? 'Opening permission…' : 'Enable webcam'}
        </button>
      )}

      {waitingForBrowser && !cameraActive && (
        <p className="animate-pulse text-sm text-slate-500">
          Waiting for permission…
        </p>
      )}

      {cameraActive && onContinue && (
        <div className="space-y-3">
          <p className="text-sm text-emerald-400">Camera is on — ready to continue.</p>
          <button
            type="button"
            onClick={onContinue}
            className="rounded-full bg-violet-600 px-8 py-3 font-medium text-white transition hover:bg-violet-500"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  )
}
