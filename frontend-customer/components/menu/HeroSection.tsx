'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface HeroSectionProps {
  branchName: string;
  branchAddress?: string;
  tableNumber?: string;
  bannerImage?: string;
}

export default function HeroSection({
  branchName,
  branchAddress,
  tableNumber,
  bannerImage,
}: HeroSectionProps) {
  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden bg-gradient-to-br from-orange-500 to-red-500">
      {/* Banner Image */}
      {bannerImage ? (
        <Image
          src={bannerImage}
          alt={branchName}
          fill
          className="object-cover"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-400 to-red-500" />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-4 md:p-6">
        {/* Branch Name & Logo Area */}
        <div className="mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {branchName}
          </h1>
        </div>

        {/* Table & Location Info */}
        <div className="flex flex-col gap-2">
          {tableNumber && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
              <span className="text-sm font-semibold text-white">
                Bàn {tableNumber}
              </span>
            </div>
          )}

          {branchAddress && (
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium drop-shadow-md">
                {branchAddress}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

