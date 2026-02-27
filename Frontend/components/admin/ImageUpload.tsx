"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value: string; // Current image URL
    onChange: (url: string) => void; // Callback when image changes
    label?: string;
    required?: boolean;
}

export function ImageUpload({ value, onChange, label = "Upload Image", required = false }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        // Validate file
        if (!file.type.startsWith("image/")) {
            setError("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be less than 5MB");
            return;
        }

        setError("");
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/upload/product-image", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            const fullUrl = `http://localhost:5000${data.imageUrl}`;
            onChange(fullUrl);
        } catch (err: any) {
            setError(err.message || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleUpload(file);
        }
    };

    const handleRemove = () => {
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 flex items-center gap-2">
                <ImageIcon size={14} />
                {label}
                {required && <span className="text-red-500">*</span>}
            </label>

            {value ? (
                // Image Preview
                <div className="relative group">
                    <div className="relative w-full h-48 bg-gray-100 rounded-sm overflow-hidden">
                        <Image
                            src={value}
                            alt="Product image"
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 300px"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        aria-label="Remove image"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                // Upload Zone
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-sm p-8 text-center transition-colors ${dragActive
                            ? "border-orange-600 bg-orange-50"
                            : "border-gray-300 bg-gray-50 hover:border-gray-400"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={uploading}
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 text-orange-600 animate-spin" />
                            <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <Upload className="w-10 h-10 text-gray-400" />
                            <div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-orange-600 font-bold hover:text-orange-700"
                                >
                                    Click to upload
                                </button>
                                <span className="text-gray-600"> or drag and drop</span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</p>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <X size={14} />
                    {error}
                </p>
            )}
        </div>
    );
}
