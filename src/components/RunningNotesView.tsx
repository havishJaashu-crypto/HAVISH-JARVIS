import React, { useState } from 'react';
import { Edit3, Mic, MicOff, Search, Plus, Trash2, Download, Copy, Check, FileDown } from 'lucide-react';
import { RunningNote } from '../types';

interface RunningNotesViewProps {
  notes: RunningNote[];
  onAddNote: (note: { title: string; content: string; category: string; language: string }) => void;
  onDeleteNote: (id: string) => void;
}

export const RunningNotesView: React.FC<RunningNotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDictating, setIsDictating] = useState(false);
  const [dictatedText, setDictatedText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Voice Dictation');
  const [noteLang, setNoteLang] = useState('Tanglish');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['All', 'Voice Dictation', 'System', 'Engineering', 'Personal', 'Meeting'];

  const filteredNotes = notes.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleStartDictation = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsDictating(true);
    };

    recognition.onresult = (event: any) => {
      let full = '';
      for (let i = 0; i < event.results.length; ++i) {
        full += event.results[i][0].transcript + ' ';
      }
      setDictatedText(full.trim());
    };

    recognition.onerror = () => {
      setIsDictating(false);
    };

    recognition.onend = () => {
      setIsDictating(false);
    };

    recognition.start();
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictatedText.trim()) return;

    onAddNote({
      title: noteTitle.trim() || `Dictated Note - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      content: dictatedText.trim(),
      category: noteCategory,
      language: noteLang,
    });

    setNoteTitle('');
    setDictatedText('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportText = (note: RunningNote) => {
    const content = `TITLE: ${note.title}\nCATEGORY: ${note.category}\nDATE: ${note.timestamp}\nLANGUAGE: ${note.language}\n\n${note.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`;
    a.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-hud tracking-wider text-sm font-semibold text-cyan-200">
              ALWAYS-AVAILABLE RUNNING NOTES
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400/70">
              MULTILINGUAL CONTINUOUS VOICE DICTATION (TELUGU, TANGLISH & ENGLISH)
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-8 pr-3 py-1.5 rounded-lg bg-black/50 border border-cyan-950 focus:border-cyan-400 text-xs text-white placeholder:text-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Dictation Box */}
      <form onSubmit={handleSaveNote} className="mt-4 p-4 rounded-xl border border-cyan-900/50 bg-black/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Note subject or topic..."
            className="flex-1 min-w-[200px] bg-slate-950 border border-cyan-950 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-2">
            <select
              value={noteCategory}
              onChange={(e) => setNoteCategory(e.target.value)}
              className="bg-slate-950 border border-cyan-950 text-cyan-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="Voice Dictation">Voice Dictation</option>
              <option value="Engineering">Engineering</option>
              <option value="Personal">Personal</option>
              <option value="Meeting">Meeting</option>
              <option value="System">System</option>
            </select>

            <select
              value={noteLang}
              onChange={(e) => setNoteLang(e.target.value)}
              className="bg-slate-950 border border-cyan-950 text-cyan-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="Tanglish">Tanglish</option>
              <option value="Telugu">Telugu</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={dictatedText}
            onChange={(e) => setDictatedText(e.target.value)}
            placeholder="Type note or tap the microphone to start real-time multilingual voice dictation..."
            className="w-full bg-slate-950/70 border border-cyan-950 focus:border-cyan-400 rounded-xl p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />

          <button
            type="button"
            onClick={handleStartDictation}
            className={`absolute right-3 bottom-3 p-2 rounded-lg border transition ${
              isDictating
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-cyan-500/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30'
            }`}
            title={isDictating ? 'Dictation In Progress' : 'Start Voice Dictation'}
          >
            {isDictating ? <Mic className="w-4 h-4 animate-bounce" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="submit"
            disabled={!dictatedText.trim()}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 text-xs font-hud tracking-wider disabled:opacity-40 transition"
          >
            SAVE RUNNING NOTE
          </button>
        </div>
      </form>

      {/* Category Filter Chips */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono-tech whitespace-nowrap transition ${
              selectedCategory === c
                ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300'
                : 'bg-slate-950/60 border border-cyan-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-3 font-sans text-xs">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono-tech">
            No running notes recorded under this query, Sir.
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="p-4 rounded-xl border border-cyan-900/40 bg-black/40 hover:border-cyan-500/40 transition"
            >
              <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{note.title}</span>
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40 text-cyan-300">
                    {note.category}
                  </span>
                  <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400">
                    {note.language}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(note.id, note.content)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 transition"
                    title="Copy note"
                  >
                    {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleExportText(note)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 transition"
                    title="Export as Text file"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="mt-2 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                {note.content}
              </p>

              <div className="mt-3 text-[10px] font-mono-tech text-slate-500">
                Timestamp: {new Date(note.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
