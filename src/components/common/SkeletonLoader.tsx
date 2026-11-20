import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl bg-[#1a1a2e] border border-[#2a2a3e] p-4 flex flex-col justify-between animate-pulse">
      <div>
        <div className="w-full aspect-square rounded-xl bg-[#2a2a3e]/60 mb-3" />
        <div className="h-3 w-16 bg-[#2a2a3e]/80 rounded mb-2" />
        <div className="h-4 w-full bg-[#2a2a3e]/70 rounded mb-1" />
        <div className="h-4 w-3/4 bg-[#2a2a3e]/70 rounded mb-3" />
        <div className="h-3 w-20 bg-[#2a2a3e]/60 rounded" />
      </div>
      <div className="mt-4 pt-3 border-t border-[#2a2a3e] flex items-center justify-between">
        <div className="h-5 w-24 bg-[#2a2a3e] rounded" />
        <div className="w-9 h-9 rounded-xl bg-[#2a2a3e]" />
      </div>
    </div>
  );
};

export const BannerSkeleton: React.FC = () => {
  return (
    <div className="w-full h-80 sm:h-96 rounded-3xl bg-[#1a1a2e] border border-[#2a2a3e] animate-pulse p-8 flex items-center">
      <div className="w-1/2 space-y-4">
        <div className="h-4 w-28 bg-[#2a2a3e] rounded" />
        <div className="h-8 w-3/4 bg-[#2a2a3e] rounded" />
        <div className="h-4 w-full bg-[#2a2a3e] rounded" />
        <div className="h-10 w-36 bg-[#2a2a3e] rounded-xl" />
      </div>
    </div>
  );
};
