import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

interface MediaViewerModalProps {
  mediaUrl: string | null;
  type?: 'image' | 'video';
  fileName?: string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  mediaUrl,
  type = 'image',
  fileName = 'file',
  onClose
}) => {
  if (!mediaUrl) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = mediaUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleDownload}
            title="Download media"
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-sm transition-colors border border-slate-700/60"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            title="Close viewer"
            className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-sm transition-colors border border-slate-700/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
          {type === 'video' ? (
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="max-h-[80vh] max-w-full rounded-2xl"
            />
          ) : (
            <img
              src={mediaUrl}
              alt={fileName}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl select-none"
            />
          )}
        </div>

        {fileName && (
          <p className="mt-3 text-xs text-slate-400 font-mono text-center">
            {fileName}
          </p>
        )}
      </div>
    </div>
  );
};
