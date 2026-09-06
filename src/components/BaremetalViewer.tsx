/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileCode,
  Terminal,
  X,
} from 'lucide-react';
import { BARE_METAL_SOURCES, BareMetalFile } from '../baremetal_c/sources';

interface BaremetalViewerProps {
  onClose: () => void;
  onDownloadAll: () => void;
}

export const BaremetalViewer: React.FC<BaremetalViewerProps> = ({
  onClose,
  onDownloadAll,
}) => {
  const [selectedFilename, setSelectedFilename] = useState<string>('covalent_rt.h');
  const [copied, setCopied] = useState(false);

  const activeFile =
    BARE_METAL_SOURCES.find((f) => f.filename === selectedFilename) ||
    BARE_METAL_SOURCES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSingle = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFile.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-text">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-white tracking-wide">
              BARE-METAL C SYNTHESIZER &amp; ORGANELLE REPOSITORY
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
              PURE Q16.16 CORDIC
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownloadSingle}
              className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 flex items-center gap-1.5 transition text-[11px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>

            <button
              onClick={onDownloadAll}
              className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-black font-semibold flex items-center gap-1.5 transition text-[11px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export All (.tar/.zip)</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* File Explorer Sidebar */}
          <div className="w-full md:w-64 border-r border-zinc-800 bg-zinc-950 p-3 space-y-1.5 shrink-0 overflow-y-auto">
            <div className="text-[10px] uppercase font-bold text-zinc-500 px-2 pb-1 tracking-wider">
              Organelle Modules
            </div>

            {BARE_METAL_SOURCES.map((file) => {
              const isSelected = file.filename === selectedFilename;
              return (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFilename(file.filename)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex flex-col gap-0.5 border ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-semibold'
                      : 'border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />
                    <span>{file.filename}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 pl-5 truncate">
                    {file.category}
                  </span>
                </button>
              );
            })}

            {/* Bare-metal build tips */}
            <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 text-[10px] text-zinc-400 leading-relaxed">
              <div className="text-zinc-300 font-bold mb-1 flex items-center gap-1">
                <Code2 className="w-3 h-3 text-amber-400" />
                <span>Compile Invariant:</span>
              </div>
              <p className="mb-1.5">Zero floating point unit dependency. Compile directly on Linux:</p>
              <code className="block p-1.5 rounded bg-black text-amber-400 font-mono text-[9px] border border-zinc-800">
                gcc -O3 *.c -o covalent_rt
              </code>
            </div>
          </div>

          {/* Code Viewer Panel */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black">
            <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-950/60 flex items-center justify-between text-zinc-400 text-[11px]">
              <span>{activeFile.description}</span>
              <span className="text-zinc-600 font-mono">{activeFile.code.split('\n').length} lines</span>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-[11px] leading-relaxed text-zinc-300 selection:bg-amber-500/30 selection:text-white">
              <pre className="whitespace-pre">
                <code>{activeFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
