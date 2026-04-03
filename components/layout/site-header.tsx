import styles from "@/components/layout/site-header.module.css";

type SiteHeaderProps = {
  accountInitial: string;
  onSelectAccount: () => void;
  onSelectTemplates: () => void;
};

export function SiteHeader({
  accountInitial,
  onSelectAccount,
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
        <button
          aria-label="Account"
          className={styles.accountAvatarButton}
          type="button"
          onClick={onSelectAccount}
        >
          <span className={styles.accountAvatar}>{accountInitial}</span>
        </button>
      </div>
    </header>
  );
}
