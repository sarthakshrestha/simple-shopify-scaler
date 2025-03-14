"use client";
import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Loader2, Upload, Download, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme based on system preference
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gradient-to-b overflow-y-hidden from-zinc-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-800 transition-colors duration-300">
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <Switch
          id="theme-toggle"
          checked={darkMode}
          onCheckedChange={toggleTheme}
        />
        <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <Label htmlFor="theme-toggle" className="sr-only">
          Toggle theme
        </Label>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl lg:text-7xl font-black mb-4 text-gray-800 dark:text-gray-100 transition-colors duration-300">
          Shopify Image Resizer
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-300 transition-colors duration-300">
          Resize your images to go below 25 MP with just a drop.
        </p>
      </motion.div>

      <motion.div layout className="w-full max-w-4xl">
        <Card className="border-none shadow-none bg-white dark:bg-gray-850 transition-colors duration-300">
          <CardContent className="p-6">
            <motion.div whileTap={{ scale: 0.99 }} className="w-full">
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-50"
                  }
                `}
              >
                <input {...getInputProps()} />

                <motion.div
                  animate={{ scale: isDragActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="mb-4"
                >
                  <Upload
                    size={64}
                    className="text-gray-400 dark:text-gray-500"
                  />
                </motion.div>

                <h2 className="text-3xl md:text-4xl items-center justify-center text-center font-bold text-zinc-800 dark:text-zinc-800 mb-3 transition-colors duration-300">
                  {isDragActive ? "Drop it here!" : "Upload an image"}
                </h2>

                <p className="text-center text-gray-500 dark:text-zinc-600 text-xl transition-colors duration-300">
                  Drag and drop your image here, or click to browse
                </p>
                <p className="text-center text-gray-400 dark:text-gray-500 text-lg mt-4 transition-colors duration-300">
                  All images will be resized to reduced to 25 MP and lower.
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
                  <p className="text-xl text-gray-700 dark:text-zinc-800 transition-colors duration-300">
                    Processing {fileName}
                  </p>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <Progress value={progress} className="h-3" />
              </motion.div>
            )}

            {downloadUrl && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6"
              >
                <Button
                  asChild
                  className="w-full py-8 text-xl flex items-center justify-center gap-3"
                  size="lg"
                >
                  <a
                    href={downloadUrl}
                    download={`resized-${fileName || "image.jpg"}`}
                  >
                    <Download className="h-6 w-6 mr-2" />
                    Download Resized Image (Below 25 MP)
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
