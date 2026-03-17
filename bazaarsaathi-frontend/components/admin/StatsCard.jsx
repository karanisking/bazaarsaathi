export default function StatsCard({ title, value, icon, color = 'primary', sub }) {

    const colorMap = {
      primary: 'bg-primary-50 text-primary',
      accent:  'bg-accent-50  text-accent',
      success: 'bg-green-50   text-green-600',
      warning: 'bg-yellow-50  text-yellow-600',
      error:   'bg-red-50     text-red-500',
    }
  
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-400 text-sm font-semibold">{title}</p>
            <p className="font-heading font-bold text-3xl text-dark mt-1">
              {value ?? '—'}
            </p>
            {sub && (
              <p className="text-gray-400 text-xs mt-1">{sub}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${colorMap[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    )
  }