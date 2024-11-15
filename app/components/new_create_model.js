'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X } from 'lucide-react'

export default function CreateModelModal({ isOpen, onClose, onCreateModel }) {
  const [modelName, setModelName] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [error, setError] = useState('')

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + selectedImages.length > 20) {
      setError('You can upload a maximum of 20 images.')
      return
    }
    setSelectedImages(prev => [...prev, ...files.slice(0, 20 - prev.length)])
    setError('')
  }

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedImages.length < 10) {
      setError('Please upload at least 10 images.')
      return
    }
    if (!modelName.trim()) {
      setError('Please enter a model name.')
      return
    }

    const formData = new FormData()
    formData.append('modelName', modelName)
    selectedImages.forEach((image, index) => {
      formData.append(`image${index}`, image)
    })

    try {
      const response = await fetch('/api/create-model', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const newModel = await response.json()
        onCreateModel(newModel)
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create model')
      }
    } catch (error) {
      console.error('Error creating model:', error)
      setError('An unexpected error occurred')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Model</DialogTitle>
          <DialogDescription>
            Upload 10-20 images and name your new model.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="model-name">Model Name</Label>
              <Input
                id="model-name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="Enter model name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image-upload">Upload Images</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {selectedImages.length > 0 && (
              <div className="grid gap-2">
                <Label>Selected Images ({selectedImages.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Selected ${index + 1}`}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Create Model</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
