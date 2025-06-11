// src/components/request/EnhancedCodeEditor.tsx
import React, { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import { Button } from '../ui/button';
import { useToast } from '../../hooks/use-toast';
import { Code, Braces, Zap } from 'lucide-react';

interface EnhancedCodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language: string;
  height?: string;
  theme: string;
  placeholder?: string;
  snippets?: { name: string; code: string }[];
  readOnly?: boolean;
}

export const EnhancedCodeEditor: React.FC<EnhancedCodeEditorProps> = ({
  value,
  onChange,
  language,
  height = "300px",
  theme,
  placeholder,
  snippets = [],
  readOnly = false
}) => {
  const { toast } = useToast();
  const [showSnippets, setShowSnippets] = useState(false);

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
      if (language === 'json') {
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
  const editorHeight = height === "100%" 
    ? ((!readOnly || snippets.length > 0) ? "calc(100% - 32px)" : "100%") 
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
          onChange={readOnly ? undefined : onChange}
          theme={theme}
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            lineNumbers: 'on',
            folding: true,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: !readOnly,
            formatOnType: !readOnly,
            suggestOnTriggerCharacters: !readOnly,
            quickSuggestions: !readOnly,
            readOnly: readOnly,
          }}
        />
      </div>
    </div>
  );
};
