import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { ExternalLink, RefreshCw, ZoomIn, ZoomOut } from "lucide-react";

interface ResponsePreviewProps {
  htmlContent: string;
}

export const ResponsePreview: React.FC<ResponsePreviewProps> = ({
  htmlContent,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(1);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [isLoading, setIsLoading] = useState(true);

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Refresh iframe content
  const refreshPreview = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      iframe.src = "about:blank";
      setTimeout(() => {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
        }
      }, 100);
    }
  };

  // Set content when component mounts
  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  // Handle zoom in/out
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  // Get container width based on view mode
  const getContainerWidth = () => {
    switch (viewMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
        return "100%";
      default:
        return "100%";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b flex items-center justify-between bg-muted/30">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList>
            <TabsTrigger value="desktop">Desktop</TabsTrigger>
            <TabsTrigger value="tablet">Tablet</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <ZoomOut size={16} />
          </Button>
          <span className="text-xs w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 2}
          >
            <ZoomIn size={16} />
          </Button>

          <Button variant="ghost" size="sm" onClick={refreshPreview}>
            <RefreshCw size={16} />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Create a blob URL and open in new tab
              const blob = new Blob([htmlContent], { type: "text/html" });
              const url = URL.createObjectURL(blob);
              window.open(url, "_blank");
              // Clean up the URL
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            }}
          >
            <ExternalLink size={16} />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-muted/20 flex justify-center">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}

        <div
          style={{
            width: getContainerWidth(),
            maxWidth: "100%",
            transform: `scale(${scale})`,
            transformOrigin: "top center",
            transition: "width 0.3s ease",
            height: scale > 1 ? `${100 / scale}%` : "100%",
          }}
          className="bg-white shadow-md"
        >
          <iframe
            ref={iframeRef}
            onLoad={handleIframeLoad}
            className="w-full h-full border-0"
            title="HTML Preview"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
