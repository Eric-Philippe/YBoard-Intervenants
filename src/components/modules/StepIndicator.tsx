import { LuCheck } from "react-icons/lu";

export interface Step {
  label: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-based index of the active step
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.label} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isActive
                      ? "border-blue-600 bg-white text-blue-600"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isCompleted ? <LuCheck className="h-4 w-4" /> : index + 1}
              </div>
              <div
                className={`mt-2 text-center text-xs font-medium ${
                  isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </div>
              {step.description && (
                <div className="text-center text-[11px] text-gray-400">
                  {step.description}
                </div>
              )}
            </div>
            {!isLast && (
              <div
                className={`mx-3 h-0.5 flex-1 self-start rounded transition-colors ${
                  isCompleted ? "bg-blue-600" : "bg-gray-200"
                }`}
                style={{ marginTop: "1.1rem" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
