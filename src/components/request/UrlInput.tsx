import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { Copy, Clock, Info, Check, AlertTriangle } from "lucide-react";
import { useAppStore } from "../../store";
import type { Environment, KeyValuePair } from "../../types";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  recentUrls: string[];
}

interface VariableMatch {
  fullMatch: string;
  variableName: string;
  startIndex: number;
  endIndex: number;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  onSend,
  recentUrls,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showVariablesPanel, setShowVariablesPanel] = useState(false);
  const [variableSuggestions, setVariableSuggestions] = useState<
    KeyValuePair[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTypingVariable, setIsTypingVariable] = useState(false);
  const [typingStartIndex, setTypingStartIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null); // Ref for the variable panel
  const { toast } = useToast();

  const { getActiveWorkspace, getEnvironments } = useAppStore();
  const workspace = getActiveWorkspace();
  const environments = getEnvironments();
  const activeEnvironment = environments.find(
    (e) => e.id === workspace?.activeEnvironmentId,
  );

  const activeVariables = useMemo(() => {
    return activeEnvironment?.variables?.filter((v) => v.enabled) || [];
  }, [activeEnvironment?.variables]);

  const getVariableValue = useCallback(
    (key: string): string | null => {
      if (!activeEnvironment?.variables) return null;
      const variable = activeEnvironment.variables.find(
        (v) => v.key === key && v.enabled,
      );
      return variable?.value || null;
    },
    [activeEnvironment?.variables],
  );

  const isVariableValid = useCallback(
    (key: string): boolean => {
      return getVariableValue(key) !== null;
    },
    [getVariableValue],
  );

  const parseVariables = useCallback((url: string): VariableMatch[] => {
    const matches: VariableMatch[] = [];
    const regex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = regex.exec(url)) !== null) {
      matches.push({
        fullMatch: match[0],
        variableName: match[1].trim(),
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return matches;
  }, []);

  const filteredVariables = useMemo(() => {
    if (!searchTerm) return activeVariables;

    return activeVariables.filter(
      (variable) =>
        variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        variable.value.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [activeVariables, searchTerm]);

  useEffect(() => {
    if (!value.trim() || !isFocused || isTypingVariable) {
      setSuggestions([]);
      return;
    }

    const matchingUrls = recentUrls
      .filter(
        (url) =>
          url.toLowerCase().includes(value.toLowerCase()) && url !== value,
      )
      .slice(0, 5);

    setSuggestions(matchingUrls);
  }, [value, recentUrls, isFocused, isTypingVariable]);

  useEffect(() => {
    if (!inputRef.current) return;

    const cursorPosition = inputRef.current.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPosition);

    const lastOpenBrace = textBeforeCursor.lastIndexOf("{{");
    const lastCloseBrace = textBeforeCursor.lastIndexOf("}}");

    const isCurrentlyTyping =
      lastOpenBrace > lastCloseBrace && lastOpenBrace !== -1;

    if (isCurrentlyTyping) {
      const variableStart = lastOpenBrace + 2;
      const currentSearch = textBeforeCursor.substring(variableStart);

      setIsTypingVariable(true);
      setTypingStartIndex(lastOpenBrace);
      setSearchTerm(currentSearch);

      const filtered = activeVariables.filter((variable) =>
        variable.key.toLowerCase().includes(currentSearch.toLowerCase()),
      );
      setVariableSuggestions(filtered);
    } else {
      setIsTypingVariable(false);
      setTypingStartIndex(-1);
      setSearchTerm("");
      setVariableSuggestions([]);
    }
  }, [value, activeVariables]);

  const renderHighlightedUrl = useMemo(() => {
    if (!value) return null;

    const variableMatches = parseVariables(value);

    if (variableMatches.length === 0) {
      return <span className="text-foreground">{value}</span>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    variableMatches.forEach((match, index) => {
      if (match.startIndex > lastIndex) {
        parts.push(
          <span key={`text-${index}`} className="text-foreground">
            {value.substring(lastIndex, match.startIndex)}
          </span>,
        );
      }

      const isValid = isVariableValid(match.variableName);
      const variableValue = getVariableValue(match.variableName);

      parts.push(
        <Popover key={`var-${match.startIndex}-${index}`}>
          <PopoverTrigger asChild>
            <span
              className={`py-0.5 rounded cursor-pointer transition-colors font-medium
                ${
                  isValid
                    ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                }`}
            >
              {match.fullMatch}
            </span>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-0 shadow-lg"
            side="bottom"
            align="start"
          >
            <div
              className={`p-3 ${isValid ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{match.variableName}</div>
                {isValid ? (
                  <div className="flex items-center text-xs text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-400 px-2 py-1 rounded-full">
                    <Check size={10} className="mr-1" /> Valid
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-400 px-2 py-1 rounded-full">
                    <AlertTriangle size={10} className="mr-1" /> Invalid
                  </div>
                )}
              </div>

              <div className="mt-3 text-sm">
                {isValid ? (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      Current Value:
                    </div>
                    <div className="p-2 bg-muted rounded font-mono text-xs break-all">
                      {variableValue}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      From environment:{" "}
                      <span className="font-medium">
                        {activeEnvironment?.name}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      Variable not found in active environment
                    </div>
                    {activeEnvironment ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Available in:{" "}
                        <span className="font-medium">
                          {activeEnvironment.name}
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2 text-xs text-muted-foreground">
                        No active environment selected
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="border-t p-3 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const newUrl = value.replace(match.fullMatch, "");
                  onChange(newUrl);
                }}
              >
                Remove
              </Button>{" "}
              {isValid && variableValue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const newUrl = value.replace(
                      match.fullMatch,
                      variableValue,
                    );
                    onChange(newUrl);
                  }}
                >
                  Replace with value
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>,
      );

      lastIndex = match.endIndex;
    });

    if (lastIndex < value.length) {
      parts.push(
        <span key="text-end" className="text-foreground">
          {value.substring(lastIndex)}
        </span>,
      );
    }

    return <>{parts}</>;
  }, [
    value,
    isVariableValid,
    getVariableValue,
    activeEnvironment?.name,
    parseVariables,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (variableSuggestions.length > 0) {
        insertVariable(variableSuggestions[0].key);
      } else {
        onSend();
      }
    } else if (e.key === "Escape") {
      setVariableSuggestions([]);
      setIsTypingVariable(false);
    } else if (e.key === "ArrowDown" && variableSuggestions.length > 0) {
      e.preventDefault();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast({
        title: "URL copied",
        description: "URL has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleScroll = () => {
    if (inputRef.current && displayRef.current) {
      displayRef.current.scrollLeft = inputRef.current.scrollLeft;
    }
  };

  const toggleVariablesPanel = () => {
    setShowVariablesPanel(!showVariablesPanel);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        inputRef.current &&
        !inputRef.current.contains(target) &&
        panelRef.current &&
        !panelRef.current.contains(target)
      ) {
        setShowVariablesPanel(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const insertVariable = useCallback(
    (variableKey: string) => {
      if (!inputRef.current) return;

      let newValue: string;
      let newCursorPos: number;

      if (isTypingVariable && typingStartIndex >= 0) {
        const cursorPos = inputRef.current.selectionStart || 0;
        const beforeTyping = value.substring(0, typingStartIndex);
        const afterCursor = value.substring(cursorPos);

        newValue = `${beforeTyping}{{${variableKey}}}${afterCursor}`;
        newCursorPos = typingStartIndex + variableKey.length + 4;
      } else {
        const cursorPos = inputRef.current.selectionStart || 0;
        const textBefore = value.substring(0, cursorPos);
        const textAfter = value.substring(cursorPos);

        newValue = `${textBefore}{{${variableKey}}}${textAfter}`;
        newCursorPos = cursorPos + variableKey.length + 4;
      }

      onChange(newValue);

      setIsTypingVariable(false);
      setTypingStartIndex(-1);
      setVariableSuggestions([]);
      setSearchTerm("");

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    },
    [value, onChange, isTypingVariable, typingStartIndex],
  );

  return (
    <div className="relative flex-1">
      <div
        className={`flex items-center border rounded-md transition-all ${
          isFocused ? "border-primary ring-1 ring-primary/20" : "border-input"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setTimeout(() => {
              setIsFocused(false);
            }, 150);
          }}
          onScroll={handleScroll}
          style={{ paddingBottom: "3px" }}
          className="w-full px-3 py-0 h-10 bg-transparent rounded-lg focus:outline-none pr-20 relative z-10 text-transparent caret-primary"
          placeholder="https://api.example.com/endpoint"
          spellCheck={false}
          autoComplete="off"
        />

        <div
          ref={displayRef}
          className="absolute inset-0 w-full px-2 py-1 h-10 bg-transparent rounded-md overflow-x-auto whitespace-nowrap pr-200 pointer-events-none flex items-center scrollbar-hide"
          style={{ zIndex: 1 }}
        >
          <div className="text-md">{renderHighlightedUrl}</div>
        </div>

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1 z-20">
          {activeEnvironment && activeVariables.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 ${
                showVariablesPanel
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={toggleVariablesPanel}
              title="Environment Variables"
            >
              <Info size={14} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={copyToClipboard}
            title="Copy URL"
            disabled={!value}
          >
            <Copy size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => setSuggestions(recentUrls.slice(0, 5))}
            title="Show History"
            disabled={recentUrls.length === 0}
          >
            <Clock size={14} />
          </Button>
        </div>
      </div>

      {suggestions.length > 0 && !isTypingVariable && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
          <div className="py-1">
            {suggestions.map((url, index) => (
              <button
                key={index}
                className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-accent focus:bg-accent focus:outline-none"
                onClick={() => {
                  onChange(url);
                  inputRef.current?.focus();
                }}
              >
                <Clock
                  size={14}
                  className="mr-2 text-muted-foreground flex-shrink-0"
                />
                <span className="truncate">{url}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {variableSuggestions.length > 0 && isTypingVariable && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-30 max-h-60 overflow-y-auto">
          <div className="py-1">
            <div className="px-3 py-2 text-xs text-muted-foreground border-b">
              {searchTerm
                ? `Variables matching "${searchTerm}"`
                : "Available Variables"}
            </div>
            {variableSuggestions.map((variable) => (
              <button
                key={variable.id}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-left hover:bg-accent focus:bg-accent focus:outline-none"
                onClick={() => insertVariable(variable.key)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-primary">
                    {variable.key}
                    {searchTerm && (
                      <span className="text-xs text-muted-foreground ml-1"></span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {variable.value}
                  </div>
                </div>
                <div className="text-xs text-primary ml-2">Tab</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showVariablesPanel &&
        activeEnvironment &&
        activeVariables.length > 0 && (
          <div
            ref={panelRef}
            className="absolute top-full right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 w-80"
          >
            <div className="p-3 border-b">
              <h4 className="text-sm font-medium">{activeEnvironment.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Click to insert variable into URL
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {activeVariables.map((variable) => (
                <button
                  key={variable.id}
                  className="flex items-center justify-between w-full px-3 py-3 text-sm text-left hover:bg-accent focus:bg-accent focus:outline-none border-b border-border/30 last:border-0"
                  onClick={() => {
                    insertVariable(variable.key);
                    setShowVariablesPanel(false);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-green-600 dark:text-green-400 mb-1">
                      {`{{${variable.key}}}`}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {variable.value}
                    </div>
                  </div>
                  <div className="text-xs text-primary ml-2 px-2 py-1 bg-primary/10 rounded">
                    Insert
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
};
