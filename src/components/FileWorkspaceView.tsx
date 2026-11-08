import React, { useState } from 'react';
import { FileUp, FileText, Image as ImageIcon, Sparkles, Loader2, Volume2, CheckCircle2 } from 'lucide-react';

interface FileWorkspaceViewProps {
  onSpeakText: (text: string) => void;
}

export const FileWorkspaceView: React.FC<FileWorkspaceViewProps> = ({ onSpeakText }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setAnalysis(null);

      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Read file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const resultStr = reader.result as string;
          // Strip data URL header
          const base64Data = resultStr.split(',')[1];

          const res = await fetch('/api/analyze-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              mimeType: selectedFile.type || 'application/octet-stream',
              fileName: selectedFile.name,
              customPrompt: customPrompt.trim() || undefined,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'File analysis failed.');
          }

          setAnalysis(data.analysis);
        } catch (err: any) {
          setError(err?.message || 'File inspection failed, Sir.');
        } finally {
          setLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file from disk.');
        setLoading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setError(err?.message || 'File processing error');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-hud tracking-wider text-sm font-semibold text-cyan-200">
              DOCUMENT & VISUAL INTELLIGENCE WORKSPACE
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400/70">
              MULTIMODAL DEEP INSPECTION OF PDFS, SCHEMATICS & IMAGERY FOR SIR
            </p>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Drop Box */}
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-800/60 hover:border-cyan-400/80 rounded-2xl p-6 bg-slate-950/50 cursor-pointer transition group">
          <input
            type="file"
            accept="image/*,application/pdf,text/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
            <FileUp className="w-6 h-6" />
          </div>
          <span className="mt-3 text-xs font-hud text-cyan-300 font-semibold tracking-wider">
            {selectedFile ? selectedFile.name : 'SELECT PDF OR IMAGE ASSET'}
          </span>
          <span className="mt-1 text-[10px] font-mono-tech text-slate-400">
            {selectedFile
              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • ${selectedFile.type}`
              : 'Supports PDF, PNG, JPG, WEBP, Schematics'}
          </span>
        </label>

        {/* Custom Prompt & Action */}
        <div className="flex flex-col justify-between gap-3 p-4 rounded-2xl bg-black/40 border border-cyan-950">
          <div>
            <label className="block text-xs font-hud text-cyan-300 mb-1.5">
              CUSTOM DIRECTIVE / QUESTION:
            </label>
            <textarea
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., 'Summarize key engineering points and formulate 3 revision quiz questions for Sir...'"
              className="w-full bg-slate-950/70 border border-cyan-950 focus:border-cyan-400/70 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 disabled:opacity-40 text-cyan-300 text-xs font-hud tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_12px_rgba(6,182,212,0.2)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>EXECUTE MULTIMODAL AUDIT</span>
          </button>
        </div>
      </div>

      {/* Image Preview if applicable */}
      {previewUrl && (
        <div className="mt-4 p-2 rounded-xl border border-cyan-950 bg-black/40 flex items-center justify-center max-h-48 overflow-hidden">
          <img src={previewUrl} alt="Upload preview" className="max-h-44 object-contain rounded-lg" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs font-mono-tech">
          {error}
        </div>
      )}

      {/* Analysis Output */}
      {analysis && (
        <div className="flex-1 overflow-y-auto mt-4 p-4 rounded-xl border border-cyan-900/40 bg-black/50 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
            <div className="flex items-center gap-2 text-xs font-hud text-cyan-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>JARVIS EXECUTIVE AUDIT REPORT</span>
            </div>
            <button
              onClick={() => onSpeakText(analysis)}
              className="text-[11px] font-mono-tech text-cyan-400 hover:text-cyan-200 flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>READ ALOUD</span>
            </button>
          </div>

          <div className="text-sm font-sans text-slate-200 leading-relaxed whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};
