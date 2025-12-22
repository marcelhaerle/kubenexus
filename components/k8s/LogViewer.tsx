'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal, Pause, Play, Download } from 'lucide-react';

interface LogViewerProps {
  namespace: string;
  podName: string;
  isExpanded?: boolean;
}

export default function LogViewer({ namespace, podName, isExpanded }: LogViewerProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wrapLines, setWrapLines] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const startStreaming = useCallback(async () => {
    stopStreaming();
    setIsConnected(true);
    setLogs(['--- Connecting to log stream... ---']);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(`/api/pods/${namespace}/${podName}/logs`, {
        signal: controller.signal,
      });

      if (!response.body) throw new Error('No readable stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter((line) => line.trim() !== '');

        setLogs((prev) => {
          const newLogs = [...prev, ...lines];
          return newLogs.slice(-1000);
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const name = error instanceof Error ? error.name : '';
      if (name !== 'AbortError') {
        setLogs((prev) => [...prev, `--- Error: Connection lost (${message}) ---`]);
        setIsConnected(false);
      }
    }
  }, [namespace, podName, stopStreaming]);

  useEffect(() => {
    startStreaming();
    return () => stopStreaming();
  }, [startStreaming, stopStreaming]);

  // Auto-Scroll
  useEffect(() => {
    if (!isPaused && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isPaused]);

  const downloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${namespace}-${podName}-logs.txt`;
    a.click();
  };

  return (
    <div
      className={`bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex flex-col ${
        isExpanded ? 'h-[85vh]' : 'h-[60vh]'
      }`}
    >
      {/* Toolbar */}
      <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-mono text-slate-300">pod/{podName}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          ></span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setWrapLines(!wrapLines)}
            className={`p-1 rounded transition-colors text-xs font-mono px-2 border ${
              wrapLines
                ? 'bg-slate-600 text-white border-slate-500'
                : 'text-slate-400 border-transparent hover:bg-slate-700'
            }`}
          >
            {wrapLines ? 'Wrap: ON' : 'Wrap: OFF'}
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            title={isPaused ? 'Resume Auto-Scroll' : 'Pause Auto-Scroll'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={downloadLogs}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
            title="Download Logs"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Console */}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs space-y-1">
        <div className={wrapLines ? '' : 'w-max min-w-full'}>
          {logs.map((log, i) => (
            <div
              key={i}
              className="text-slate-300 whitespace-pre-wrap break-all border-l-2 border-transparent hover:border-slate-700 pl-2"
            >
              {log}
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
