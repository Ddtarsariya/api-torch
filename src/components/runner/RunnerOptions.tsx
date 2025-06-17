import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import type { Environment, ApiRequest } from "../../types";

interface RunnerOptionsProps {
  showOptions: boolean;
  runOptions: {
    stopOnError: boolean;
    stopOnTestFailure: boolean;
    delay: number;
    saveResponses: boolean;
  };
  setRunOptions: (options: any) => void;
  activeEnvironment: Environment | undefined;
  requests: ApiRequest[];
}

export const RunnerOptions: React.FC<RunnerOptionsProps> = ({
  showOptions,
  runOptions,
  setRunOptions,
  activeEnvironment,
  requests,
}) => {
  if (!showOptions) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium mb-3">Run Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="stop-on-error"
                checked={runOptions.stopOnError}
                onCheckedChange={(checked: boolean) =>
                  setRunOptions({ ...runOptions, stopOnError: checked })
                }
              />
              <Label htmlFor="stop-on-error">Stop on error</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="stop-on-test-failure"
                checked={runOptions.stopOnTestFailure}
                onCheckedChange={(checked: boolean) =>
                  setRunOptions({ ...runOptions, stopOnTestFailure: checked })
                }
              />
              <Label htmlFor="stop-on-test-failure">Stop on test failure</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="save-responses"
                checked={runOptions.saveResponses}
                onCheckedChange={(checked: boolean) =>
                  setRunOptions({ ...runOptions, saveResponses: checked })
                }
              />
              <Label htmlFor="save-responses">Save responses</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="delay" className="flex-shrink-0">
                Delay between requests:
              </Label>
              <select
                id="delay"
                value={runOptions.delay}
                onChange={(e) =>
                  setRunOptions({
                    ...runOptions,
                    delay: parseInt(e.target.value),
                  })
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="0">No delay</option>
                <option value="500">0.5 seconds</option>
                <option value="1000">1 second</option>
                <option value="2000">2 seconds</option>
                <option value="5000">5 seconds</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              Environment: {activeEnvironment ? activeEnvironment.name : "None"}
            </p>
            <p>Total Requests: {requests.length}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
