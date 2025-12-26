import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  error?: string;
  helperText?: string;
  uploadedUrl?: string;
  loading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/*,.pdf',
  maxSize = 2 * 1024 * 1024, // 2MB default
  onFileSelect,
  onFileRemove,
  error,
  helperText,
  uploadedUrl,
  loading = false,
}) => {
  const [preview, setPreview] = useState<string | null>(uploadedUrl || null);
  const [fileName, setFileName] = useState<string>('');

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
        setFileName(file.name);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(null);
        }
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, curr) => ({ ...acc, [curr.trim()]: [] }), {}),
    maxSize,
    multiple: false,
  });

  const handleRemove = () => {
    setPreview(null);
    setFileName('');
    if (onFileRemove) onFileRemove();
  };

  const getFileIcon = () => {
    if (fileName.endsWith('.pdf')) {
      return <FileText className="w-12 h-12 text-red-500" />;
    }
    return <ImageIcon className="w-12 h-12 text-blue-500" />;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      {!preview && !fileName ? (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400',
            error && 'border-red-500',
            loading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} disabled={loading} />

          {loading ? (
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-primary-600 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          )}

          <p className="text-sm font-medium text-gray-700 mb-1">
            {isDragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500">
            {accept.includes('image') && 'Images'}
            {accept.includes('.pdf') && (accept.includes('image') ? ' or PDF' : 'PDF')}
            {' '}(Max {(maxSize / (1024 * 1024)).toFixed(0)}MB)
          </p>
        </div>
      ) : (
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {preview ? (
                <img src={preview} alt="Preview" className="w-20 h-20 object-cover rounded" />
              ) : (
                getFileIcon()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
              <p className="text-xs text-gray-500 mt-1">
                {uploadedUrl ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Uploaded successfully
                  </span>
                ) : loading ? (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  'Ready to upload'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-red-600">
          {fileRejections[0].errors[0].code === 'file-too-large'
            ? `File is too large. Max size is ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
            : 'Invalid file type'}
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
