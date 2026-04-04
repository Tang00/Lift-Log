import styles from "@/components/layout/site-header.module.css";

type SiteHeaderProps = {
  accountInitial: string;
  onSelectHistory: () => void;
  onSelectSettings: () => void;
  onSelectTemplates: () => void;
};

export function SiteHeader({
  accountInitial,
  onSelectHistory,
  onSelectSettings,
  onSelectTemplates,
}: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.brand} type="button" onClick={onSelectTemplates}>
          <p className={styles.brandMark}>Lift Log</p>
        </button>
      </div>

      <div className={styles.actions}>
        <button className={styles.navButton} type="button" onClick={onSelectHistory}>
          History
        </button>
        <button
          aria-label="Settings"
          className={styles.accountAvatarButton}
          type="button"
          onClick={onSelectSettings}
        >
          <span className={styles.accountAvatar}>{accountInitial}</span>
        </button>
      </div>
    </header>
  );
}
