import Link from 'next/link'

export default function CategoryCard({ category }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-primary-50 transition-all duration-200"
    >
      {/* Image */}
      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-primary-50 group-hover:shadow-hover transition-all duration-200">
        <img
          src={`${category.image.url}?tr=w-200,h-200,fo-auto`}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Name */}
      <p className="text-dark font-semibold text-sm text-center leading-tight">
        {category.name}
      </p>
    </Link>
  )
}