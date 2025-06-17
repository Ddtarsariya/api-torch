import React, { useEffect, useState } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { Code, Braces, Zap } from "lucide-react";
import { useAppStore } from "../../store"; // Import the global store

interface EnhancedCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  height?: string;
  placeholder?: string;
  snippets?: { name: string; code: string }[];
  readOnly?: boolean;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  value,
  onChange,
  language,
  height = "300px",
  placeholder,
  snippets = [],
  readOnly = false,
}) => {
  const { toast } = useToast();
  const [showSnippets, setShowSnippets] = useState(false);
  const monaco = useMonaco();
  const { theme } = useAppStore();
  const editorTheme = theme === "dark" ? "api-torch-dark" : "api-torch-light";

  // Define custom themes when Monaco is loaded
  useEffect(() => {
    if (monaco) {
      // Define a light theme that matches the app's light mode
      monaco.editor.defineTheme("api-torch-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "string", foreground: "0a7b4f" }, // Strings
          { token: "keyword", foreground: "0550ae" }, // Keywords
          { token: "comment", foreground: "747474" }, // Comments
          { token: "number", foreground: "ca5621" }, // Numbers
        ],
        colors: {
          "editor.background": "#f8f9fa",
          "editor.foreground": "#1e293b",
          "editor.lineHighlightBackground": "#f1f5f9",
          "editorCursor.foreground": "#6366f1",
          "editor.selectionBackground": "#e0e7ff",
          "editorLineNumber.foreground": "#94a3b8",
          "editorLineNumber.activeForeground": "#64748b",
          "editorIndentGuide.background": "#e2e8f0",
        },
      });

      // Define a dark theme that matches the app's dark mode
      monaco.editor.defineTheme("api-torch-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "string", foreground: "7dd3fc" }, // Strings
          { token: "keyword", foreground: "c4b5fd" }, // Keywords
          { token: "comment", foreground: "94a3b8" }, // Comments
          { token: "number", foreground: "fda4af" }, // Numbers
        ],
        colors: {
          "editor.background": "#0A1222",
          "editor.foreground": "#e2e8f0",
          "editor.lineHighlightBackground": "#1e293b",
          "editorCursor.foreground": "#818cf8",
          "editor.selectionBackground": "#312e81",
          "editorLineNumber.foreground": "#64748b",
          "editorLineNumber.activeForeground": "#94a3b8",
          "editorIndentGuide.background": "#1e293b",
        },
      });
    }
  }, [monaco]);

  const handleInsertSnippet = (code: string) => {
    if (readOnly) return;
    onChange(value ? `${value}\n${code}` : code);
    setShowSnippets(false);
    toast({
      title: "Snippet inserted",
      description: "Code snippet has been added to editor",
    });
  };

  const handleFormatCode = () => {
    if (readOnly) return;
    try {
      if (language === "json") {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);
        onChange(formatted);
        toast({
          title: "Code formatted",
          description: "JSON has been formatted",
        });
      } else {
        toast({
          title: "Formatting not available",
          description: `Formatting for ${language} is not supported yet`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Format failed",
        description: "Could not format code. Check for syntax errors.",
        variant: "destructive",
      });
    }
  };

  // Calculate the editor height based on whether we're showing the toolbar
  const editorHeight =
    height === "100%"
      ? !readOnly || snippets.length > 0
        ? "calc(100% - 32px)"
        : "100%"
      : height;

  return (
    <div className="border rounded-md overflow-hidden h-full flex flex-col">
      {/* Only show the toolbar if not in read-only mode or if there are snippets */}
      {(!readOnly || snippets.length > 0) && (
        <div className="flex items-center justify-between p-1 bg-muted/30 border-b">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            {language.toUpperCase()}
          </div>
          {!readOnly && (
            <div className="flex items-center">
              {snippets.length > 0 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowSnippets(!showSnippets)}
                  >
                    <Code size={14} className="mr-1.5" /> Snippets
                  </Button>

                  {showSnippets && (
                    <div className="absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-lg z-10 w-64 py-1 animate-in fade-in-50 zoom-in-95">
                      {snippets.map((snippet, index) => (
                        <button
                          key={index}
                          className="flex items-center w-full px-3 py-2 text-sm text-left hover:bg-accent"
                          onClick={() => handleInsertSnippet(snippet.code)}
                        >
                          <Zap size={14} className="mr-2 text-primary" />
                          {snippet.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleFormatCode}
                title="Format code"
              >
                <Braces size={14} className="mr-1.5" /> Format
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1">
        <Editor
          height={editorHeight}
          language={language}
          value={value}
          onChange={(newValue) => {
            if (!readOnly && newValue !== undefined) {
              onChange(newValue);
            }
          }}
          theme={editorTheme}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: "on",
            folding: true,
            wordWrap: "on",
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: !readOnly,
            formatOnType: !readOnly,
            suggestOnTriggerCharacters: !readOnly,
            quickSuggestions: !readOnly,
            readOnly: readOnly,
            renderLineHighlight: "all",
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
};
