"use client";

import { useState } from "react";

import { AccountView } from "@/components/account/account-view";
import { AuthScreen } from "@/components/auth/auth-screen";
import { SiteHeader } from "@/components/layout/site-header";
import { TemplateEditor } from "@/components/templates/template-editor";
import { TemplateMenu } from "@/components/templates/template-menu";
import { LoadingModal } from "@/components/ui/loading-modal";
import { TemplateDetail } from "@/components/workout/template-detail";
import { UpdateTemplateModal } from "@/components/workout/update-template-modal";
import { useActiveWorkout } from "@/hooks/use-active-workout";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useThemeMode } from "@/hooks/use-theme-mode";
import { useWorkoutData } from "@/hooks/use-workout-data";
import type { WorkoutSession, WorkoutTemplate } from "@/types/workout";
import { MAX_TEMPLATES } from "@/utils/workout/limits";
import { createEmptyTemplate, normalizeTemplate, sessionDiffersFromTemplate } from "@/utils/workout/session";

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
  const {
    authMessage,
    email,
    isLoading,
    isSendingLink,
    session,
    setAuthMessage,
    setEmail,
    signInWithMagicLink,
    signOut,
  } = useAuthSession();
  const [screen, setScreen] = useState<Screen>({ name: "menu" });
  const [draftTemplate, setDraftTemplate] = useState<WorkoutTemplate | null>(null);
  const [pendingTemplateUpdate, setPendingTemplateUpdate] = useState<{
    template: WorkoutTemplate;
    workout: WorkoutSession;
  } | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const { themeMode, setThemeMode } = useThemeMode();
  const {
    deleteWorkoutRecord,
    isLoadingData,
    isSavingTemplate,
    isSavingWorkout,
    persistWorkoutRecord,
    saveTemplateRecord,
    templates,
    workouts,
  } = useWorkoutData({
    onError: setAuthMessage,
    session,
  });
  const detailSource = screen.name === "detail" ? screen.returnTo : null;
  const {
    activeWorkout,
    addExercise,
    addSet,
    clearAllWorkoutState,
    clearHistoryWorkout,
    clearInProgressWorkout,
    inProgressWorkout,
    isEditingSavedSession,
    openBlankWorkout,
    openTemplate,
    openWorkout,
    removeExercise,
    removeSet,
    setIsEditingSavedSession,
    updateCompletedAt,
    updateExerciseName,
    updateNote,
    updateSet,
  } = useActiveWorkout({
    completedWorkouts: workouts,
    source: detailSource,
  });
  const canManageInvites = process.env.NEXT_PUBLIC_ENABLE_INVITES === "true";
  const currentDraft =
    screen.name === "editor" && draftTemplate ? draftTemplate : null;

  async function handleLogout() {
    const didSignOut = await signOut();
    if (!didSignOut) {
      return;
    }

    setScreen({ name: "menu" });
    setDraftTemplate(null);
    setPendingTemplateUpdate(null);
    setInviteEmail("");
    setInviteMessage(null);
    clearAllWorkoutState();
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

  function openTemplateEditor(mode: "create" | "edit", template?: WorkoutTemplate) {
    if (mode === "create" && templates.length >= MAX_TEMPLATES) {
      setAuthMessage(`You can only create up to ${MAX_TEMPLATES} templates.`);
      return;
    }

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
    const didSave = await saveTemplateRecord(template);

    if (!didSave) {
      return;
    }

    setDraftTemplate(null);
    setScreen({ name: "menu" });
  }

  async function handleDeleteWorkout() {
    if (!activeWorkout) {
      return;
    }

    if (detailSource === "account") {
      const didDelete = await deleteWorkoutRecord(activeWorkout.id);
      if (!didDelete) {
        return;
      }

      clearHistoryWorkout();
      setScreen({ name: "account" });
      return;
    }

    clearInProgressWorkout();
    setScreen({ name: "menu" });
  }

  async function persistWorkout(
    completedWorkout: WorkoutSession,
    options?: { updateTemplate?: boolean; template?: WorkoutTemplate },
  ) {
    const didSave = await persistWorkoutRecord(completedWorkout, options);

    if (!didSave) {
      return;
    }

    if (detailSource === "account") {
      clearHistoryWorkout();
    } else {
      clearInProgressWorkout();
    }

    setPendingTemplateUpdate(null);
    setScreen({ name: "account" });
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
        onSubmit={() => void signInWithMagicLink()}
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
                clearHistoryWorkout();
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
              clearHistoryWorkout();
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
              onCreateBlankWorkout={() => {
                openBlankWorkout();
                setScreen({ name: "detail", returnTo: "menu" });
              }}
              templates={templates}
              onCreateTemplate={() => openTemplateEditor("create")}
              onEditTemplate={(template) => openTemplateEditor("edit", template)}
              onResumeWorkout={() => {
                if (!inProgressWorkout) {
                  return;
                }

                clearHistoryWorkout();
                setScreen({ name: "detail", returnTo: "menu" });
              }}
              onSelectTemplate={(template) => {
                openTemplate(template);
                setScreen({ name: "detail", returnTo: "menu" });
              }}
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
              onOpenWorkout={(workout) => {
                openWorkout(workout);
                setScreen({ name: "detail", returnTo: "account" });
              }}
              onSignOut={() => void handleLogout()}
              onThemeChange={setThemeMode}
              themeMode={themeMode}
              workouts={workouts}
            />
          ) : null}

          {screen.name === "detail" && activeWorkout ? (
            <TemplateDetail
              onAddExercise={addExercise}
              onAddSet={addSet}
              onBack={() => {
                if (screen.returnTo === "account") {
                  clearHistoryWorkout();
                }
                setScreen(screenFromReturnTarget(screen.returnTo));
              }}
              onCompleteWorkout={() => void handleCompleteWorkout()}
              onDeleteWorkout={() => void handleDeleteWorkout()}
              onDirtyChange={undefined}
              isEditingSavedSession={isEditingSavedSession}
              isReadOnly={screen.returnTo === "account" && !isEditingSavedSession}
              isSavedSession={screen.returnTo === "account"}
              onRemoveExercise={removeExercise}
              onRemoveSet={removeSet}
              onStartEditing={() => setIsEditingSavedSession(true)}
              onUpdateCompletedAt={updateCompletedAt}
              onUpdateExerciseName={updateExerciseName}
              onUpdateNote={updateNote}
              onUpdateSet={updateSet}
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
