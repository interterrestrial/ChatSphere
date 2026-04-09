import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface AISummaryPanelProps {
  conversationTitle: string;
  messageCount: number;
}

const summaries: Record<number, string> = {
  0: 'The team discussed the upcoming sprint deliverables. John updated the Figma mockups have been reviewed and Sarah will push the repository updates by end of day. The group agreed on a 3 PM sync call.',
  1: 'Alex and John confirmed the 3 PM meeting is still on. John asked about the PR review which Alex acknowledged. Short check-in between the two.',
  2: 'John shared the Figma link for design review. Emma praised the new frame designs calling them fire. Quick design appreciation thread.',
  3: 'John shared a WebSockets article link with Ryan for further reading. Casual knowledge-sharing exchange.',
};

const AISummaryPanel: React.FC<AISummaryPanelProps> = ({ conversationTitle, messageCount }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [summaryIdx, setSummaryIdx] = useState(0);

  const summary = summaries[summaryIdx % Object.keys(summaries).length];

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    setTimeout(() => {
      setSummaryIdx(prev => prev + 1);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="ai-panel" style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}>
      {/* Toggle header */}
      <button
        onClick={() => setExpanded(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.5rem',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="ai-badge">
            <Sparkles size={11} />
            Gemini AI Summary
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
            {messageCount} messages analysed
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {expanded && (
            <button
              onClick={handleRefresh}
              className="btn-icon"
              style={{ width: '28px', height: '28px' }}
              title="Regenerate summary"
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }} />
            </button>
          )}
          {expanded ? <ChevronDown size={16} color="var(--text-tertiary)" /> : <ChevronUp size={16} color="var(--text-tertiary)" />}
        </div>
      </button>

      {/* Expandable content */}
      <div
        className={`ai-panel ${expanded ? 'expanded' : 'collapsed'}`}
        style={{ border: 'none', borderTop: expanded ? '1px solid rgba(99,102,241,0.1)' : 'none' }}
      >
        <div className="ai-panel-inner">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div className="skeleton skeleton-text" style={{ width: '90%' }} />
              <div className="skeleton skeleton-text" style={{ width: '75%' }} />
              <div className="skeleton skeleton-text" style={{ width: '85%' }} />
            </div>
          ) : (
            <>
              <p style={{
                fontSize: '0.88rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                fontStyle: 'italic',
              }}>
                "{summary}"
              </p>
              <div style={{
                marginTop: '0.85rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}>
                <span className="chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.7rem' }}>
                  📌 Action items
                </span>
                <span className="chip" style={{ fontSize: '0.75rem', padding: '0.2rem 0.7rem' }}>
                  🤝 {conversationTitle}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AISummaryPanel;
