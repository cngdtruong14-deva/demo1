'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Category } from '@/lib/api';

interface PremiumCategoryTabsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export default function PremiumCategoryTabs({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: PremiumCategoryTabsProps) {
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

      if (tabLeft < scrollLeft || tabLeft + tabWidth > scrollLeft + containerWidth) {
        container.scrollTo({
          left: tabLeft - containerWidth / 2 + tabWidth / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [selectedCategoryId]);

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div
        ref={tabsRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* All Categories Button */}
        <motion.button
          ref={selectedCategoryId === null ? selectedTabRef : null}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectCategory(null)}
          className={`
            relative flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap
            transition-all duration-200 flex items-center gap-2
            ${
              selectedCategoryId === null
                ? 'text-white'
                : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
            }
          `}
        >
          {selectedCategoryId === null && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">🍽️</span>
          <span className="relative z-10">Tất cả</span>
        </motion.button>

        {/* Category Buttons */}
        {categories.map((category) => (
          <motion.button
            key={category.id}
            ref={selectedCategoryId === category.id ? selectedTabRef : null}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={`
              relative flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap
              transition-all duration-200 flex items-center gap-2
              ${
                selectedCategoryId === category.id
                  ? 'text-white'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }
            `}
          >
            {selectedCategoryId === category.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-md"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            {category.icon && (
              <span className="relative z-10 text-lg">{category.icon}</span>
            )}
            <span className="relative z-10">{category.name}</span>
            {category.product_count !== undefined && category.product_count > 0 && (
              <span
                className={`
                  relative z-10 px-2 py-0.5 rounded-full text-xs font-bold
                  ${
                    selectedCategoryId === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }
                `}
              >
                {category.product_count}
              </span>
            )}
          </motion.button>
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

