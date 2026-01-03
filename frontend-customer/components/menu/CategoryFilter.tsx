'use client';

import { Category } from '@/lib/api';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-2 px-4">
        {/* All Categories Button */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
            transition-all duration-200
            ${
              selectedCategoryId === null
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          Tất cả
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
              transition-all duration-200 flex items-center gap-2
              ${
                selectedCategoryId === category.id
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
            {category.product_count > 0 && (
              <span
                className={`
                  px-2 py-0.5 rounded-full text-xs
                  ${
                    selectedCategoryId === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }
                `}
              >
                {category.product_count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

