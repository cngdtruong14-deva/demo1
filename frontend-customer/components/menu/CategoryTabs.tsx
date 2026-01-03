'use client';

import { Category } from '@/lib/api';
import { useEffect, useRef } from 'react';

interface CategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function CategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryTabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLButtonElement>(null);

  // Scroll to selected tab when it changes
  useEffect(() => {
    if (selectedTabRef.current && tabsRef.current) {
      const tab = selectedTabRef.current;
      const container = tabsRef.current;
      const tabLeft = tab.offsetLeft;
      const tabWidth = tab.offsetWidth;
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;

      // Check if tab is out of view
      if (tabLeft < scrollLeft || tabLeft + tabWidth > scrollLeft + containerWidth) {
        container.scrollTo({
          left: tabLeft - containerWidth / 2 + tabWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedCategoryId]);

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div
        ref={tabsRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* All Categories Button */}
        <button
          ref={selectedCategoryId === null ? selectedTabRef : null}
          onClick={() => onSelectCategory(null)}
          className={`
            flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
            transition-all duration-200 flex items-center gap-2
            ${
              selectedCategoryId === null
                ? 'bg-orange-500 text-white shadow-md scale-105'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }
          `}
        >
          <span>🍽️</span>
          <span>Tất cả</span>
        </button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <button
            key={category.id}
            ref={selectedCategoryId === category.id ? selectedTabRef : null}
            onClick={() => onSelectCategory(category.id)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap
              transition-all duration-200 flex items-center gap-2
              ${
                selectedCategoryId === category.id
                  ? 'bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }
            `}
          >
            {category.icon && <span>{category.icon}</span>}
            <span>{category.name}</span>
            {category.product_count !== undefined && category.product_count > 0 && (
              <span
                className={`
                  px-2 py-0.5 rounded-full text-xs font-semibold
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
      
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

