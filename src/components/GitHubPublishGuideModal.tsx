import React, { useState } from 'react';
import {
  X,
  Github,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Download,
  CheckCircle2,
  GitBranch,
  Globe,
  Settings,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface GitHubPublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPublishGuideModal: React.FC<GitHubPublishGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [repoName, setRepoName] = useState<string>('jarvis-ai-ecosystem');
  const [githubUser, setGithubUser] = useState<string>('djhavish42');

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadWorkflow = () => {
    const workflow = `name: Deploy JARVIS to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Application with Vite
        run: npm run build
        env:
          NODE_ENV: production

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
    downloadFile('deploy.yml', workflow, 'text/yaml');
  };

  const gitCommands = `# 1. Initialize local git repository
git init

# 2. Stage all project files
git add .

# 3. Create your initial commit
git commit -m "Initialize J.A.R.V.I.S. Mark VII Universal AI Ecosystem"

# 4. Set default branch to main
git branch -M main

# 5. Link to your personal GitHub repository
git remote add origin https://github.com/${githubUser}/${repoName}.git

# 6. Push code to GitHub
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-cyan-500/50 bg-[#060c18] p-5 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-hud text-sm font-semibold tracking-wider text-cyan-200">
                PUBLISH J.A.R.V.I.S. TO YOUR GITHUB REPOSITORY & GITHUB PAGES
              </h3>
              <p className="text-[10px] font-mono-tech text-cyan-400/70">
                COMPLETE STEP-BY-STEP TERMINAL GUIDE & AUTOMATED GITHUB ACTIONS PIPELINE
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-md">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 text-xs font-sans pr-1">
          {/* Repository Info Inputs */}
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
            <div className="text-[11px] font-hud text-cyan-300 font-semibold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              CONFIGURE YOUR GITHUB CREDENTIALS (UPDATES COMMANDS BELOW):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-tech">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Your GitHub Username:</label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value.trim() || 'username')}
                  className="w-full bg-black/60 border border-cyan-900 rounded-lg px-2.5 py-1.5 text-cyan-200 focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. djhavish42"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Repository Name:</label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value.trim() || 'jarvis-ai-ecosystem')}
                  className="w-full bg-black/60 border border-cyan-900 rounded-lg px-2.5 py-1.5 text-cyan-200 focus:outline-none focus:border-cyan-400"
                  placeholder="e.g. jarvis-ai-ecosystem"
                />
              </div>
            </div>
          </div>

          {/* STEP 1: CREATE REPO ON GITHUB */}
          <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
            <div className="flex items-center gap-2 font-hud text-xs text-white font-semibold">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech flex items-center justify-center text-[10px]">
                1
              </span>
              <span>CREATE A NEW REPOSITORY ON GITHUB.COM</span>
            </div>
            <p className="text-[11px] text-slate-300 pl-7 leading-relaxed">
              Log into <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">github.com/new <ExternalLink className="w-3 h-3 inline" /></a>. Name it <strong>{repoName}</strong>, set visibility to <strong>Public</strong>, and leave <em>"Initialize with README"</em> <strong>UNCHECKED</strong>.
            </p>
          </div>

          {/* STEP 2: TERMINAL GIT COMMANDS */}
          <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-hud text-xs text-white font-semibold">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>RUN THESE COMMANDS IN YOUR TERMINAL / VS CODE:</span>
              </div>
              <button
                onClick={() => handleCopy(gitCommands, 'git')}
                className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-mono-tech flex items-center gap-1 transition"
              >
                {copiedKey === 'git' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'git' ? 'COPIED' : 'COPY ALL'}</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-black/80 border border-cyan-950 font-mono-tech text-[10px] text-cyan-200 overflow-x-auto leading-relaxed select-all">
              {gitCommands}
            </pre>
          </div>

          {/* STEP 3: VITE BUILD & GITHUB PAGES CONFIGURATION */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-hud text-xs text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>VITE BUILD OUTPUT CONFIGURED (ALREADY INCLUDED)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-mono-tech">
                PRE-CONFIGURED
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 pl-6 font-sans">
              <div>
                ✓ <strong>Universal Subpath Base (`base: './'`)</strong>: Already added to <code className="text-cyan-300 font-mono-tech">vite.config.ts</code> so asset chunks load properly regardless of repo URL.
              </div>
              <div>
                ✓ <strong>SPA Fallback (<code className="text-cyan-300 font-mono-tech">public/404.html</code>)</strong>: Pre-generated to prevent 404s when refreshing subpages on GitHub Pages.
              </div>
              <div>
                ✓ <strong>Jekyll Bypass (<code className="text-cyan-300 font-mono-tech">public/.nojekyll</code>)</strong>: Pre-generated so GitHub Pages processes modern underscore-prefixed asset files.
              </div>
              <div>
                ✓ <strong>Automated Workflow (<code className="text-cyan-300 font-mono-tech">.github/workflows/deploy.yml</code>)</strong>: Ready to auto-build and publish on every git push!
              </div>
            </div>

            <div className="pt-1 pl-6">
              <button
                onClick={handleDownloadWorkflow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-hud transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD DEPLOY.YML (GITHUB ACTIONS)</span>
              </button>
            </div>
          </div>

          {/* STEP 4: ENABLE PAGES IN GITHUB SETTINGS */}
          <div className="p-3.5 rounded-xl border border-cyan-900/40 bg-black/40 space-y-2">
            <div className="flex items-center gap-2 font-hud text-xs text-white font-semibold">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono-tech flex items-center justify-center text-[10px]">
                3
              </span>
              <span>ENABLE GITHUB PAGES IN REPO SETTINGS</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-300 pl-7 font-sans">
              <p>
                1. On GitHub, navigate to your repo <strong>Settings</strong> → <strong>Pages</strong> (in the left sidebar).
              </p>
              <p>
                2. Under <strong>"Build and deployment"</strong> → <strong>Source</strong>, select <strong className="text-cyan-300">GitHub Actions</strong>.
              </p>
              <p>
                3. That's it! GitHub Actions will automatically run <code className="text-cyan-300 font-mono-tech">deploy.yml</code> and publish your site at:
              </p>
              <div className="p-2 rounded-lg bg-black/60 border border-cyan-950 font-mono-tech text-cyan-300 text-[11px] flex items-center justify-between">
                <span>https://{githubUser}.github.io/{repoName}/</span>
                <a
                  href={`https://${githubUser}.github.io/${repoName}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-white inline-flex items-center gap-1 text-[10px]"
                >
                  VISIT <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-cyan-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 hover:bg-cyan-500/30 text-cyan-200 text-xs font-hud tracking-wider transition"
          >
            DISMISS GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
