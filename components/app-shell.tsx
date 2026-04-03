"use client";

import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { AccountView } from "@/components/account/account-view";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SiteHeader } from "@/components/layout/site-header";
import { TemplateEditor } from "@/components/templates/template-editor";
import { TemplateMenu } from "@/components/templates/template-menu";
import { LoadingModal } from "@/components/ui/loading-modal";
import { TemplateDetail } from "@/components/workout/template-detail";
import { UpdateTemplateModal } from "@/components/workout/update-template-modal";
import { useThemeMode } from "@/hooks/use-theme-mode";
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
import {
  createSessionExercise,
  createSessionSetFromExercise,
  createTemplateFromSession,
  createEmptyTemplate,
  createSessionFromTemplate,
  normalizeTemplate,
  sessionDiffersFromTemplate,
  updateSetWithDefaults,
} from "@/utils/workout/session";

type Screen =
  | { name: "menu" }
  | { name: "account" }
  | { name: "detail"; returnTo: "menu" | "account" }
  | { name: "editor"; mode: "create" | "edit"; templateId: string };

function screenFromReturnTarget(target: "menu" | "account"): Extract<
  Screen,
  { name: "menu" } | { name: "account" }
> {
  return target === "account" ? { name: "account" } : { name: "menu" };
}

export function AppShell() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
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
  const [pendingTemplateUpdate, setPendingTemplateUpdate] = useState<{
    template: WorkoutTemplate;
    workout: WorkoutSession;
  } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const { themeMode, setThemeMode } = useThemeMode();

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
      setPendingTemplateUpdate(null);
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
      typeof window !== "undefined"
        ? window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL;

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
    setPendingTemplateUpdate(null);
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

          if ((field === "weight" || field === "reps") && typeof value === "string") {
            const defaultField =
              field === "weight" ? "defaultWeight" : "defaultReps";
            const touchedField =
              field === "weight" ? "weightTouched" : "repsTouched";

            return {
              ...exercise,
              sets: exercise.sets.map((set, currentSetIndex) => {
                if (currentSetIndex === setIndex) {
                  const nextSet = updateSetWithDefaults(set, field, value);
                  return {
                    ...nextSet,
                    [defaultField]: value === "" ? nextSet[defaultField] : value,
                  };
                }

                if (currentSetIndex < setIndex) {
                  return set;
                }

                const currentValue = set[field];
                const currentDefault = set[defaultField];
                const isUntouchedDefault =
                  !set[touchedField] &&
                  (currentValue === "" || currentValue === currentDefault);

                if (!isUntouchedDefault) {
                  return set;
                }

                return {
                  ...set,
                  [defaultField]: value === "" ? currentDefault : value,
                  [field]: currentValue === "" ? "" : value,
                  [touchedField]: false,
                };
              }),
            };
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

  function updateActiveWorkoutName(exerciseIndex: number, value: string) {
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
            ? { ...exercise, name: value }
            : exercise,
        ),
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

  function addActiveWorkoutExercise() {
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
        exercises: [
          ...current.exercises,
          createSessionExercise(`Exercise ${current.exercises.length + 1}`),
        ],
      };
    });
  }

  function removeActiveWorkoutExercise(exerciseIndex: number) {
    const setter =
      screen.name === "detail" && screen.returnTo === "account"
        ? setSelectedHistoryWorkout
        : setInProgressWorkout;

    setter((current) => {
      if (!current || current.exercises.length <= 1) {
        return current;
      }

      return {
        ...current,
        exercises: current.exercises.filter(
          (_exercise, currentExerciseIndex) => currentExerciseIndex !== exerciseIndex,
        ),
      };
    });
  }

  function addActiveWorkoutSet(exerciseIndex: number) {
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
            ? { ...exercise, sets: [...exercise.sets, createSessionSetFromExercise(exercise)] }
            : exercise,
        ),
      };
    });
  }

  function removeActiveWorkoutSet(exerciseIndex: number) {
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
          if (currentExerciseIndex !== exerciseIndex || exercise.sets.length <= 1) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.slice(0, -1),
          };
        }),
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

  async function persistWorkout(
    completedWorkout: WorkoutSession,
    options?: { updateTemplate?: boolean; template?: WorkoutTemplate },
  ) {
    if (!session?.user.id) {
      return;
    }

    setIsSavingWorkout(true);
    try {
      setPendingTemplateUpdate(null);

      if (options?.updateTemplate && options.template) {
        await saveTemplate(
          session.user.id,
          createTemplateFromSession(completedWorkout, options.template),
        );
      }

      await saveCompletedWorkout(session.user.id, completedWorkout);
      const [nextTemplates, nextWorkouts] = await Promise.all([
        fetchTemplates(),
        fetchCompletedWorkouts(),
      ]);
      setTemplates(nextTemplates);
      setWorkouts(nextWorkouts);
      if (screen.name === "detail" && screen.returnTo === "account") {
        setSelectedHistoryWorkout(null);
        setIsEditingSavedSession(false);
      } else {
        setInProgressWorkout(null);
      }
      setPendingTemplateUpdate(null);
      setScreen({ name: "account" });
    } catch (error) {
      setAuthMessage(
        error instanceof Error ? error.message : "Failed to save workout.",
      );
    } finally {
      setIsSavingWorkout(false);
    }
  }

  async function handleCompleteWorkout() {
    if (!activeWorkout) {
      return;
    }

    const completedWorkout = {
      ...activeWorkout,
      completedAt: activeWorkout.completedAt ?? new Date().toISOString(),
    };
    const relatedTemplate = templates.find(
      (template) => template.id === completedWorkout.templateId,
    );

    if (
      relatedTemplate &&
      sessionDiffersFromTemplate(completedWorkout, relatedTemplate)
    ) {
      setPendingTemplateUpdate({
        template: relatedTemplate,
        workout: completedWorkout,
      });
      return;
    }

    await persistWorkout(completedWorkout);
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
              onAddExercise={addActiveWorkoutExercise}
              onAddSet={addActiveWorkoutSet}
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
              onRemoveExercise={removeActiveWorkoutExercise}
              onRemoveSet={removeActiveWorkoutSet}
              onStartEditing={() => setIsEditingSavedSession(true)}
              onUpdateCompletedAt={updateActiveWorkoutCompletedAt}
              onUpdateExerciseName={(exerciseIndex, value) =>
                updateActiveWorkoutName(exerciseIndex, value)
              }
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

          {isSavingTemplate ? <LoadingModal title="Saving template" /> : null}
          {isSavingWorkout ? <LoadingModal title="Saving workout" /> : null}
          {pendingTemplateUpdate && !isSavingWorkout && !isSavingTemplate ? (
            <UpdateTemplateModal
              onClose={() => setPendingTemplateUpdate(null)}
              onKeepSessionOnly={() => void persistWorkout(pendingTemplateUpdate.workout)}
              onUpdateTemplate={() =>
                void persistWorkout(pendingTemplateUpdate.workout, {
                  template: pendingTemplateUpdate.template,
                  updateTemplate: true,
                })
              }
            />
          ) : null}
        </div>
      </section>
    </main>
  );
}
