import React from "react";
import { Button } from "./button";
import { PanelLeft, PanelBottom } from "lucide-react";
import { useAppStore } from "../../store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

interface LayoutToggleProps {
  className?: string;
}

export const LayoutToggle: React.FC<LayoutToggleProps> = ({ className }) => {
  const { layoutOrientation, setLayoutOrientation } = useAppStore();

  const toggleLayout = () => {
    setLayoutOrientation(
      layoutOrientation === "horizontal" ? "vertical" : "horizontal"
    );
  };

  // Hide the toggle on small screens
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLayout}
            className={`hidden md:flex ${className}`} // Hide on mobile, show on md screens and up
            aria-label="Toggle layout orientation"
          >
            {layoutOrientation === "horizontal" ? (
              <PanelBottom size={16} />
            ) : (
              <PanelLeft size={16} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {layoutOrientation === "horizontal"
              ? "Switch to vertical layout"
              : "Switch to horizontal layout"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
