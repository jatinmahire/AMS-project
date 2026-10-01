import { Check } from 'lucide-react';
import './StepIndicator.css';

export default function StepIndicator({ steps, currentStep, completedSteps = [], onStepClick }) {
  return (
    <div className="step-indicator">
      {steps.map((label, index) => {
        const isCurrent = index === currentStep;
        const isCompleted = completedSteps.includes(index) && !isCurrent;
        const clickable = isCompleted && !!onStepClick;

        return (
          <div key={label} className="step-indicator-item">
            <div className="step-indicator-step">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(index)}
                className={`step-indicator-circle ${
                  isCurrent
                    ? 'step-indicator-circle-current'
                    : isCompleted
                    ? 'step-indicator-circle-completed'
                    : 'step-indicator-circle-pending'
                }`}
              >
                {isCompleted ? <Check size={16} /> : index + 1}
              </button>
              <span
                className={`step-indicator-label ${
                  isCurrent ? 'step-indicator-label-current' : isCompleted ? 'step-indicator-label-completed' : 'step-indicator-label-pending'
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-indicator-connector ${isCompleted ? 'step-indicator-connector-completed' : 'step-indicator-connector-pending'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
