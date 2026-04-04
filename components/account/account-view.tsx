"use client";

import styles from "@/components/account/account-view.module.css";
import { AccountCalendar } from "@/components/account/account-calendar";
import { AccountHistoryList } from "@/components/account/account-history-list";
import { AccountThemeToggle } from "@/components/account/account-theme-toggle";
import type { ThemeMode } from "@/hooks/ui/use-theme-mode";
import { Panel } from "@/components/ui/panel";
import { ScrollablePane } from "@/components/ui/navigation/scrollable-pane";
import type { WorkoutSession } from "@/types/workout";

type AccountViewProps = {
  accountInitial: string;
  canManageInvites: boolean;
  email: string;
  inviteEmail: string;
  inviteMessage: string | null;
  isInviting: boolean;
  onInviteEmailChange: (value: string) => void;
  onInviteSubmit: () => void;
  onOpenWorkout: (workout: WorkoutSession) => void;
  onSignOut: () => void;
  onThemeChange: (value: ThemeMode) => void;
  themeMode: ThemeMode;
  workouts: WorkoutSession[];
};

export function AccountView({
  accountInitial,
  canManageInvites,
  email,
  inviteEmail,
  inviteMessage,
  isInviting,
  onInviteEmailChange,
  onInviteSubmit,
  onOpenWorkout,
  onSignOut,
  onThemeChange,
  themeMode,
  workouts,
}: AccountViewProps) {
  return (
    <ScrollablePane>
      <div className={styles.stack}>
        <Panel>
          <div className={styles.summary}>
            <div className={styles.summaryAvatar}>{accountInitial}</div>
            <div className={styles.summaryCopy}>
              <h3>Account</h3>
              <div className="exercise-subtext">{email}</div>
            </div>
          </div>
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

        <AccountCalendar onOpenWorkout={onOpenWorkout} workouts={workouts} />
        <AccountHistoryList onOpenWorkout={onOpenWorkout} workouts={workouts} />

        <button className="secondary-button" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </ScrollablePane>
  );
}
