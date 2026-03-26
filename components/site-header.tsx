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
    <header className="site-header">
      <div className="header-left">
        <button className="site-brand" type="button" onClick={onSelectTemplates}>
          <p className="site-brand-mark">Lift Log</p>
        </button>
      </div>

      <div className="header-actions">
        <button
          aria-label="Account"
          className="account-avatar-button"
          type="button"
          onClick={onSelectAccount}
        >
          <span className="account-avatar">{accountInitial}</span>
        </button>
      </div>
    </header>
  );
}
