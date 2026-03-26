"use client";

type ProgressPoint = {
  date: string;
  weight: number;
};

type ExerciseProgressProps = {
  exerciseName: string;
  onBack: () => void;
  points: ProgressPoint[];
};

export function ExerciseProgress({
  exerciseName,
  onBack,
  points,
}: ExerciseProgressProps) {
  const maxWeight = Math.max(...points.map((point) => point.weight), 1);

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
          <h2>{exerciseName}</h2>
        </div>
      </div>

      <div className="panel">
        <div className="progress-chart">
          {points.map((point) => (
            <div className="progress-bar-row" key={`${point.date}-${point.weight}`}>
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
    </div>
  );
}
