import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  category?: string;
  className?: string;
}

export const GoldenSeparator: React.FC<{ className?: string }> = ({ className = 'my-4' }) => (
  <div className={`h-0.5 w-full bg-gradient-to-r from-amber-500/80 via-amber-500/20 to-transparent ${className}`} />
);

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon,
  badge,
  actions,
  category,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {category && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500 mb-1 block">
              {category}
            </span>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            {icon && <span className="text-amber-500 flex-shrink-0">{icon}</span>}
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            {badge && <div className="inline-flex items-center">{badge}</div>}
          </div>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">{actions}</div>}
      </div>
      <GoldenSeparator />
    </div>
  );
};

export default PageHeader;
