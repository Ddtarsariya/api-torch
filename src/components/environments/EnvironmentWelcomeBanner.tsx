import React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

interface EnvironmentWelcomeBannerProps {
  onDismiss: () => void;
}

export const EnvironmentWelcomeBanner: React.FC<
  EnvironmentWelcomeBannerProps
> = ({ onDismiss }) => {
  return (
    <div className="mb-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-blue-500/20 p-4 relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex">
          <div className="mr-4 mt-2">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Environment Tips</h3>
            <p className="text-muted-foreground mt-1">
              Use environments to store API keys, base URLs, and other variables
              that change between environments. You can switch between
              environments without changing your requests.
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
};
