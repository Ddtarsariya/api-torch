import type { KeyValuePair } from "../types";

// Function to mask sensitive values
export const maskValue = (value: string) => {
  if (!value) return "";
  if (value.length < 8) return "•".repeat(value.length);
  return (
    value.substring(0, 3) +
    "•".repeat(value.length - 6) +
    value.substring(value.length - 3)
  );
};

// Check if a variable key might be sensitive
export const isSensitiveKey = (key: string) => {
  const sensitivePatterns = [
    "token",
    "key",
    "secret",
    "password",
    "auth",
    "api_key",
    "apikey",
    "access",
  ];
  return sensitivePatterns.some((pattern) =>
    key.toLowerCase().includes(pattern),
  );
};

// Generate a color based on environment name (for visual variety)
export const getEnvColor = (name: string) => {
  const colors = [
    "from-blue-500/20 to-cyan-400/20 border-blue-500/30",
    "from-purple-500/20 to-pink-500/20 border-purple-500/30",
    "from-amber-500/20 to-orange-400/20 border-amber-500/30",
    "from-emerald-500/20 to-green-400/20 border-emerald-500/30",
    "from-rose-500/20 to-red-400/20 border-rose-500/30",
    "from-indigo-500/20 to-violet-400/20 border-indigo-500/30",
  ];

  // Simple hash function to pick a color based on name
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Process environment variables for display
export const processEnvironmentVariables = (variables: KeyValuePair[]) => {
  return variables.map((variable) => ({
    ...variable,
    displayValue: isSensitiveKey(variable.key)
      ? maskValue(variable.value)
      : variable.value,
  }));
};
