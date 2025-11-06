"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { StudentCategory } from "@/lib/data/student-categories";

interface CategoryCardProps {
  category: StudentCategory;
  isSelected: boolean;
  onClick: () => void;
}

export function CategoryCard({ category, isSelected, onClick }: CategoryCardProps) {
  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
        isSelected
          ? `border-2 bg-gradient-to-br ${category.gradient} bg-opacity-20 border-yellow-400 neon-glow`
          : 'glass border-yellow-500/20 hover:border-yellow-500/50'
      }`}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-5xl mb-3">{category.emoji}</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {category.title}
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            {category.description}
          </p>
          <div className="space-y-1">
            {category.examples.map((example, idx) => (
              <p key={idx} className="text-slate-400 text-xs">
                • {example}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

