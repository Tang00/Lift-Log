"use client";

import { useState } from "react";

import type { WorkoutSession, WorkoutTemplate } from "@/types/workout";

export type AppScreen =
  | { name: "menu" }
  | { name: "account" }
  | { name: "detail"; returnTo: "menu" | "account" }
  | { name: "editor"; mode: "create" | "edit"; templateId: string };

type PendingTemplateUpdate = {
  template: WorkoutTemplate;
  workout: WorkoutSession;
};

export function screenFromReturnTarget(target: "menu" | "account"): Extract<
  AppScreen,
  { name: "menu" } | { name: "account" }
> {
  return target === "account" ? { name: "account" } : { name: "menu" };
}

export function useAppFlow() {
  const [screen, setScreen] = useState<AppScreen>({ name: "menu" });
  const [draftTemplate, setDraftTemplate] = useState<WorkoutTemplate | null>(null);
  const [pendingTemplateUpdate, setPendingTemplateUpdate] =
    useState<PendingTemplateUpdate | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);

  function openMenu() {
    setDraftTemplate(null);
    setScreen({ name: "menu" });
  }

  function openAccount() {
    setDraftTemplate(null);
    setScreen({ name: "account" });
  }

  function openDetail(returnTo: "menu" | "account") {
    setScreen({ name: "detail", returnTo });
  }

  function openEditor(mode: "create" | "edit", template: WorkoutTemplate) {
    setDraftTemplate(template);
    setScreen({
      name: "editor",
      mode,
      templateId: template.id,
    });
  }

  function closeEditor() {
    setDraftTemplate(null);
    setScreen({ name: "menu" });
  }

  function clearInviteState() {
    setInviteEmail("");
    setInviteMessage(null);
    setIsInviting(false);
  }

  function reset() {
    setScreen({ name: "menu" });
    setDraftTemplate(null);
    setPendingTemplateUpdate(null);
    clearInviteState();
  }

  return {
    clearInviteState,
    closeEditor,
    draftTemplate,
    inviteEmail,
    inviteMessage,
    isInviting,
    openAccount,
    openDetail,
    openEditor,
    openMenu,
    pendingTemplateUpdate,
    screen,
    setDraftTemplate,
    setInviteEmail,
    setInviteMessage,
    setIsInviting,
    setPendingTemplateUpdate,
    setScreen,
    reset,
  };
}
