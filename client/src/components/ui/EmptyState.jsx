import React from 'react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export default function EmptyState({
  title = 'No Data Found',
  description = 'There are no records matching your current filter criteria.',
  icon: Icon = Inbox,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`py-12 px-4 text-center max-w-md mx-auto space-y-3 ${className}`}>
      <div className="inline-flex p-3 rounded-full bg-zinc-100 text-zinc-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-genesis-black">
        {title}
      </h3>
      <p className="text-xs text-genesis-muted leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <div className="pt-2">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
