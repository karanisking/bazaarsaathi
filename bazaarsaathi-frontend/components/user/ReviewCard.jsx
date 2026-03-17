export default function ReviewCard({ review }) {
    const date = new Date(review.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  
    return (
      <div className="card p-5">
        <div className="flex items-start justify-between gap-4">
  
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">
                {review.user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-dark text-sm">
                {review.user?.name ?? 'User'}
              </p>
              <p className="text-gray-400 text-xs">{date}</p>
            </div>
          </div>
  
          {/* Stars */}
          <div className="flex items-center gap-0.5 shrink-0">
            {[1,2,3,4,5].map((s) => (
              <span
                key={s}
                className={s <= review.rating ? 'text-accent' : 'text-gray-200'}
              >
                ★
              </span>
            ))}
          </div>
        </div>
  
        {/* Comment */}
        {review.comment && (
          <p className="text-gray-600 text-sm mt-3 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    )
  }