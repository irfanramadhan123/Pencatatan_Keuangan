export default function EmptyState({ icon, title, description, actionLabel, onAction, tall }) {
  return (
    <div className={`empty-state${tall ? " tall" : ""}${onAction ? " actionable" : ""}`}>
      <div className="empty-state-icon">{icon}</div>
      <strong>{title}</strong>
      <span>{description}</span>
      {onAction && (
        <button className="empty-action-btn" onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
