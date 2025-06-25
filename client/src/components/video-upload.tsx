import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Video, Upload, X, Play } from "lucide-react";

interface VideoUploadProps {
  onVideoSelect: (file: File | null) => void;
  selectedVideo: File | null;
}

export default function VideoUpload({ onVideoSelect, selectedVideo }: VideoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    console.log("=== VIDEO UPLOAD DEBUG ===");
    console.log("Selected file:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    // Validate file type - be more permissive
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo'];
    if (!file.type.startsWith('video/') && !validTypes.some(type => file.type === type)) {
      console.warn("Unsupported file type:", file.type);
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo de vídeo (MP4, WebM, MOV, AVI)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB limit for better compatibility)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "O vídeo deve ter no máximo 100MB",
        variant: "destructive",
      });
      return;
    }

    console.log("File validation passed, setting video");
    onVideoSelect(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    toast({
      title: "Vídeo selecionado!",
      description: `Arquivo: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = () => {
    onVideoSelect(null);
    setPreviewUrl(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-white">Vídeo dos animais</Label>
      
      {selectedVideo && previewUrl ? (
        <div className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video
              src={previewUrl}
              controls
              className="w-full h-48 object-cover"
              onLoadedMetadata={() => {
                toast({
                  title: "Vídeo carregado",
                  description: "Vídeo selecionado com sucesso",
                });
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-secondary">
            <p><strong>Arquivo:</strong> {selectedVideo.name}</p>
            <p><strong>Tamanho:</strong> {(selectedVideo.size / (1024 * 1024)).toFixed(2)} MB</p>
            <p><strong>Tipo:</strong> {selectedVideo.type}</p>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? "border-accent-green bg-accent-green/10" 
              : "border-gray-600 hover:border-gray-500"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-400 mb-2">
            Faça upload de um vídeo dos animais
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Arraste e solte o arquivo aqui ou clique para selecionar
          </p>
          <Button
            type="button"
            onClick={openFileDialog}
            className="bg-accent-green hover:bg-green-600 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Vídeo
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Formatos aceitos: MP4, MOV, AVI (máx. 50MB)
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
