// src/components/ui/InlineAlert.jsx
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const statusConfig = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-success/10',
    text: 'text-success'
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-warning/10',
    text: 'text-warning'
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-danger/10',
    text: 'text-danger'
  },
  info: {
    icon: Info,
    bg: 'bg-info/10',
    text: 'text-info'
  }
};

export default function InlineAlert({ status = 'info', title, message, action }) {
  const config = statusConfig[status] ?? statusConfig.info;
  const Icon = config.icon;
  return (
    <div className={`flex items-start gap-3 rounded-panel border border-shell-border/60 px-4 py-3 ${config.bg}`}>
      <Icon size={18} className={config.text} />
      <div className="flex-1">
        {title ? <p className="font-medium text-text-primary">{title}</p> : null}
        {message ? <p className="text-sm text-text-muted">{message}</p> : null}
      </div>
      {action}
    </div>
  );
}
