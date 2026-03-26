import type { WorkoutTemplate } from "@/types/workout";

export const initialTemplates: WorkoutTemplate[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Push Day",
    summary: "Chest, shoulders, triceps",
    exercises: [
      {
        id: "11111111-1111-1111-1111-111111111112",
        name: "Bench Press",
        note: "Pause on the chest and drive evenly.",
        expectedSets: 3,
        repTargets: [
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
        ],
        previousResults: [
          { weight: "130", reps: "8" },
          { weight: "130", reps: "8" },
          { weight: "125", reps: "8" },
        ],
      },
      {
        id: "11111111-1111-1111-1111-111111111113",
        name: "Incline Dumbbell Press",
        note: "Keep your shoulder blades pinned back.",
        expectedSets: 3,
        repTargets: [
          { minReps: "8", maxReps: "10" },
          { minReps: "8", maxReps: "10" },
          { minReps: "8", maxReps: "10" },
        ],
        previousResults: [
          { weight: "45", reps: "10" },
          { weight: "45", reps: "9" },
        ],
      },
      {
        id: "11111111-1111-1111-1111-111111111114",
        name: "Tricep Pushdown",
        note: "Control the eccentric each rep.",
        expectedSets: 3,
        repTargets: [
          { minReps: "12", maxReps: "" },
          { minReps: "12", maxReps: "" },
          { minReps: "12", maxReps: "" },
        ],
        previousResults: [
          { weight: "40", reps: "12" },
          { weight: "40", reps: "11" },
        ],
      },
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222221",
    title: "Pull Day",
    summary: "Back and biceps",
    exercises: [
      {
        id: "22222222-2222-2222-2222-222222222222",
        name: "Barbell Row",
        note: "Pull to the lower ribs and pause.",
        expectedSets: 3,
        repTargets: [
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
        ],
        previousResults: [
          { weight: "110", reps: "8" },
          { weight: "110", reps: "8" },
        ],
      },
      {
        id: "22222222-2222-2222-2222-222222222223",
        name: "Lat Pulldown",
        note: "Start by pulling the shoulders down.",
        expectedSets: 3,
        repTargets: [
          { minReps: "10", maxReps: "12" },
          { minReps: "10", maxReps: "12" },
          { minReps: "10", maxReps: "12" },
        ],
        previousResults: [
          { weight: "90", reps: "12" },
          { weight: "90", reps: "11" },
        ],
      },
    ],
  },
  {
    id: "33333333-3333-3333-3333-333333333331",
    title: "Leg Day",
    summary: "Quads, hamstrings, glutes",
    exercises: [
      {
        id: "33333333-3333-3333-3333-333333333332",
        name: "Back Squat",
        note: "Brace before descending and stay balanced.",
        expectedSets: 3,
        repTargets: [
          { minReps: "5", maxReps: "" },
          { minReps: "5", maxReps: "" },
          { minReps: "5", maxReps: "" },
        ],
        previousResults: [
          { weight: "180", reps: "5" },
          { weight: "180", reps: "5" },
        ],
      },
      {
        id: "33333333-3333-3333-3333-333333333333",
        name: "Romanian Deadlift",
        note: "Keep the bar close and hinge from the hips.",
        expectedSets: 3,
        repTargets: [
          { minReps: "8", maxReps: "10" },
          { minReps: "8", maxReps: "10" },
          { minReps: "8", maxReps: "10" },
        ],
        previousResults: [
          { weight: "130", reps: "8" },
          { weight: "130", reps: "8" },
        ],
      },
    ],
  },
];
