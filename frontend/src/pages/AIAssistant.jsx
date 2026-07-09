import React, { useState } from 'react';
import api from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { FiCpu, FiSend, FiMessageSquare, FiInfo, FiZap } from 'react-icons/fi';

const AIAssistant = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState(null); // 'openai' or 'demo'

  const promptShortcuts = [
    { text: 'What did John work on last week?', label: '👤 John\'s Work' },
    { text: 'Summarize this week\'s work.', label: '📋 Week Summary' },
    { text: 'Show recurring blockers.', label: '⚠️ Team Blockers' }
  ];

  const handleAsk = async (questionText) => {
    const q = questionText || query;
    if (!q.trim()) return;

    setLoading(true);
    setError('');
    setAnswer('');
    setMode(null);

    // If clicking shortcut, sync input text box
    if (questionText) {
      setQuery(questionText);
    }

    try {
      const res = await api.post('/dashboard/ai', { query: q });
      setAnswer(res.data.answer);
      setMode(res.data.mode);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while contacting the AI service.');
    } finally {
      setLoading(false);
    }
  };

  // Convert simple markdown strings (like headers and bullet lists) into HTML react nodes
  const renderFormattedAnswer = (text) => {
    if (!text) return null;

    return text.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-base font-bold text-indigo-400 mt-4 mb-2">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-lg font-bold text-indigo-400 mt-5 mb-2.5">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-xl font-extrabold text-white mt-6 mb-3 border-b border-slate-800 pb-1">{line.replace('# ', '')}</h1>;
      }

      // Bold text
      let lineNode = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      if (boldRegex.test(line)) {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        lineNode = parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-100 font-bold">{part}</strong> : part);
      }

      // Bullet points
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.startsWith('* ') ? line.substring(2) : line.substring(2);
        
        // Double check bolding on item contents
        let itemContent = content;
        if (boldRegex.test(content)) {
          const parts = content.split(/\*\*(.*?)\*\*/g);
          itemContent = parts.map((part, idx) => idx % 2 === 1 ? <strong key={idx} className="text-slate-100 font-bold">{part}</strong> : part);
        }

        return (
          <li key={index} className="list-disc pl-2 ml-4 text-slate-300 text-sm leading-relaxed mb-1.5">
            {itemContent}
          </li>
        );
      }

      // Standard paragraphs
      return line.trim() ? (
        <p key={index} className="text-slate-300 text-sm leading-relaxed mb-2.5">
          {lineNode}
        </p>
      ) : (
        <div key={index} className="h-2" />
      );
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Introduction */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FiCpu className="text-indigo-500 h-5.5 w-5.5" />
          <span>AI Team Assistant</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Perform natural language queries against all weekly logs submitted by team members
        </p>
      </div>

      {/* Info Warning banner */}
      <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl flex gap-3 text-xs text-slate-400">
        <FiInfo className="text-indigo-400 h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">How it works</p>
          <p className="leading-relaxed">
            The assistant aggregates weekly report submissions from your MongoDB collections and compiles them as context. 
            If the <code className="bg-slate-950 px-1 py-0.5 rounded text-indigo-400 font-mono">OPENAI_API_KEY</code> environment variable is set, it will run using real GPT models. Otherwise, a smart localized parser acts as a fallback demo.
          </p>
        </div>
      </div>

      {/* Query box Card */}
      <Card title="Ask the Assistant" subtitle="Enter details about your query">
        <div className="space-y-5">
          {/* Shortcuts grids */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-2">Prompt Shortcuts</p>
            <div className="flex flex-wrap gap-2.5">
              {promptShortcuts.map((s) => (
                <button
                  key={s.text}
                  type="button"
                  onClick={() => handleAsk(s.text)}
                  disabled={loading}
                  className="text-xs bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-850 hover:border-indigo-900/40 px-3 py-2 rounded-lg text-slate-300 hover:text-indigo-300 font-medium transition-all cursor-pointer disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt search bar */}
          <div className="flex gap-2.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. What did Jane work on in Week 26?"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-850 focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 text-slate-200 text-sm placeholder-slate-500 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            />
            <Button
              variant="primary"
              onClick={() => handleAsk()}
              loading={loading}
              disabled={!query.trim()}
              className="px-5 cursor-pointer"
            >
              <FiSend className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Answer box Card */}
      {(answer || error || loading) && (
        <Card 
          title="Assistant Response" 
          extra={
            mode && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                mode === 'openai' 
                  ? 'bg-purple-950/60 text-purple-400 border-purple-900/30' 
                  : 'bg-indigo-950/60 text-indigo-400 border-indigo-900/30'
              }`}>
                <FiZap className="h-3 w-3" />
                <span>{mode === 'openai' ? 'OpenAI GPT' : 'Local Demo Fallback'}</span>
              </span>
            )
          }
        >
          {loading ? (
            <div className="py-10">
              <Loader size="md" color="indigo" />
              <p className="text-center text-xs text-slate-500 mt-3 animate-pulse">Scanning MongoDB reports and compiling answers...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-950/40 border border-rose-900/60 p-4 rounded-xl text-sm text-rose-300">
              {error}
            </div>
          ) : (
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-5 md:p-6 overflow-hidden">
              <div className="prose prose-invert max-w-none">
                {renderFormattedAnswer(answer)}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIAssistant;
