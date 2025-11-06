"use client";

import { Slider } from "@/components/ui/slider";

interface PsychologySliderProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  lowLabel?: string;
  highLabel?: string;
  emoji?: string;
}

const getEmoji = (value: number, type: 'motivation' | 'stress' | 'confidence' | 'default') => {
  if (type === 'motivation') {
    if (value <= 3) return "😴";
    if (value <= 5) return "😐";
    if (value <= 7) return "🙂";
    return "🔥";
  }
  
  if (type === 'stress') {
    if (value <= 3) return "😌";
    if (value <= 5) return "😐";
    if (value <= 7) return "😰";
    return "😫";
  }
  
  if (type === 'confidence') {
    if (value <= 3) return "😟";
    if (value <= 5) return "😐";
    if (value <= 7) return "😊";
    return "💪";
  }
  
  return "⭐";
};

const getColor = (value: number) => {
  if (value <= 3) return "text-red-400";
  if (value <= 5) return "text-yellow-400";
  if (value <= 7) return "text-blue-400";
  return "text-green-400";
};

export function PsychologySlider({
  label,
  description,
  value,
  onChange,
  lowLabel = "Low",
  highLabel = "High",
  emoji
}: PsychologySliderProps) {
  const sliderType = label.toLowerCase().includes('motivation') ? 'motivation' :
                     label.toLowerCase().includes('stress') ? 'stress' :
                     label.toLowerCase().includes('confidence') ? 'confidence' : 'default';
  
  const displayEmoji = emoji || getEmoji(value, sliderType);
  const colorClass = getColor(value);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            {label}
            <span className={`text-2xl transition-all ${colorClass}`}>
              {displayEmoji}
            </span>
          </h3>
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        </div>
        <div className={`text-3xl font-bold ${colorClass} transition-all`}>
          {value}
        </div>
      </div>
      
      <div className="space-y-2">
        <Slider
          value={[value]}
          onValueChange={(values) => onChange(values[0])}
          min={0}
          max={10}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{lowLabel}</span>
          <span className="text-gray-400">{value}/10</span>
          <span>{highLabel}</span>
        </div>
      </div>
    </div>
  );
}

