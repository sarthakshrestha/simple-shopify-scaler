"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Loader2, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Background from "@/components/eldoraui/novatrixbg";
export default function Home() {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const TARGET_WIDTH = 2048;

        // Calculate height to maintain aspect ratio
        const aspectRatio = img.height / img.width;
        const newHeight = Math.round(TARGET_WIDTH * aspectRatio);

        // Set canvas dimensions
        canvas.width = TARGET_WIDTH;
        canvas.height = newHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, TARGET_WIDTH, newHeight);

        // Convert to blob and create URL
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error("Failed to create blob"));
            }
          },
          file.type,
          0.9 // Quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));

      // Load the image
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);
    setProgress(0);
    setDownloadUrl(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const url = await resizeImage(file);
      setDownloadUrl(url);

      // Complete the progress
      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error("Error resizing image:", error);
      setIsProcessing(false);
      clearInterval(progressInterval);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen  p-4 md:p-8 relative overflow-hidden">
      {/* Novatrix Background with lowered opacity container */}
      <div className="absolute inset-0 z-0 opacity-80 blur-md">
        <Background />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl text-center mb-8 relative z-10  backdrop-blur-xs"
      >
        <h1 className="text-5xl md:text-4xl lg:text-7xl font-medium text-zinc-700 mb-4 ">
          Shopify Image Resizer
        </h1>
        <p className="text-2xl md:text-3xl text-zinc-600">
          Resize your images to go below 25 MP with just a drop.
        </p>
      </motion.div>

      <motion.div layout className="w-full max-w-4xl relative z-10">
        <Card className="border-none shadow-xl bg-black/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <motion.div whileTap={{ scale: 0.99 }} className="w-full">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${
                    isDragActive
                      ? "border-white/70 bg-white/10"
                      : "border-white/30 hover:border-white/50 hover:bg-white/5"
                  }
                `}
              >
                <input {...getInputProps()} />

                <motion.div
                  animate={{ scale: isDragActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="mb-4"
                >
                  <Upload size={64} className="text-white/70" />
                </motion.div>

                <h2 className="text-3xl md:text-4xl items-center justify-center text-center font-bold text-white mb-3">
                  {isDragActive ? "Drop it here!" : "Upload an image"}
                </h2>

                <p className="text-center text-white/80 text-xl">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-center text-white/60 text-lg mt-4">
                  Uploaded will be reduced to 25 MP so you can upload to Shopify
                  easily.
                </p>
              </div>
            </motion.div>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xl text-white/90">Processing {fileName}</p>
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
                <Progress value={progress} className="h-3" />
              </motion.div>
            )}

            {downloadUrl && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 w-full px-4 sm:px-0"
              >
                <Button
                  asChild
                  className="w-full py-4 sm:py-8 text-base sm:text-xl flex items-center justify-center gap-2 sm:gap-3 bg-white/20 hover:bg-white/30 text-white"
                  size="lg"
                >
                  <a
                    href={downloadUrl}
                    download={`resized-${fileName || "image.jpg"}`}
                  >
                    <Download className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                    <span className="text-sm sm:text-base md:text-xl">
                      Download Resized Image
                    </span>
                  </a>
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
