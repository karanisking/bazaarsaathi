'use client'
import Link from 'next/link'

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { product, quantity } = item
  const hasDiscount = product.discountPercentage > 0
  const itemTotal   = product.discountedPrice * quantity

  return (
    <div className="card p-4 flex items-center gap-4">

      {/* Image */}
      <Link href={`/product/${product._id}`} className="shrink-0">
        <img
          src={`${product.images[0]?.url}?tr=w-100,h-100,fo-auto`}
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover bg-gray-50"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${product._id}`}>
          <p className="font-semibold text-dark text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </p>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-1">
          <span className="font-bold text-dark">₹{product.discountedPrice}</span>
          {hasDiscount && (
            <span className="text-gray-400 text-xs line-through">
              ₹{product.sellingPrice}
            </span>
          )}
          {hasDiscount && (
            <span className="discount-tag">
              {product.discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Stock warning */}
        {product.stock < 5 && (
          <p className="text-warning text-xs mt-1 font-semibold">
            Only {product.stock} left
          </p>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-3 shrink-0">

        {/* Item total */}
        <p className="font-heading font-bold text-dark">
          ₹{itemTotal}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => {
              if (quantity === 1) {
                onRemove(product._id)
              } else {
                onUpdateQuantity(product._id, quantity - 1)
              }
            }}
            className="px-3 py-1.5 text-dark font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            {quantity === 1 ? '🗑' : '−'}
          </button>
          <span className="px-3 py-1.5 font-semibold text-dark text-sm min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => onUpdateQuantity(product._id, quantity + 1)}
            disabled={quantity >= product.stock}
            className="px-3 py-1.5 text-dark font-bold hover:bg-gray-50 transition-colors text-sm disabled:opacity-40"
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(product._id)}
          className="text-error text-xs font-semibold hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  )
}