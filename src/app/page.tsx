"use client";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Loader2, Upload, Download, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Background from "@/components/eldoraui/novatrixbg";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function Home() {
  const [resizedFiles, setResizedFiles] = useState<
    { name: string; blob: Blob; url: string }[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const resizeImage = (
    file: File
  ): Promise<{ name: string; blob: Blob; url: string }> => {
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
              resolve({ name: file.name, blob, url });
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
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResizedFiles([]);

    const resizedImages: { name: string; blob: Blob; url: string }[] = [];
    const progressStep = 100 / acceptedFiles.length;

    for (const file of acceptedFiles) {
      try {
        const resizedImage = await resizeImage(file);
        resizedImages.push(resizedImage);
        setProgress((prev) => prev + progressStep);
      } catch (error) {
        console.error("Error resizing image:", error);
      }
    }

    setResizedFiles(resizedImages);
    setIsProcessing(false);
    setProgress(100);
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    resizedFiles.forEach(({ name, blob }) => {
      zip.file(name, blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "resized-images.zip");
  };

  const resetState = () => {
    setResizedFiles([]);
    setIsProcessing(false);
    setProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp"],
    },
  });

  return (
    <div className="flex flex-col bg-gradient-to-b from-zinc-300 via-zinc-600 to-zinc-600  items-center justify-center h-screen w-screen p-4 md:p-8 relative overflow-y-auto max-sm:p-6">
      {/* Novatrix Background with lowered opacity container */}
      <div className="absolute inset-0 z-0 opacity-70 ">
        <Background />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl text-center mb-8 relative z-10 backdrop-blur-xs"
      >
        <h1 className="text-5xl md:text-4xl lg:text-7xl text-white mb-4">
          Shopify Image Resizer
        </h1>
        <p className="text-2xl md:text-3xl text-white">
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
                  {isDragActive ? "Drop it here!" : "Upload images"}
                </h2>

                <p className="text-center text-white/80 text-xl max-sm:text-lg">
                  Drag and drop your images here, or click to browse
                </p>
                <p className="text-center text-white/60 text-lg mt-4 max-sm:text-lg">
                  Uploaded images will be resized to 2048px width.
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
                  <p className="text-xl text-white/90">Processing...</p>
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
                <Progress value={progress} className="h-3" />
              </motion.div>
            )}

            {resizedFiles.length === 1 && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 w-full px-4 sm:px-0"
              >
                <Card className="w-full max-w-sm mx-auto bg-white/10 p-4 rounded-lg">
                  <img
                    src={resizedFiles[0].url}
                    alt={resizedFiles[0].name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </Card>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    asChild
                    className="py-4 sm:py-8 text-base sm:text-xl flex items-center justify-center gap-2 sm:gap-3 bg-white/5 hover:bg-white/10 text-white"
                    size="lg"
                  >
                    <a
                      href={resizedFiles[0].url}
                      download={`resized-${resizedFiles[0].name}`}
                    >
                      <Download className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                      Download Resized Image
                    </a>
                  </Button>
                  <Button
                    onClick={resetState}
                    className="py-4 sm:py-8 text-base hover:cursor-pointer sm:text-xl flex items-center justify-center gap-2 sm:gap-3 bg-black/30 hover:bg-opacity-80 text-white"
                    size="lg"
                  >
                    <RotateCw className="h-4 w-4 sm:h-6 sm:w-6" />
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}

            {resizedFiles.length > 1 && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 w-full px-4 sm:px-0"
              >
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={downloadZip}
                    className="py-4 sm:py-8 text-base sm:text-xl hover:cursor-pointer flex items-center justify-center gap-2 sm:gap-3 bg-white/20 hover:bg-white/30 text-white"
                    size="lg"
                  >
                    <Download className="h-4 w-4 sm:h-6 sm:w-6 mr-1 sm:mr-2" />
                    Download All Resized Images (ZIP)
                  </Button>
                  <Button
                    onClick={resetState}
                    className="py-4 sm:py-8 text-base sm:text-xl hover:cursor-pointer flex items-center justify-center gap-2 sm:gap-3 bg-black/30 hover:bg-opacity-80 text-white"
                    size="lg"
                  >
                    <RotateCw className="h-4 w-4 sm:h-6 sm:w-6" />
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
