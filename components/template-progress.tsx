"use client";

type TemplateProgressSeries = {
  exerciseName: string;
  points: Array<{
    date: string;
    weight: number;
  }>;
};

type TemplateProgressProps = {
  onBack: () => void;
  series: TemplateProgressSeries[];
  templateTitle: string;
};

export function TemplateProgress({
  onBack,
  series,
  templateTitle,
}: TemplateProgressProps) {
  return (
    <div className="stack">
      <div className="workout-screen-header">
        <button
          aria-label="Go back"
          className="back-arrow"
          type="button"
          onClick={onBack}
        >
          ←
        </button>
        <div className="workout-screen-title">
          <h2>{templateTitle}</h2>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Progress</h3>
        </div>
        <div className="template-progress-list">
          {series.map((exercise) => {
            const maxWeight = Math.max(...exercise.points.map((point) => point.weight), 1);

            return (
              <div className="template-progress-section" key={exercise.exerciseName}>
                <h4>{exercise.exerciseName}</h4>
                <div className="progress-chart">
                  {exercise.points.map((point) => (
                    <div
                      className="progress-bar-row"
                      key={`${exercise.exerciseName}-${point.date}-${point.weight}`}
                    >
                      <div className="progress-date">{point.date}</div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${(point.weight / maxWeight) * 100}%` }}
                        />
                      </div>
                      <div className="progress-value">{point.weight}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
