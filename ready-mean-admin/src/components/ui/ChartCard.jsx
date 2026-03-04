import Card from './Card';

export default function ChartCard({ title, subtitle, action, children, className = '' }) {
  return (
    <Card className={`p-4 md:p-5 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </Card>
  );
}
