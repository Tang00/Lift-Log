"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { AuthScreen } from "@/components/auth-screen";
import { AccountView } from "@/components/account-view";
import { SiteHeader } from "@/components/site-header";
import { TemplateDetail } from "@/components/template-detail";
import { TemplateEditor } from "@/components/template-editor";
import { TemplateMenu } from "@/components/template-menu";
import type {
  WorkoutSession,
  WorkoutSetEntry,
  WorkoutTemplate,
} from "@/types/workout";
import { supabase } from "@/utils/supabase/client";
import {
  deleteCompletedWorkout,
  fetchCompletedWorkouts,
  fetchTemplates,
  saveCompletedWorkout,
  saveTemplate,
} from "@/utils/supabase/workout-store";

type ThemeMode = "system" | "light" | "dark";

type Screen =
  | { name: "menu" }
  | { name: "account" }
  | { name: "detail"; returnTo: "menu" | "account" }
  | { name: "editor"; mode: "create" | "edit"; templateId: string };

function createEmptyTemplate(): WorkoutTemplate {
  return {
    id: crypto.randomUUID(),
    title: "",
    summary: "",
    exercises: [
      {
        id: crypto.randomUUID(),
        name: "",
        note: "",
        expectedSets: 3,
        repTargets: [
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
          { minReps: "8", maxReps: "" },
        ],
        previousResults: [],
      },
    ],
  };
}

function normalizeTemplate(template: WorkoutTemplate): WorkoutTemplate {
  return {
    ...template,
    exercises: template.exercises.map((exercise) => {
      const fallbackTarget =
        exercise.repTargets && exercise.repTargets.length > 0
          ? exercise.repTargets
          : Array.from({ length: Math.max(1, exercise.expectedSets) }, () => ({
              minReps: "",
              maxReps: "",
            }));

      const repTargets = Array.from(
        { length: Math.max(1, exercise.expectedSets) },
        (_, index) => fallbackTarget[index] ?? fallbackTarget[fallbackTarget.length - 1],
      );

      return {
        ...exercise,
        id: exercise.id || crypto.randomUUID(),
        note: exercise.note ?? "",
        repTargets,
      };
    }),
  };
}

function createSessionFromTemplate(
  template: WorkoutTemplate,
  completedWorkouts: WorkoutSession[],
): WorkoutSession {
  const normalizedTemplate = normalizeTemplate(template);
  const lastCompletedWorkout = completedWorkouts.find(
    (workout) => workout.templateId === normalizedTemplate.id,
  );

  return {
    id: crypto.randomUUID(),
    completedAt: null,
    templateId: normalizedTemplate.id,
    title: normalizedTemplate.title,
    exercises: normalizedTemplate.exercises.map((exercise) => {
      const previousExercise = lastCompletedWorkout?.exercises.find(
        (item) => item.exerciseId === exercise.id,
      );

      return {
        exerciseId: exercise.id,
        name: exercise.name,
        note: "",
        templateNote: exercise.note,
        previousResults: previousExercise?.sets.map((set) => ({
          weight: set.weight,
          reps: set.reps,
        })),
        sets: Array.from({ length: exercise.expectedSets }, (_, index) => {
          const defaultWeight =
            previousExercise?.sets[index]?.weight?.trim() !== ""
              ? previousExercise?.sets[index]?.weight ?? "0"
              : "0";
          const defaultReps =
            exercise.repTargets[index]?.minReps ||
            exercise.repTargets[index]?.maxReps ||
            "0";

          return {
            completed: false,
            defaultReps,
            defaultWeight,
            reps: defaultReps,
            repsTouched: false,
            weight: defaultWeight,
            weightTouched: false,
            minReps: exercise.repTargets[index]?.minReps ?? "",
            maxReps: exercise.repTargets[index]?.maxReps ?? "",
          };
        }),
      };
    }),
  };
}

function screenFromReturnTarget(target: "menu" | "account"): Extract<
  Screen,
  { name: "menu" } | { name: "account" }
> {
  return target === "account" ? { name: "account" } : { name: "menu" };
}

function updateSetWithDefaults(
  set: WorkoutSetEntry,
  field: keyof WorkoutSetEntry,
  value: string | boolean,
) {
  if (field === "weight" && typeof value === "string") {
    return {
      ...set,
      weight: value,
      weightTouched: true,
    };
  }

  if (field === "reps" && typeof value === "string") {
    return {
      ...set,
      reps: value,
      repsTouched: true,
    };
  }

  if (field === "completed" && typeof value === "boolean") {
    return {
      ...set,
      completed: value,
      weight:
        value && (set.weight.trim() === "" || !set.weightTouched)
          ? set.defaultWeight
          : set.weight,
      reps:
        value && (set.reps.trim() === "" || !set.repsTouched)
          ? set.defaultReps
          : set.reps,
    };
  }

  return {
    ...set,
    [field]: value,
  };
}

export function AppShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("edwin@example.com");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isSavingWorkout, setIsSavingWorkout] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: "menu" });
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [inProgressWorkout, setInProgressWorkout] = useState<WorkoutSession | null>(null);
  const [selectedHistoryWorkout, setSelectedHistoryWorkout] =
    useState<WorkoutSession | null>(null);
  const [isEditingSavedSession, setIsEditingSavedSession] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState<WorkoutTemplate | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedTheme = window.localStorage.getItem("lift-log-theme");
    if (
      storedTheme === "system" ||
      storedTheme === "light" ||
      storedTheme === "dark"
    ) {
      setThemeMode(storedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return;
    }

    const root = document.documentElement;
    const body = document.body;

    if (themeMode === "system") {
      root.removeAttribute("data-theme");
      body.removeAttribute("data-theme");
      window.localStorage.removeItem("lift-log-theme");
      return;
    }

    root.setAttribute("data-theme", themeMode);
    body.setAttribute("data-theme", themeMode);
    window.localStorage.setItem("lift-log-theme", themeMode);
  }, [themeMode]);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) {
        return;
      }

      if (error) {
        setAuthMessage(error.message);
      } else {
        setSession(data.session);
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setTemplates([]);
      setWorkouts([]);
      setInProgressWorkout(null);
      setSelectedHistoryWorkout(null);
      setIsEditingSavedSession(false);
      return;
    }

    let isMounted = true;
    setIsLoadingData(true);

    void Promise.all([fetchTemplates(), fetchCompletedWorkouts()])
      .then(([nextTemplates, nextWorkouts]) => {
        if (!isMounted) {
          return;
        }

        setTemplates(nextTemplates);
        setWorkouts(nextWorkouts);
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return;
        }

        setAuthMessage(
          error instanceof Error ? error.message : "Failed to load workout data.",
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingData(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  async function handleMagicLinkSignIn() {
    setIsSendingLink(true);
    setAuthMessage(null);

    const redirectTo =
      typeof window !== "undefined" ? window.location.origin : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      setAuthMessage(error.message);
    } else {
      setAuthMessage(`Magic link sent to ${email}`);
    }

    setIsSendingLink(false);
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setAuthMessage("Signed out.");
    setSession(null);
    setScreen({ name: "menu" });
    setDraftTemplate(null);
    setInProgressWorkout(null);
    setSelectedHistoryWorkout(null);
    setIsEditingSavedSession(false);
  }

  async function handleInviteFriend() {
    if (!session?.access_token) {
      return;
    }

    setIsInviting(true);
    setInviteMessage(null);

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setInviteMessage(data.error ?? "Failed to send invite.");
        return;
      }

      setInviteMessage(data.message ?? "Invite sent.");
      setInviteEmail("");
    } catch {
      setInviteMessage("Failed to send invite.");
    } finally {
      setIsInviting(false);
    }
  }

  function openTemplate(template: WorkoutTemplate) {
    const nextSession = createSessionFromTemplate(template, workouts);
    setInProgressWorkout(nextSession);
    setSelectedHistoryWorkout(null);
    setIsEditingSavedSession(false);
    setScreen({ name: "detail", returnTo: "menu" });
  }

  function openWorkout(workout: WorkoutSession) {
    setSelectedHistoryWorkout(structuredClone(workout));
    setIsEditingSavedSession(false);
    setScreen({ name: "detail", returnTo: "account" });
  }

  function openTemplateEditor(mode: "create" | "edit", template?: WorkoutTemplate) {
    const nextTemplate = template
      ? structuredClone(normalizeTemplate(template))
      : createEmptyTemplate();
    setDraftTemplate(nextTemplate);
    setIsEditingSavedSession(false);
    setScreen({
      name: "editor",
      mode,
      templateId: nextTemplate.id,
    });
  }

  async function handleSaveTemplate(template: WorkoutTemplate) {
    if (!session?.user.id) {
      return;
    }

    setIsSavingTemplate(true);
    try {
      const normalized = normalizeTemplate(template);
      await saveTemplate(session.user.id, normalized);
      const nextTemplates = await fetchTemplates();
      setTemplates(nextTemplates);
      setDraftTemplate(null);
      setScreen({ name: "menu" });
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "Failed to save template.",
      );
    } finally {
      setIsSavingTemplate(false);
    }
  }

  function updateActiveWorkoutSet(
    exerciseIndex: number,
    setIndex: number,
    field: keyof WorkoutSetEntry,
    value: string | boolean,
  ) {
    const setter =
      screen.name === "detail" && screen.returnTo === "account"
        ? setSelectedHistoryWorkout
        : setInProgressWorkout;

    setter((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((exercise, currentExerciseIndex) => {
          if (currentExerciseIndex !== exerciseIndex) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set, currentSetIndex) =>
              currentSetIndex === setIndex
                ? updateSetWithDefaults(set, field, value)
                : set,
            ),
          };
        }),
      };
    });
  }

  function updateActiveWorkoutNote(exerciseIndex: number, value: string) {
    const setter =
      screen.name === "detail" && screen.returnTo === "account"
        ? setSelectedHistoryWorkout
        : setInProgressWorkout;

    setter((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.map((exercise, currentExerciseIndex) =>
          currentExerciseIndex === exerciseIndex
            ? { ...exercise, note: value }
            : exercise,
        ),
      };
    });
  }

  function updateActiveWorkoutCompletedAt(value: string) {
    const setter =
      screen.name === "detail" && screen.returnTo === "account"
        ? setSelectedHistoryWorkout
        : setInProgressWorkout;

    setter((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        completedAt: value === "" ? null : new Date(`${value}T12:00:00`).toISOString(),
      };
    });
  }

  async function handleDeleteWorkout() {
    if (!activeWorkout) {
      return;
    }

    if (screen.name === "detail" && screen.returnTo === "account") {
      setIsSavingWorkout(true);
      try {
        await deleteCompletedWorkout(activeWorkout.id);
        const nextWorkouts = await fetchCompletedWorkouts();
        setWorkouts(nextWorkouts);
        setSelectedHistoryWorkout(null);
        setIsEditingSavedSession(false);
        setScreen({ name: "account" });
      } catch (error) {
        setAuthMessage(
          error instanceof Error ? error.message : "Failed to delete workout.",
        );
      } finally {
        setIsSavingWorkout(false);
      }
      return;
    }

    setInProgressWorkout(null);
    setIsEditingSavedSession(false);
    setScreen({ name: "menu" });
  }

  async function handleCompleteWorkout() {
    if (!session?.user.id || !activeWorkout) {
      return;
    }

    setIsSavingWorkout(true);
    try {
      const completedWorkout = {
        ...activeWorkout,
        completedAt: activeWorkout.completedAt ?? new Date().toISOString(),
      };

      await saveCompletedWorkout(session.user.id, completedWorkout);
      const nextWorkouts = await fetchCompletedWorkouts();
      setWorkouts(nextWorkouts);
      if (screen.name === "detail" && screen.returnTo === "account") {
        setSelectedHistoryWorkout(null);
        setIsEditingSavedSession(false);
      } else {
        setInProgressWorkout(null);
      }
      setScreen({ name: "account" });
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "Failed to save workout.",
      );
    } finally {
      setIsSavingWorkout(false);
    }
  }

  const currentDraft =
    screen.name === "editor" && draftTemplate ? draftTemplate : null;

  const activeWorkout =
    screen.name === "detail"
      ? screen.returnTo === "account"
        ? selectedHistoryWorkout
        : inProgressWorkout
      : null;
  const canManageInvites = process.env.NEXT_PUBLIC_ENABLE_INVITES === "true";

  if (isLoading) {
    return (
      <main className="page-shell">
        <section className="mobile-frame">
          <div className="screen">
            <div className="hero-card">
              <h1>Lift Log</h1>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        authMessage={authMessage}
        email={email}
        isSendingLink={isSendingLink}
        onEmailChange={setEmail}
        onSubmit={() => void handleMagicLinkSignIn()}
      />
    );
  }

  if (isLoadingData) {
    return (
      <main className="page-shell">
        <section className="mobile-frame simple-frame">
          <div className="screen simple-screen">
            <SiteHeader
              accountInitial={(session.user.email?.[0] ?? "A").toUpperCase()}
              onSelectAccount={() => {
                setDraftTemplate(null);
                setSelectedHistoryWorkout(null);
                setIsEditingSavedSession(false);
                setScreen({ name: "account" });
              }}
              onSelectTemplates={() => {
                setDraftTemplate(null);
                setIsEditingSavedSession(false);
                setScreen({ name: "menu" });
              }}
            />
            <div className="panel">
              <h3>Loading</h3>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="mobile-frame simple-frame">
        <div className="screen simple-screen">
          <SiteHeader
            accountInitial={(session.user.email?.[0] ?? "A").toUpperCase()}
            onSelectAccount={() => {
              setDraftTemplate(null);
              setSelectedHistoryWorkout(null);
              setIsEditingSavedSession(false);
              setScreen({ name: "account" });
            }}
            onSelectTemplates={() => {
              setDraftTemplate(null);
              setIsEditingSavedSession(false);
              setScreen({ name: "menu" });
            }}
          />

          {screen.name === "menu" ? (
            <TemplateMenu
              inProgressWorkout={inProgressWorkout}
              templates={templates}
              onCreateTemplate={() => openTemplateEditor("create")}
              onEditTemplate={(template) => openTemplateEditor("edit", template)}
              onResumeWorkout={() => {
                if (!inProgressWorkout) {
                  return;
                }
                setSelectedHistoryWorkout(null);
                setScreen({ name: "detail", returnTo: "menu" });
              }}
              onSelectTemplate={openTemplate}
            />
          ) : null}

          {screen.name === "account" ? (
            <AccountView
              accountInitial={(session.user.email?.[0] ?? "A").toUpperCase()}
              canManageInvites={canManageInvites}
              email={session.user.email ?? ""}
              inviteEmail={inviteEmail}
              inviteMessage={inviteMessage}
              isInviting={isInviting}
              onInviteEmailChange={setInviteEmail}
              onInviteSubmit={() => void handleInviteFriend()}
              onOpenWorkout={openWorkout}
              onSignOut={() => void handleLogout()}
              onThemeChange={setThemeMode}
              themeMode={themeMode}
              workouts={workouts}
            />
          ) : null}

          {screen.name === "detail" && activeWorkout ? (
            <TemplateDetail
              onBack={() => {
                if (screen.returnTo === "account") {
                  setSelectedHistoryWorkout(null);
                  setIsEditingSavedSession(false);
                }
                setScreen(screenFromReturnTarget(screen.returnTo));
              }}
              onCompleteWorkout={() => void handleCompleteWorkout()}
              onDeleteWorkout={() => void handleDeleteWorkout()}
              onDirtyChange={undefined}
              isEditingSavedSession={isEditingSavedSession}
              isReadOnly={screen.returnTo === "account" && !isEditingSavedSession}
              isSavedSession={screen.returnTo === "account"}
              onStartEditing={() => setIsEditingSavedSession(true)}
              onUpdateCompletedAt={updateActiveWorkoutCompletedAt}
              onUpdateNote={(exerciseIndex, value) =>
                updateActiveWorkoutNote(exerciseIndex, value)
              }
              onUpdateSet={(exerciseIndex, setIndex, field, value) =>
                updateActiveWorkoutSet(exerciseIndex, setIndex, field, value)
              }
              session={activeWorkout}
            />
          ) : null}

          {screen.name === "editor" && currentDraft ? (
            <TemplateEditor
              mode={screen.mode}
              onDirtyChange={undefined}
              onBack={() => {
                setDraftTemplate(null);
                setIsEditingSavedSession(false);
                setScreen({ name: "menu" });
              }}
              onSave={(template) => void handleSaveTemplate(template)}
              template={currentDraft}
            />
          ) : null}

          {isSavingTemplate ? <div className="panel"><h3>Saving template</h3></div> : null}
          {isSavingWorkout ? <div className="panel"><h3>Saving workout</h3></div> : null}
        </div>
      </section>
    </main>
  );
}
