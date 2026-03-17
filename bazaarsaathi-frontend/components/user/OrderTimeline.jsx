const ALL_STATUSES = [
    { key: 'Placed',            icon: '📋', label: 'Order Placed' },
    { key: 'Confirmed',         icon: '✅', label: 'Confirmed' },
    { key: 'Shipped',           icon: '📦', label: 'Shipped' },
    { key: 'Out for Delivery',  icon: '🚚', label: 'Out for Delivery' },
    { key: 'Delivered',         icon: '🎉', label: 'Delivered' },
  ]
  
  export default function OrderTimeline({ status, history = [] }) {
    const currentIdx = ALL_STATUSES.findIndex((s) => s.key === status)
  
    const getDate = (key) => {
      const entry = history.find((h) => h.status === key)
      if (!entry) return null
      return new Date(entry.updatedAt).toLocaleDateString('en-IN', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    }
  
    return (
      <div className="relative">
        {ALL_STATUSES.map((s, i) => {
          const isDone    = i <= currentIdx
          const isCurrent = i === currentIdx
          const date      = getDate(s.key)
  
          return (
            <div key={s.key} className="flex gap-4 relative">
  
              {/* Line */}
              {i < ALL_STATUSES.length - 1 && (
                <div className={`absolute left-5 top-10 w-0.5 h-full -translate-x-1/2
                  ${isDone ? 'bg-primary' : 'bg-gray-200'}`}
                />
              )}
  
              {/* Dot */}
              <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-lg z-10
                ${isDone
                  ? isCurrent
                    ? 'bg-primary text-white shadow-btn'
                    : 'bg-primary-100'
                  : 'bg-gray-100'
                }`}
              >
                {s.icon}
              </div>
  
              {/* Label */}
              <div className="pb-6 flex-1">
                <p className={`font-semibold text-sm
                  ${isDone ? 'text-dark' : 'text-gray-400'}`}
                >
                  {s.label}
                </p>
                {date && (
                  <p className="text-gray-400 text-xs mt-0.5">{date}</p>
                )}
                {isCurrent && !date && (
                  <p className="text-primary text-xs mt-0.5 font-semibold">
                    Current Status
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }