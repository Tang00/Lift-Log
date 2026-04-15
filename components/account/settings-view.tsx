"use client";

import { useState } from "react";

import styles from "@/components/account/account-view.module.css";
import { AccountThemeToggle } from "@/components/account/account-theme-toggle";
import { Panel } from "@/components/ui/panel";
import { ScrollablePane } from "@/components/ui/navigation/scrollable-pane";
import { ConfirmationModal } from "@/components/ui/overlays/confirmation-modal";
import type { ThemeMode } from "@/utils/theme/theme-palettes";

type SettingsViewProps = {
  accountInitial: string;
  canManageInvites: boolean;
  email: string;
  inviteEmail: string;
  inviteMessage: string | null;
  isInviting: boolean;
  onInviteEmailChange: (value: string) => void;
  onInviteSubmit: () => void;
  onSignOut: () => void;
  onThemeChange: (value: ThemeMode) => void;
  themeMode: ThemeMode;
};

export function SettingsView({
  accountInitial,
  canManageInvites,
  email,
  inviteEmail,
  inviteMessage,
  isInviting,
  onInviteEmailChange,
  onInviteSubmit,
  onSignOut,
  onThemeChange,
  themeMode,
}: SettingsViewProps) {
  const [isSignOutDialogOpen, setIsSignOutDialogOpen] = useState(false);

  return (
    <>
      <ScrollablePane>
        <div className={styles.stack}>
          <Panel>
            <div className={styles.summary}>
              <div className={styles.summaryAvatar}>{accountInitial}</div>
              <div className={styles.summaryCopy}>
                <h3>Settings</h3>
                <div className="exercise-subtext">{email}</div>
              </div>
            </div>
          </Panel>

          <Panel title="Theme">
            <AccountThemeToggle onThemeChange={onThemeChange} themeMode={themeMode} />
          </Panel>

          {canManageInvites ? (
            <Panel title="Invite Friends">
              <div className="stack">
                <input
                  className="text-input"
                  inputMode="email"
                  placeholder="friend@example.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(event) => onInviteEmailChange(event.target.value)}
                />
                {inviteMessage ? <div className="exercise-subtext">{inviteMessage}</div> : null}
                <button
                  className="primary-button"
                  disabled={isInviting}
                  type="button"
                  onClick={onInviteSubmit}
                >
                  {isInviting ? "Sending invite" : "Send invite"}
                </button>
              </div>
            </Panel>
          ) : null}

          <button
            className="secondary-button danger-action-button"
            type="button"
            onClick={() => setIsSignOutDialogOpen(true)}
          >
            Sign out
          </button>
        </div>
      </ScrollablePane>

      {isSignOutDialogOpen ? (
        <ConfirmationModal
          cancelLabel="Stay signed in"
          confirmLabel="Sign out"
          confirmTone="danger"
          message="You will need a new magic link to sign back in."
          onCancel={() => setIsSignOutDialogOpen(false)}
          onConfirm={onSignOut}
          title="Sign out?"
          titleId="sign-out-title"
        />
      ) : null}
    </>
  );
}
