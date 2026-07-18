"use client"

import React, { useState, useRef, useEffect } from "react"
import { X, GripVertical, UploadCloud } from "lucide-react"

export type ImageItem = {
  id: string
  type: "file" | "url"
  url?: string
  file?: File
  preview?: string
}

interface ImageUploaderProps {
  initialImages: string[]
  onChange: (items: ImageItem[]) => void
}

export default function ImageUploader({ initialImages, onChange }: ImageUploaderProps) {
  const [items, setItems] = useState<ImageItem[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Use a ref to track if it's the first mount to avoid overriding items when component re-renders
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      const initialItems = initialImages.map((url, i) => ({
        id: `url-${i}`,
        type: "url" as const,
        url,
        preview: url
      }))
      setItems(initialItems)
      initialized.current = true
    }
  }, [initialImages])

  useEffect(() => {
    // Only call onChange when items actually change
    onChange(items)
  }, [items, onChange])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const newFiles = Array.from(e.target.files)
    
    const newItems = newFiles.map((file) => ({
      id: `file-${Math.random().toString(36).substring(7)}`,
      type: "file" as const,
      file,
      preview: URL.createObjectURL(file)
    }))

    setItems((prev) => [...prev, ...newItems])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeImage = (id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id)
      const removed = prev.find((item) => item.id === id)
      if (removed?.type === "file" && removed.preview) {
        URL.revokeObjectURL(removed.preview)
      }
      return filtered
    })
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    
    if (!draggedId || draggedId === targetId) return

    setItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === draggedId)
      const newIndex = prev.findIndex((i) => i.id === targetId)
      
      if (oldIndex === -1 || newIndex === -1) return prev

      const newItems = [...prev]
      const [movedItem] = newItems.splice(oldIndex, 1)
      newItems.splice(newIndex, 0, movedItem)
      
      return newItems
    })
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  return (
    <div className="space-y-4 w-full">
      <div 
        className="border-2 border-dashed border-zinc-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 transition-colors bg-white group"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="text-[#D60006] w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-zinc-800">Haz clic para subir fotos</p>
        <p className="text-xs text-zinc-500 mt-1">Puedes elegir varias imágenes a la vez</p>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
      </div>

      {items.length > 0 && (
        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Ordena arrastrando las imágenes (la #1 es la principal)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item.id)}
                onDragOver={(e) => handleDragOver(e, item.id)}
                onDragEnd={handleDragEnd}
                className={`relative aspect-square rounded-lg overflow-hidden group border-2 ${
                  draggedId === item.id ? "border-[#D60006] opacity-50" : "border-transparent"
                } bg-zinc-200 cursor-move shadow-sm transition-all hover:shadow-md`}
              >
                <img 
                  src={item.preview} 
                  alt="preview" 
                  className="w-full h-full object-cover"
                />
                
                {/* Number Badge */}
                <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center justify-center backdrop-blur-sm shadow-sm
                  ${index === 0 ? "bg-[#D60006]" : "bg-black/60"}`}>
                  {index === 0 ? "Principal" : `#${index + 1}`}
                </div>

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(item.id); }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-transform hover:scale-110"
                  >
                    <X size={14} />
                  </button>
                  <GripVertical className="text-white/70" size={24} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
