'use client';

import * as React from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  /** Archivo o archivos seleccionados actualmente */
  value?: File | File[] | string | string[] | null;
  /** Callback al cambiar los archivos seleccionados */
  onChange?: (files: File[] | null) => void;
  /** Formatos aceptados (ej: 'image/*', 'application/pdf') */
  accept?: string;
  /** Tamaño máximo permitido por archivo en Megabytes */
  maxSizeMB?: number;
  /** Habilitar selección de múltiples archivos */
  multiple?: boolean;
  /** Estado de carga/progreso de la subida (0 a 100). Si se pasa, muestra barra de progreso. */
  uploadProgress?: number;
  /** Deshabilitar la interacción */
  disabled?: boolean;
  /** Clase CSS adicional para el contenedor principal */
  className?: string;
}

/**
 * Componente FileUpload
 * Área táctil e interactiva para subir archivos mediante drag & drop, con previsualización
 * y barra de progreso de subida.
 */
export function FileUpload({
  value,
  onChange,
  accept,
  maxSizeMB = 10, // 10MB por defecto
  multiple = false,
  uploadProgress,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Determinar la lista de archivos locales para mostrar previews
  const [localFiles, setLocalFiles] = React.useState<{ name: string; size: number; type: string; url?: string }[]>([]);

  // Sincronizar value externo con estado interno de visualización
  React.useEffect(() => {
    if (!value) {
      setLocalFiles([]);
      return;
    }

    const valueArray = Array.isArray(value) ? value : [value];
    const newLocalFiles = valueArray.map((item) => {
      if (item instanceof File) {
        return {
          name: item.name,
          size: item.size,
          type: item.type,
          url: item.type.startsWith('image/') ? URL.createObjectURL(item) : undefined,
        };
      } else if (typeof item === 'string') {
        const name = item.split('/').pop() || 'archivo-adjunto';
        return {
          name,
          size: 0,
          type: item.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          url: item,
        };
      }
      return { name: 'archivo', size: 0, type: 'unknown' };
    });

    setLocalFiles(newLocalFiles);

    // Limpieza de URLs creadas para previews
    return () => {
      newLocalFiles.forEach((file) => {
        if (file.url && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [value]);

  const processFiles = (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.size > maxSizeBytes) {
        setErrorMessage(`El archivo "${file.name}" supera el límite de ${maxSizeMB}MB.`);
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (onChange) {
        onChange(multiple ? validFiles : [validFiles[0]]);
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const onButtonClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (disabled) return;
    if (onChange) {
      if (multiple) {
        // En caso de que value sea un array de archivos
        const currentFiles = Array.isArray(value) ? (value as File[]) : [];
        const updatedFiles = currentFiles.filter((_, i) => i !== indexToRemove);
        onChange(updatedFiles.length > 0 ? updatedFiles : null);
      } else {
        onChange(null);
      }
    }
  };

  return (
    <div className={cn('space-y-4 w-full', className)}>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-gray-50/50 p-6 text-center transition-all cursor-pointer select-none active:scale-[0.99] dark:bg-gray-900/10 dark:border-gray-800',
          isDragActive && 'border-primary bg-primary/5 dark:bg-primary/10 dark:border-primary',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          disabled={disabled}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 duration-200 dark:bg-primary/20">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="mt-4 text-sm font-medium text-foreground">
          Arrastra tu archivo aquí o <span className="text-primary hover:underline">haz clic para buscar</span>
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground dark:text-gray-400">
          Formatos aceptados: {accept ? accept.replace(/\/\*/g, '') : 'Cualquiera'} (Max: {maxSizeMB}MB)
        </p>

        {errorMessage && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg animate-fade-in">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Barra de progreso de subida activa */}
      {uploadProgress !== undefined && uploadProgress >= 0 && (
        <div className="space-y-1.5 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground dark:text-gray-400">
            <span>Subiendo archivo...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Previsualización de archivos */}
      {localFiles.length > 0 && (
        <div className="space-y-2 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider dark:text-gray-400">
            Archivos seleccionados
          </p>
          <div className="grid grid-cols-1 gap-2">
            {localFiles.map((file, index) => {
              const isImage = file.type.startsWith('image/');
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-xl border border-muted-foreground/10 bg-white shadow-sm dark:bg-gray-900/50 dark:border-gray-800"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {isImage && file.url ? (
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border dark:border-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={file.url}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground dark:bg-gray-800 dark:text-gray-400">
                        <FileText className="h-5 w-5" />
                      </div>
                    )}
                    <div className="overflow-hidden text-left">
                      <p className="text-sm font-medium text-foreground truncate max-w-[180px] sm:max-w-[320px]">
                        {file.name}
                      </p>
                      {file.size > 0 && (
                        <p className="text-xs text-muted-foreground dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-red-950/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
