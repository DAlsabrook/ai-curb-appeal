'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Home, Loader2, Save, Check, Trash2, X, Info, Download, Maximize } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import '../styles/dashboard.css'
import { useUser } from './UserContext.js'; // Import the useUser hook
import { useDropzone } from 'react-dropzone';
import Image from 'next/image'
import Loader from './loader'

function InfoTooltip({ content }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="info-icon" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function Dashboard() {
  // Control Panel
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [numImages, setNumImages] = useState(4)
  const [designFlexibility, setDesignFlexibility] = useState(4)
  const [selectedModel, setSelectedModel] = useState('Select Model')
  const [selectedModelVersion, setSelectedModelVersion] = useState('')
  const [predictionError, setPredictionError] = useState('')

  // Create Model Modal
  const [modelName, setModelName] = useState(''); // State for model name
  const [modelNameError, setModelNameError] = useState(''); // State for model name error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Image window
  const [generatedImages, setGeneratedImages] = useState([])
  const [savedImages, setSavedImages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedImage, setExpandedImage] = useState(null);
  const [isExpandImageModalOpen, setIsExpandImageModalOpen] = useState(false);


  const [loadingImages, setLoadingImages] = useState([])
  const generateButtonRef = useRef(null)
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false)
  const [isCreateModelModalOpen, setIsCreateModelModalOpen] = useState(false)
  const { user } = useUser(); // From user context
  const [models, setModels] = useState([])

  // Loads models and generated images from userContext.js
  useEffect(() => {
    if (user && user.data && user.data.models) {
      const modelsFromUserContext = user.data.models;
      setModels(modelsFromUserContext);

      const newGeneratedImages = [];
      const newSavedImages = [];
      modelsFromUserContext.forEach((model) => {
        if (model.generated) {
          for (let i = 0; i < model.generated.length; i += 2) {
            const url = model.generated[i];
            const isSaved = model.generated[i + 1];
            const image = {
              id: `${model.name}-${Date.now()}-${Math.random()}`,
              url: url,
              isSaved: isSaved,
              model: model.name
            };
            newGeneratedImages.push(image);
            if (isSaved) {
              newSavedImages.push(image);
            }
          }
        } else {
          console.log('No Generated images')
        }
      });
      setGeneratedImages(newGeneratedImages);
      setSavedImages(newSavedImages);
    }
  }, [user]);

  // Generated image overlay save button
  const handleSave = (image) => {
    if (!image.isSaved) {
      const updatedImage = { ...image, isSaved: true }
      setGeneratedImages(prev => prev.map(img => img.id === image.id ? updatedImage : img))
      setSavedImages(prev => [updatedImage, ...prev])
    }
  }

  const handleExpandImage = (image) => {
    setExpandedImage(null);
    setExpandedImage(image);
    setIsExpandImageModalOpen(true);
  };

  // Generated image overlay download button
  const handleDownloadImage = (image) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `generated_image_${image.model}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // User removes image from saved images
  const handleRemove = (image) => {
    setSavedImages(prev => prev.filter(img => img.id !== image.id))
    setGeneratedImages(prev => prev.map(img => img.id === image.id ? { ...img, isSaved: false } : img))
  }

  // User selects a model from model modal
  const handleModelSelect = (modelName, modelVersion) => {
    setSelectedModel(modelName);
    setSelectedModelVersion(modelVersion);
    setIsModelDialogOpen(false);
  }

  // User wants to delete a model from their list
  const handleModelRemove = (modelId) => {
    setModels(prev => prev.filter(model => model.id !== modelId))
    if (selectedModel === models.find(model => model.id === modelId)?.name) {
      setSelectedModel('Select Model')
    }
  }

  // Used to group generated and saved images by model
  const groupImagesByModel = (images) => {
    const groups = {}
    images.forEach(image => {
      if (!groups[image.model]) {
        groups[image.model] = []
      }
      groups[image.model].push(image)
    })
    return Object.entries(groups)
  }

  // Drag and drop files
  const [files, setFiles] = useState([]);

  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const validateModelName = (name) => {
    const isValidName = /^[a-zA-Z0-9 ]+$/.test(name);
    if (!isValidName) {
      setModelNameError('Name must contain only letters and numbers');
      return false;
    }
    setModelNameError('');
    return true;
  };

  // When the user trains a new model
  const handleStartTraining = async () => {
    setIsSubmitting(true);
    if (!validateModelName(modelName)) {
      return;
    }

    const formData = new FormData();
    formData.append('name', modelName);
    formData.append('uid', user.uid);
    if (files.length < 10) {
      setModelNameError('Must have at least 10 images');
      setIsSubmitting(false);
      return;
    } else if (files.length > 20) {
      setModelNameError('Too many images (20 max)');
      setIsSubmitting(false);
      return;
    }
    files.forEach((file, index) => {
      formData.append(`filesList[${index}]`, file);
    });

    try {
      const response = await fetch('/api/ai/training', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        // Handle successful response
        setIsSubmitted(true);
        setIsSubmitting(false);
        setTimeout(() => {
          setIsCreateModelModalOpen(false);
          setIsSubmitted(false);
          }, 2000);
      } else {
        // Handle error response
        setIsSubmitting(false);
        console.error(`Error from training route`);
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('An unexpected error occurred:', error);
    }
  };

  // What happens when "Generate" button is clicked
  const handleGenerate = async () => {
    setPredictionError('');
    if (selectedModel === 'Select Model') {
      setPredictionError('You must select a model');
      return;
    };
    setIsGenerating(true);

    // Create placeholder cards with <Loader /> for each image being generated
    const placeholders = Array(numImages).fill(null).map((_, index) => ({
      id: `loading-${index}`,
      isLoading: true,
    }));
    setLoadingImages(placeholders);
    const formData = new FormData();
    formData.append('uid', user.uid);
    formData.append('negative_prompt', negativePrompt);
    formData.append('num_images', numImages);
    formData.append('designFlexibility', designFlexibility);
    formData.append('selected_model', selectedModel);
    formData.append('selected_model_version', selectedModelVersion);

    // OpenAI generates a better prompt
    try {
      let modelTrainedImage;
      console.log(user.data.models)
      for (let i = 0; i < user.data.models.length; i++) {
        const model = user.data.models[i];
        if (model.name === selectedModel) {
          modelTrainedImage = model.trainedImg;
          break; // Exit the loop once the match is found
        }
      }
      if (!modelTrainedImage) {
        setIsGenerating(false);
        setLoadingImages([]);
        setPredictionError('Could not find models training image');
        return;
      }
      const promptCreationData = {
        imageURL: modelTrainedImage,
        textPrompt: prompt,
      }
      console.log('Sending to prompt-creation route: ')
      console.log(promptCreationData)
      const response = await fetch('/api/ai/prompt-creation', {
        method: 'POST',
        body: JSON.stringify(promptCreationData),
      });
      if (response.ok) {
        formData.append('prompt', response.prompt);
      } else {
        setIsGenerating(false);
        setLoadingImages([]);
        setPredictionError('An unexpected error occurred generating the prompt!');
        return;
      }
    } catch (error) {
      setIsGenerating(false);
      setLoadingImages([]);
      setPredictionError('An unexpected error occurred generating the prompt!');
      return;
    }

    // Send prompt to replicate
    try {
      const currentModelName = selectedModel;
      const response = await fetch('/api/ai/predictions', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        // Handle successful response
        const responseData = await response.json();
        let newImages = [];
        responseData.forEach((predictionUrl) => {
          const image = {
            id: `${currentModelName}-${Date.now()}-${Math.random()}`,
            url: predictionUrl,
            isSaved: false,
            model: currentModelName
          };
          newImages.push(image);
        });
        setGeneratedImages(prev => [...newImages, ...prev]);
        setIsGenerating(false);
        setLoadingImages([]); // Remove the loaders
      } else {
        // Handle error response
        setIsGenerating(false);
        setLoadingImages([]);
        setPredictionError('An unexpected error occurred!');
      }
    } catch (error) {
      setIsGenerating(false);
      setLoadingImages([]);
      setPredictionError('An unexpected error occurred!', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="main-content">

        {/* Control panel */}
        <aside className="sidebar">
          <Card className="sidebar-card">
            <CardContent className="sidebar-content">
               <h2 className='sidebar-title'>Choose Your Model</h2>

              {/* Model select modal */}
              <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="model-select-button">
                    <Home className="model-icon" />
                    {selectedModel}
                  </Button>
                </DialogTrigger>
                <DialogContent className="model-dialog">
                  <DialogHeader>
                    <DialogTitle>Select or Create Model</DialogTitle>
                  </DialogHeader>
                  <div className="model-list">
                    {models.map((model) => (
                      <div key={model.modelID} className="model-item">
                        <Image
                          src={model.trainedImg}
                          alt={model.name}
                          className={"model-image"}
                          width={150}
                          height={100}
                          unoptimized
                          />
                        <Button onClick={() => handleModelSelect(model.name, model.version)} className="model-select-overlay">
                          {model.name}
                        </Button>
                          {/* Alert for deleting a model */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon" className="model-delete-button">
                                <X className="delete-icon" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this model?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the model and remove it from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleModelRemove(model.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    ))}
                  </div>

                  <Button onClick={() => {
                    setIsCreateModelModalOpen(true);
                    setIsModelDialogOpen(false);
                    }} className="upload-button">
                    Create New Model
                  </Button>
                </DialogContent>
              </Dialog>

              {/* Create Model modal */}
              {isCreateModelModalOpen && (
                <div className='modal-background'>
                  <div className="modal">
                    <div className="modal-content">
                      <div className='modal-buttons'>
                        <button onClick={() => {
                          setIsModelDialogOpen(true);
                          setIsCreateModelModalOpen(false);
                          }} className="close-button">&larr; back</button>
                        <button onClick={() => setIsCreateModelModalOpen(false)} className="close-button">close</button>
                      </div>

                      <h2>Create Your Own AI Model</h2>
                      <p>Upload 10-20 images of your home</p>
                      {isSubmitting ? (
                        <div className="mt-10 p-20">
                          <Loader />
                        </div>
                      ):(
                        isSubmitted ? (
                          <div> Submitted </div>
                        ):(
                        <div className="create-model-form">
                        <div>
                          <label htmlFor="model-name">Model Name: </label>
                          <input
                            id="model-name"
                            type="text"
                            placeholder="Enter model name"
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            onBlur={() => validateModelName(modelName)}
                            required
                          />
                          {modelNameError && <p className="error">{modelNameError}</p>}
                        </div>
                        <div {...getRootProps({ className: 'dropzone' })}>
                          <input {...getInputProps()} />
                          <p className='drag-n-drop-zone'><Upload className="upload-icon-drag-zone" />Drag &apos;n&apos; drop or click to select files</p>
                          <ul>
                            {files.map((file) => (
                              <li key={file.path}>{file.path}</li>
                            ))}
                          </ul>
                        </div>
                        <button className='create-model-form-button' onClick={handleStartTraining}>Start Training<Upload className="upload-icon" /></button>
                      </div>
                      )
                    )}

                    </div>
                  </div>
                </div>
              )}

              {/* Control panel form */}
              <div className="form-group">
                <h2 className='sidebar-title'>Craft Your Prompt</h2>
                <label htmlFor="prompt" className="input-label">
                  Prompt
                  <InfoTooltip content="Describe the image you want to generate in detail." />
                </label>
                <Input
                  id="prompt"
                  placeholder="Enter your prompt here"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="negative-prompt" className="input-label">
                  Negative Prompt
                  <InfoTooltip content="Describe what you don't want in the image." />
                </label>
                <Input
                  id="negative-prompt"
                  placeholder="Enter negative prompt here"
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="num-images" className="input-label">
                  Number of Images: {numImages}
                  <InfoTooltip content="Choose how many images to generate at once." />
                </label>
                <Slider
                  id="num-images"
                  min={1}
                  max={4}
                  step={1}
                  value={[numImages]}
                  onValueChange={(value) => setNumImages(value[0])}
                />
              </div>

              <div className="form-group">
                <label htmlFor="style-strength" className="input-label">
                  Design Flexibility: {designFlexibility}
                  <InfoTooltip content="Adjust how strongly the AI applies the style to the image." />
                </label>
                <Slider
                  id="style-strength"
                  min={0}
                  max={10}
                  step={.5}
                  value={[designFlexibility]}
                  onValueChange={(value) => setDesignFlexibility(value[0])}
                />
              </div>
              {predictionError && <p className="error">{predictionError}</p>}
              <div className="generate-button-container">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt}
                  className="generate-button"
                  ref={generateButtonRef}
                >
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
                {isGenerating && (
                  <motion.div
                    className="generate-progress"
                    animate={{
                      x: ['0%', '100%'],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'linear',
                    }}
                  />
                )}
              </div>

              <div className="prompt-tips">
                <p>Tips for great prompts:</p>
                <ul>
                  <li>Be specific and descriptive</li>
                  <li>Mention art styles or artists for inspiration</li>
                  <li>Include details about lighting and mood</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="main-area">
          <Tabs defaultValue="generated" className="image-tabs">
            <TabsList className="tabs-list">
              <TabsTrigger value="generated">Generated Images</TabsTrigger>
              <TabsTrigger value="saved">Saved Images</TabsTrigger>
            </TabsList>
            <TabsContent value="generated">
              <div className="image-grid">
                <AnimatePresence>
                  {loadingImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-row flex-wrap gap-4 justify-start items-start"
                    >
                      {loadingImages.map((placeholder) => (
                        <motion.div
                          key={placeholder.id}
                          className="relative w-[24%] h-[200px] rounded-lg overflow-hidden"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Loader />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {groupImagesByModel(generatedImages).map(([model, images]) => (
                  <div key={model} className="model-group">
                    <h3 className="model-title">{model}</h3>
                    <div className="image-list">
                      {images.map((image) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="image-item"
                        >
                          <Card className="image-card">
                            <CardContent className="image-content">
                              <motion.img
                                src={image.url}
                                alt={`Generated ${image.id}`}
                                className="generated-image"
                                whileHover={{ filter: "blur(20px)" }}
                              />
                              <motion.div
                                className="image-overlay"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                              >
                                <Button
                                  onClick={() => handleSave(image)}
                                  variant="secondary"
                                  size="icon"
                                  className="save-button"
                                >
                                  {image.isSaved ? (
                                    <Check className="save-icon saved" />
                                  ) : (
                                    <Save className="save-icon" />
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleDownloadImage(image)}
                                  variant="secondary"
                                  size="icon"
                                  className="download-image-button"
                                >
                                  <Download className="download-icon saved" />
                                </Button>
                                <Button
                                  onClick={() => handleExpandImage(image)}
                                  variant="secondary"
                                  size="icon"
                                  className="expand-image-button"
                                >
                                  <Maximize className="expand-icon saved" />
                                </Button>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="saved">
              <div className="image-grid">
                {groupImagesByModel(savedImages).map(([model, images]) => (
                  <div key={model} className="model-group">
                    <h3 className="model-title">{model}</h3>
                    <div className="image-list">
                      {images.map((image) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="image-item"
                        >
                          <Card className="image-card">
                            <CardContent className="image-content">
                              <motion.img
                                src={image.url}
                                alt={`Saved ${image.id}`}
                                className="saved-image"
                                whileHover={{ filter: "blur(2px)" }}
                              />
                              <motion.div
                                className="image-overlay"
                                initial={{ opacity: 0 }}
                                whileHover={{ opacity: 1 }}
                              >
                                <Button
                                  onClick={() => handleRemove(image)}
                                  variant="destructive"
                                  size="icon"
                                  className="remove-button"
                                >
                                  <Trash2 className="remove-icon" />
                                </Button>
                                <Button
                                  onClick={() => handleDownloadImage(image)}
                                  variant="secondary"
                                  size="icon"
                                  className="download-image-button"
                                >
                                  <Download className="download-icon saved" />
                                </Button>
                                <Button
                                  onClick={() => handleExpandImage(image)}
                                  variant="secondary"
                                  size="icon"
                                  className="expand-image-button"
                                >
                                  <Maximize className="expand-icon saved" />
                                </Button>
                              </motion.div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          {/* Modal for expanded image */}
          {isExpandImageModalOpen && expandedImage && (
            <Dialog open={isExpandImageModalOpen} onOpenChange={setIsExpandImageModalOpen}>
              <DialogHeader style={{display: 'none'}}>
                <DialogTitle>Expanded Image</DialogTitle>
              </DialogHeader>
              <DialogContent
                className="flex justify-center items-center"
                style={{ width: '100vw', padding: '0', overflow: 'hidden' }}
              >
                <Image
                  src={expandedImage.url}
                  alt={`Expanded ${expandedImage.id}`}
                  width={0}
                  height={0}
                  sizes="120%"
                  style={{ width: '100vw', height: '100%' }}
                />

              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  )
}
