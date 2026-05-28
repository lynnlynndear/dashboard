interface AlertBannerProps {
  level: 'danger' | 'warning' | 'safe';
  title: string;
  message: string;
}

export function AlertBanner({ level, title, message }: AlertBannerProps) {
  const styles = {
    danger: {
      wrapper: 'bg-red-50 border-red-200',
      icon: '🚨',
      titleColor: 'text-red-800',
      msgColor: 'text-red-700',
      bar: 'bg-red-500',
    },
    warning: {
      wrapper: 'bg-amber-50 border-amber-200',
      icon: '⚠️',
      titleColor: 'text-amber-800',
      msgColor: 'text-amber-700',
      bar: 'bg-amber-400',
    },
    safe: {
      wrapper: 'bg-emerald-50 border-emerald-200',
      icon: '✅',
      titleColor: 'text-emerald-800',
      msgColor: 'text-emerald-700',
      bar: 'bg-emerald-500',
    },
  }[level];

  return (
    <div className={`flex items-start gap-3 rounded-lg border p-3 ${styles.wrapper}`}>
      <div className={`w-1 self-stretch rounded ${styles.bar}`} />
      <span className="text-lg">{styles.icon}</span>
      <div>
        <div className={`font-semibold text-sm ${styles.titleColor}`}>{title}</div>
        <div className={`text-xs mt-0.5 ${styles.msgColor}`}>{message}</div>
      </div>
    </div>
  );
}
