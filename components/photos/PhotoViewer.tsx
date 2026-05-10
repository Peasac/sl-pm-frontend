"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Pen, RotateCcw, Save, Square, Circle, Type, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoViewerProps {
  src: string;
  alt: string;
  onClose: () => void;
  projectId: string;
  taskId: string;
  mediaId: string;
  onSave?: (imageUrl: string) => Promise<void>;
}

type DrawMode = "none" | "pen" | "eraser" | "line" | "rectangle" | "circle" | "text";

export function PhotoViewer({
  src,
  alt,
  onClose,
  projectId,
  taskId,
  mediaId,
  onSave,
}: PhotoViewerProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [drawMode, setDrawMode] = React.useState<DrawMode>("none");
  const [penColor, setPenColor] = React.useState("#FF0000");
  const [penSize, setPenSize] = React.useState(3);
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [previewCanvas, setPreviewCanvas] = React.useState<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [isImageLoaded, setIsImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [zoom, setZoom] = React.useState(1.0);
  const proxySrc = React.useMemo(
    () => `/api/media-proxy?url=${encodeURIComponent(src)}`,
    [src]
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const syncCanvasToImage = React.useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    }
  }, []);

  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas?.getContext("2d");
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (drawMode === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setStartX(x);
    setStartY(y);
    setIsDrawing(true);

    if (drawMode === "pen" || drawMode === "eraser") {
      const ctx = getContext();
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    } else if (drawMode === "text") {
      const text = prompt("Enter text:");
      if (text) {
        const ctx = getContext();
        if (ctx) {
          ctx.font = `${penSize * 8}px Arial`;
          ctx.fillStyle = penColor;
          ctx.fillText(text, x, y);
        }
      }
      setIsDrawing(false);
    } else {
      // Save canvas state for shape preview
      const canvas = canvasRef.current;
      if (canvas) {
        setPreviewCanvas(canvas.cloneNode() as HTMLCanvasElement);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || drawMode === "none" || drawMode === "text") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = getContext();
    if (!ctx) return;

    if (drawMode === "pen") {
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = penColor;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (drawMode === "eraser") {
      ctx.clearRect(x - penSize / 2, y - penSize / 2, penSize, penSize);
    } else {
      // Redraw original for preview
      if (previewCanvas) {
        const previewCtx = previewCanvas.getContext("2d");
        if (previewCtx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(previewCanvas, 0, 0);

          ctx.lineWidth = penSize;
          ctx.strokeStyle = penColor;
          ctx.fillStyle = penColor + "40"; // 25% opacity for fill

          if (drawMode === "line") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
          } else if (drawMode === "rectangle") {
            const width = x - startX;
            const height = y - startY;
            ctx.fillRect(startX, startY, width, height);
            ctx.strokeRect(startX, startY, width, height);
          } else if (drawMode === "circle") {
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setPreviewCanvas(null);
  };

  const handleClear = () => {
    syncCanvasToImage();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5));
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const handleSave = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) {
        alert("Unable to export image from canvas.");
        return;
      }

      const formData = new FormData();
      formData.append("file", blob, `edited-${Date.now()}.png`);

      const token = window.localStorage.getItem("slpm:token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(
        `${API_BASE}/projects/${projectId}/tasks/${taskId}/media/${mediaId}/upload`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok && data.success) {
        if (onSave && data?.data?.url) {
          await onSave(data.data.url);
        }
        alert("Image saved successfully!");
      } else {
        alert("Failed to save image");
      }
    } catch (error) {
      console.error("Error saving image:", error);
      alert("Error saving image");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 pointer-events-auto"
      onClick={(e) => {
        e.stopPropagation();
        // Only close on background clicks, not on the dialog itself
        if (e.target === e.currentTarget) {
          // Don't close here, only when X is clicked
        }
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onMouseUp={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        ref={containerRef}
        className="relative max-h-[90vh] max-w-[90vw] flex flex-col bg-neutral-900 rounded-lg overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b border-neutral-700"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white font-semibold text-lg">{alt}</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-neutral-800 rounded transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Canvas */}
        <div 
          className="flex-1 overflow-auto flex items-center justify-center bg-black p-4"
          onWheel={handleWheel}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          {!isImageLoaded && !imageError && (
            <div className="text-sm text-neutral-400">Loading image...</div>
          )}
          {imageError && (
            <div className="text-sm text-red-400">{imageError}</div>
          )}
          <div className="relative inline-block max-w-full" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
            <img
              ref={imageRef}
              src={proxySrc}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              className={`max-h-[70vh] max-w-full object-contain ${
                isImageLoaded ? "block" : "hidden"
              }`}
              onLoad={() => {
                setImageError(null);
                setIsImageLoaded(true);
                syncCanvasToImage();
              }}
              onError={() => {
                setIsImageLoaded(false);
                setImageError("Image failed to load.");
              }}
            />
            <canvas
              ref={canvasRef}
              onMouseDown={(e) => {
                e.stopPropagation();
                handleMouseDown(e as any);
              }}
              onMouseMove={(e) => {
                e.stopPropagation();
                handleMouseMove(e as any);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                handleMouseUp();
              }}
              onMouseLeave={(e) => {
                e.stopPropagation();
                handleMouseUp();
              }}
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-0 top-0 h-full w-full ${
                drawMode !== "none" ? "cursor-crosshair" : "cursor-default"
              } ${isImageLoaded ? "block" : "hidden"}`}
            />
          </div>
        </div>

        {/* Drawing Tools */}
        <div 
          className="border-t border-neutral-700 p-4 bg-neutral-800"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap gap-2 items-center">
            {/* Draw Mode Toggle */}
            <Button
              variant={drawMode === "none" ? "default" : "outline"}
              onClick={() => setDrawMode("none")}
              size="sm"
              className="text-xs"
            >
              View
            </Button>

            {/* Zoom Controls */}
            <Button
              variant="outline"
              onClick={handleZoomOut}
              size="sm"
              title="Zoom Out (Ctrl+Scroll)"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-xs text-neutral-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
            <Button
              variant="outline"
              onClick={handleZoomIn}
              size="sm"
              title="Zoom In (Ctrl+Scroll)"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-neutral-600" />

            {/* Pen Mode */}
            <Button
              variant={drawMode === "pen" ? "default" : "outline"}
              onClick={() => setDrawMode("pen")}
              size="sm"
            >
              <Pen className="w-4 h-4" />
            </Button>

            {/* Color Picker */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
                title="Pen color"
              />
            </div>

            {/* Pen Size */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-neutral-400">Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={penSize}
                onChange={(e) => setPenSize(parseInt(e.target.value))}
                className="w-16"
              />
            </div>

            {/* Eraser */}
            <Button
              variant={drawMode === "eraser" ? "default" : "outline"}
              onClick={() => setDrawMode("eraser")}
              size="sm"
              className="text-xs"
            >
              Eraser
            </Button>

            <div className="w-px h-6 bg-neutral-600" />

            {/* Shapes */}
            <Button
              variant={drawMode === "line" ? "default" : "outline"}
              onClick={() => setDrawMode("line")}
              size="sm"
              className="text-xs"
              title="Draw line"
            >
              Line
            </Button>

            <Button
              variant={drawMode === "rectangle" ? "default" : "outline"}
              onClick={() => setDrawMode("rectangle")}
              size="sm"
            >
              <Square className="w-4 h-4" />
            </Button>

            <Button
              variant={drawMode === "circle" ? "default" : "outline"}
              onClick={() => setDrawMode("circle")}
              size="sm"
            >
              <Circle className="w-4 h-4" />
            </Button>

            {/* Text */}
            <Button
              variant={drawMode === "text" ? "default" : "outline"}
              onClick={() => setDrawMode("text")}
              size="sm"
            >
              <Type className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-neutral-600" />

            {/* Clear */}
            <Button
              variant="outline"
              onClick={handleClear}
              size="sm"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>

            {/* Save */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="ml-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
