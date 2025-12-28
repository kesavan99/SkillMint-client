import { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";
import type { ColorResult } from "react-color";
import { Pipette } from "lucide-react";

interface ColorCustomizeProps {
  leftSidePanelcolors: string[];
  leftSideColor: string;
  setLeftSideColor: (color: string) => void;
}

function ColorCustomize({
  leftSidePanelcolors,
  leftSideColor,
  setLeftSideColor,
}: ColorCustomizeProps) {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2" id="color-customize">
      {/* Preset colors */}
      <div className="flex flex-wrap gap-2">
        {leftSidePanelcolors.map((color) => (
          <button
            key={color}
            onClick={() => setLeftSideColor(color)}
            style={{ backgroundColor: color }}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full cursor-pointer transition-all hover:scale-110 ${
              leftSideColor === color ? "ring-2 ring-offset-2 ring-black" : ""
            }`}
            title={`Select ${color}`}
          />
        ))}
      </div>

      {/* Pipette + popover */}
      <div className="relative" ref={pickerRef}>
        <button
          onClick={() => setShowPicker((prev) => !prev)}
          className="flex items-center justify-center p-2 transition-colors rounded-lg hover:bg-gray-100"
          title="Pick a custom color"
          aria-label="Pick a custom color"
        >
          <Pipette className="w-5 h-5 text-gray-700 sm:w-6 sm:h-6" />
        </button>

        {showPicker && (
          <div className="absolute right-0 z-50 shadow-xl top-12 sm:top-10 sm:right-auto sm:left-0">
            <SketchPicker
              color={leftSideColor}
              onChange={(c: ColorResult) => setLeftSideColor(c.hex)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorCustomize;
