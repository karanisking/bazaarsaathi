export default function AddressCard({
    address,
    selectable = false,
    selected   = false,
    onSelect,
    onEdit,
    onDelete,
  }) {
    return (
      <div
        onClick={selectable ? onSelect : undefined}
        className={`border-2 rounded-2xl p-4 transition-all duration-200
          ${selectable ? 'cursor-pointer' : ''}
          ${selected
            ? 'border-primary bg-primary-50'
            : 'border-gray-200 hover:border-primary-200'
          }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
  
            {/* Radio */}
            {selectable && (
              <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center
                ${selected ? 'border-primary' : 'border-gray-300'}`}
              >
                {selected && (
                  <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                )}
              </div>
            )}
  
            {/* Address info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-dark text-sm">
                  {address.fullName}
                </span>
                <span className="badge-primary text-xs">{address.label}</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                {address.addressLine1}
                {address.addressLine2 && `, ${address.addressLine2}`}
                <br />
                {address.city}, {address.state} — {address.pincode}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                📞 {address.phone}
              </p>
            </div>
          </div>
  
          {/* Actions */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-2 shrink-0">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit() }}
                  className="text-primary text-xs font-semibold hover:underline"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete() }}
                  className="text-error text-xs font-semibold hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }