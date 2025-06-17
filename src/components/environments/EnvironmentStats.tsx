import React from "react";
import { Server, Key, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { Environment } from "../../types";

interface EnvironmentStatsProps {
  environments: Environment[];
  activeEnvironmentId: string | null;
}

export const EnvironmentStats: React.FC<EnvironmentStatsProps> = ({
  environments,
  activeEnvironmentId,
}) => {
  // Get environment stats
  const getEnvironmentStats = () => {
    const totalVars = environments.reduce(
      (sum, env) => sum + env.variables.length,
      0,
    );
    const activeEnv = environments.find(
      (env) => env.id === activeEnvironmentId,
    );
    const activeVars = activeEnv?.variables.length || 0;

    return {
      total: environments.length,
      variables: totalVars,
      activeVariables: activeVars,
    };
  };

  const stats = getEnvironmentStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Environments
              </p>
              <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Server className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Variables
              </p>
              <h3 className="text-2xl font-bold mt-1">{stats.variables}</h3>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-full">
              <Key className="h-5 w-5 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Active Variables
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {stats.activeVariables}
              </h3>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-full">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
