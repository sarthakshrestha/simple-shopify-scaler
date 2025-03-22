"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  RefreshCw,
  Image as ImageIcon,
  X,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ResizedFile,
  processImages,
  downloadImagesAsZip,
  downloadSingleImage,
} from "@/utils/upload";

export default function ImageResizer() {
  const [resizedFiles, setResizedFiles] = useState<ResizedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewingImage, setViewingImage] = useState<ResizedFile | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setResizedFiles([]);

    const results = await processImages(acceptedFiles, setProgress);
    setResizedFiles(results);
    setIsProcessing(false);
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const imageHover = {
    rest: { scale: 1, filter: "brightness(1)" },
    hover: {
      scale: 1.03,
      filter: "brightness(1.1)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const buttonHover = {
    rest: { scale: 1 },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#0A0F0D] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(8,145,78,0.15),rgba(0,0,0,0))] flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="w-full max-w-5xl"
        initial="hidden"
        animate="visible"
        variants={staggerChildren}
      >
        {/* Header */}
        <motion.div className="text-center mb-10 md:mb-12" variants={fadeInUp}>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#008060] to-[#00b386] mb-6 tracking-tight pb-2">
            Shopify Scaler
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed">
            Resize your images to 2048px width in seconds
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={fadeInUp}>
          <Card className="overflow-hidden border border-[#1C2422] shadow-2xl rounded-2xl bg-gray-200/10 backdrop-blur-lg">
            <CardContent className="p-0">
              <AnimatePresence mode="wait">
                {!resizedFiles.length && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-8 md:p-10"
                  >
                    <div
                      {...getRootProps()}
                      className={`
                        border-3 border-dashed rounded-2xl p-10 md:p-16 lg:p-20
                        flex flex-col items-center justify-center cursor-pointer
                        transition-all duration-300 ease-in-out
                        ${
                          isDragActive
                            ? "border-[#008060] bg-[#008060]/10"
                            : "border-[#2C3532] hover:border-[#008060]/50 hover:bg-[#1C2422]"
                        }
                      `}
                    >
                      <input {...getInputProps()} />

                      <motion.div
                        animate={{
                          scale: isDragActive ? 1.1 : 1,
                          y: isDragActive ? -10 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                        className="mb-8"
                      >
                        {isDragActive ? (
                          <motion.div
                            initial={{ rotate: 0 }}
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Upload size={84} className="text-[#008060]" />
                          </motion.div>
                        ) : (
                          <ImageIcon size={84} className="text-slate-600" />
                        )}
                      </motion.div>

                      <h2 className="text-3xl md:text-4xl font-semibold text-slate-200 mb-4 tracking-tight text-center">
                        {isDragActive
                          ? "Drop images here"
                          : "Upload your images"}
                      </h2>

                      <p className="text-center text-slate-400 text-xl mb-6">
                        Drag and drop your images here, or click to select files
                      </p>

                      <motion.div
                        className="py-4 px-6 bg-[#008060]/10 rounded-lg text-[#00b386] text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        Images will be resized to 2048px width while preserving
                        aspect ratio
                      </motion.div>
                    </div>

                    {isProcessing && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-8"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <p className="text-xl text-slate-300">
                            Processing images...
                          </p>
                          <p className="text-[#00b386] font-medium text-xl">
                            {Math.round(progress)}%
                          </p>
                        </div>
                        <Progress
                          value={progress}
                          className="h-3 bg-[#1C2422]"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {resizedFiles.length > 0 && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="p-8 md:p-10"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between mb-8 gap-4">
                      <h3 className="text-2xl md:text-3xl font-medium text-slate-200 text-center ">
                        {resizedFiles.length}{" "}
                        {resizedFiles.length === 1 ? "image" : "images"} resized
                      </h3>
                      <Button
                        onClick={resetState}
                        variant="outline"
                        className="text-slate-500 border-[#2C3532]  text-base hover:bg-zinc-900 hover:text-white cursor-pointer"
                        size="lg"
                      >
                        <RefreshCw className="h-5 w-5 mr-2 hover:text-white" />
                        New Upload
                      </Button>
                    </div>

                    {resizedFiles.length === 1 ? (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col md:flex-row gap-8 items-center"
                      >
                        <div className="w-full md:w-1/2">
                          <motion.div
                            className="relative rounded-xl overflow-hidden shadow-lg aspect-square bg-[#1C2422] cursor-pointer"
                            initial="rest"
                            whileHover="hover"
                            variants={imageHover}
                            onClick={() => setViewingImage(resizedFiles[0])}
                          >
                            <img
                              src={resizedFiles[0].url}
                              alt={resizedFiles[0].name}
                              className="w-full h-full object-cover"
                            />
                            <motion.div
                              className="absolute inset-0 bg-[#008060]/20 opacity-0 flex items-center justify-center"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            >
                              <div className="bg-[#121917]/80 p-3 rounded-full">
                                <ZoomIn className="h-6 w-6 text-[#00b386]" />
                              </div>
                            </motion.div>
                          </motion.div>
                        </div>

                        <div className="w-full md:w-1/2 space-y-6">
                          <div className="p-6 bg-[#1C2422] rounded-xl">
                            <h4 className="text-base font-medium text-slate-400 mb-2">
                              Filename
                            </h4>
                            <p className="text-slate-200 text-xl truncate">
                              {resizedFiles[0].name}
                            </p>
                          </div>

                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            variants={buttonHover}
                          >
                            <Button
                              onClick={() =>
                                downloadSingleImage(resizedFiles[0])
                              }
                              className="w-full cursor-pointer py-8 text-xl bg-gradient-to-r from-[#008060] to-[#00b386] hover:from-[#006f54] hover:to-[#009973] text-white transition-all rounded-xl shadow-lg shadow-[#008060]/20"
                              size="lg"
                            >
                              <Download className="h-6 w-6 mr-3" />
                              Download Resized Image
                            </Button>
                          </motion.div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                          {resizedFiles.slice(0, 8).map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.1 * index }}
                              className="aspect-square rounded-xl overflow-hidden bg-[#1C2422] shadow-lg cursor-pointer relative group"
                              onClick={() => setViewingImage(file)}
                              whileHover="hover"
                              variants={imageHover}
                            >
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                              <motion.div
                                className="absolute inset-0 bg-[#008060]/20 opacity-0 flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                              >
                                <div className="bg-[#121917]/80 p-3 rounded-full">
                                  <ZoomIn className="h-5 w-5 text-[#00b386]" />
                                </div>
                              </motion.div>
                            </motion.div>
                          ))}

                          {resizedFiles.length > 8 && (
                            <div className="aspect-square rounded-xl overflow-hidden bg-[#1C2422] shadow-lg flex items-center justify-center">
                              <p className="text-slate-400 font-medium text-xl">
                                +{resizedFiles.length - 8} more
                              </p>
                            </div>
                          )}
                        </div>

                        <motion.div
                          initial="rest"
                          whileHover="hover"
                          variants={buttonHover}
                        >
                          <Button
                            onClick={() => downloadImagesAsZip(resizedFiles)}
                            className="w-full py-8 text-xl bg-gradient-to-r cursor-pointer from-[#008060] to-[#00b386] hover:from-[#006f54] hover:to-[#009973] text-white transition-all rounded-xl shadow-lg shadow-[#008060]/20"
                            size="lg"
                          >
                            <Download className="h-6 w-6 mr-3" />
                            Download All as ZIP
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 text-white text-base"
          variants={fadeInUp}
        >
          Resize your images securely in your browser — no file uploads required
        </motion.div>
      </motion.div>

      {/* Full Image Viewer Modal */}
      <AnimatePresence>
        {viewingImage && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/90 z-50 backdrop-blur-sm"
              onClick={() => setViewingImage(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="fixed inset-4 md:inset-10 lg:inset-16 z-50 flex flex-col bg-gray-300/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-gray-400/30"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-400/30">
                <h3 className="text-xl font-medium text-slate-200 truncate pr-4">
                  {viewingImage.name}
                </h3>
                <Button
                  onClick={() => setViewingImage(null)}
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 text-slate-400 hover:text-zinc-800 cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#0A0F0D]">
                <img
                  src={viewingImage.url}
                  alt={viewingImage.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="p-4 bg-gray-300/20 backdrop-blur-md border-t border-gray-400/30 flex justify-between items-center">
                <p className="text-white">Click outside the image to close</p>
                <Button
                  onClick={() => downloadSingleImage(viewingImage)}
                  className="bg-[#008060] hover:bg-[#006f54] text-white cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
