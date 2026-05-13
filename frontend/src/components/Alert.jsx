import { useEffect } from 'react';
import { AlertIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from './Icons';

export default function Alert({ type = 'error', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    error: <XCircleIcon size={18} />,
    success: <CheckCircleIcon size={18} />,
    warning: <AlertIcon size={18} />,
    info: <InfoIcon size={18} />,
  };

  const classMap = {
    error: 'alert-error',
    success: 'alert-success',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  return (
    <div className={`alert ${classMap[type]}`}>
      {icons[type]}
      <span>{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-auto p-1 hover:opacity-70">
          <span className="text-lg">&times;</span>
        </button>
      )}
    </div>
  );
}
