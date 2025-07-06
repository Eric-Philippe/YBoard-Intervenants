interface HelpTipProps {
  groupedDataLength: number;
}

export function HelpTip({ groupedDataLength }: HelpTipProps) {
  if (groupedDataLength === 0) return null;

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-blue-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">💡 Astuce</h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>
              Cliquez sur le nom d&apos;un module (🔍) pour accéder directement
              à ses détails complets !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
