type EmptyStateProps = {
  icon?: string;
  title: string;
  text: string;
  action?: React.ReactNode;
};

export const EmptyState = ({ icon = '🪴', title, text, action }: EmptyStateProps) => (
  <section className="empty-state">
    <div className="empty-state__icon">{icon}</div>
    <h2>{title}</h2>
    <p>{text}</p>
    {action}
  </section>
);
