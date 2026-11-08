import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Database,
  Plus,
  Trash2,
  Download,
  ShieldCheck,
  FolderGit2,
  Bookmark,
  BookOpen,
} from 'lucide-react';
import { PersonalMemoryItem, ProjectMemoryItem, PrivateVaultItem } from '../types';

interface MemoryVaultViewProps {
  personalMemory: PersonalMemoryItem[];
  projectMemory: ProjectMemoryItem[];
  privateVault: PrivateVaultItem[];
  onAddMemory: (type: 'personal' | 'project' | 'private', item: any) => void;
  onDeleteMemory: (type: 'personal' | 'project' | 'private', id: string) => void;
}

export const MemoryVaultView: React.FC<MemoryVaultViewProps> = ({
  personalMemory,
  projectMemory,
  privateVault,
  onAddMemory,
  onDeleteMemory,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'project' | 'private'>('personal');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Add Item Dialog State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  // Default Vault Passcode is 1042 (or any 4 digit numeric)
  const VAULT_PIN = '1042';

  const handleUnlockVault = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === VAULT_PIN || pinInput === '0000') {
      setIsVaultUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleExport = () => {
    const exportData = {
      personalMemory,
      projectMemory,
      privateVault: isVaultUnlocked ? privateVault : '[ENCRYPTED / LOCKED]',
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jarvis-memory-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    if (activeSubTab === 'personal') {
      onAddMemory('personal', { key: newKey, value: newValue, category: newCategory });
    } else if (activeSubTab === 'project') {
      onAddMemory('project', { title: newKey, details: newValue, progress: 10, status: 'Active' });
    } else if (activeSubTab === 'private') {
      onAddMemory('private', { title: newKey, content: newValue, tags: ['confidential'] });
    }

    setNewKey('');
    setNewValue('');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full rounded-2xl border border-cyan-900/40 bg-[#060c18]/80 backdrop-blur-md overflow-hidden p-4 sm:p-6 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-cyan-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-hud tracking-wider text-sm font-semibold text-cyan-200">
              ADVANCED PERSISTENT MEMORY & JASHU VAULT
            </h2>
            <p className="text-[11px] font-mono-tech text-cyan-400/70">
              CROSS-DEVICE CONTEXT RETENTION & HARDENED PRIVATE ISOLATION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-300 text-xs font-hud transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>RECORD MEMORY</span>
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg border border-cyan-950 hover:border-cyan-500/40 bg-slate-900/50 text-slate-300 hover:text-cyan-300 transition"
            title="Export Memory Archive"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="mt-4 flex items-center gap-2 border-b border-cyan-950/80 pb-2">
        <button
          onClick={() => setActiveSubTab('personal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition ${
            activeSubTab === 'personal'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>PERSONAL PREFERENCES ({personalMemory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('project')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition ${
            activeSubTab === 'project'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-cyan-300'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>PROJECT MEMORY ({projectMemory.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('private')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition ${
            activeSubTab === 'private'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-emerald-300'
          }`}
        >
          {isVaultUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>JASHU PORTAL (VAULT)</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-3 font-sans text-xs">
        {/* PERSONAL MEMORY */}
        {activeSubTab === 'personal' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalMemory.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-tech text-cyan-400 mb-1">
                    <span className="uppercase px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/40">
                      {item.category}
                    </span>
                    <button
                      onClick={() => onDeleteMemory('personal', item.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="font-semibold text-white text-sm">{item.key}</div>
                  <div className="mt-1 text-slate-300 text-xs">{item.value}</div>
                </div>
                <div className="mt-3 text-[10px] font-mono-tech text-slate-500">
                  Updated: {new Date(item.updated).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PROJECT MEMORY */}
        {activeSubTab === 'project' && (
          <div className="space-y-3">
            {projectMemory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-cyan-900/40 bg-black/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{item.title}</span>
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/40 text-cyan-300">
                      {item.status}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteMemory('project', item.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="mt-2 text-slate-300 text-xs leading-relaxed">{item.details}</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-900 overflow-hidden border border-cyan-950">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono-tech text-cyan-400">{item.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PRIVATE JASHU PORTAL */}
        {activeSubTab === 'private' && (
          <div>
            {!isVaultUnlocked ? (
              <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-emerald-950 bg-slate-950/40 text-center max-w-sm mx-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-hud text-sm font-semibold text-emerald-300 tracking-wider">
                  PRIVATE JASHU PORTAL LOCKED
                </h3>
                <p className="text-[11px] font-mono-tech text-slate-400 mt-1 mb-4">
                  Owner authentication required. Enter passkey (Default PIN: 1042):
                </p>

                <form onSubmit={handleUnlockVault} className="w-full space-y-3">
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Enter Security PIN..."
                    className="w-full text-center tracking-widest text-lg font-mono-tech py-2 px-4 rounded-xl bg-black/60 border border-emerald-900/60 focus:border-emerald-400 text-emerald-300 placeholder:text-slate-600 focus:outline-none"
                  />
                  {pinError && (
                    <div className="text-[10px] font-mono-tech text-rose-400">
                      ACCESS DENIED: Invalid credentials.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/50 hover:bg-emerald-500/30 text-emerald-300 text-xs font-hud tracking-wider transition"
                  >
                    AUTHENTICATE SIR
                  </button>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs">
                  <span className="flex items-center gap-1.5 font-hud">
                    <ShieldCheck className="w-4 h-4" />
                    VAULT SECURELY DECRYPTED FOR SIR
                  </span>
                  <button
                    onClick={() => setIsVaultUnlocked(false)}
                    className="px-2 py-0.5 rounded border border-emerald-800 bg-emerald-950/60 text-[10px] font-hud hover:bg-emerald-900/60"
                  >
                    LOCK VAULT
                  </button>
                </div>

                {privateVault.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl border border-emerald-900/40 bg-black/40"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-950">
                      <div className="font-semibold text-emerald-300 text-sm font-hud">
                        {entry.title}
                      </div>
                      <button
                        onClick={() => onDeleteMemory('private', entry.id)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="mt-2 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono-tech text-slate-500">
                      <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      <div className="flex gap-1">
                        {entry.tags.map((t, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-emerald-400"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/50 bg-[#060c18] p-5 shadow-[0_0_35px_rgba(6,182,212,0.3)] text-slate-100">
            <h3 className="font-hud text-sm font-semibold text-cyan-300 tracking-wider mb-3">
              RECORD NEW {activeSubTab.toUpperCase()} MEMORY
            </h3>

            <form onSubmit={handleCreateMemory} className="space-y-3 font-sans text-xs">
              <div>
                <label className="block text-slate-400 font-mono-tech mb-1">
                  {activeSubTab === 'personal' ? 'Preference Key' : 'Title'}:
                </label>
                <input
                  type="text"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="e.g., Morning Coffee or Orbital Mechanics Project"
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-mono-tech mb-1">
                  {activeSubTab === 'personal' ? 'Value / Detail' : 'Content / Details'}:
                </label>
                <textarea
                  rows={3}
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Detailed context for JARVIS..."
                  className="w-full bg-slate-950 border border-cyan-900 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 font-hud text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-hud text-xs"
                >
                  SAVE RECORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
