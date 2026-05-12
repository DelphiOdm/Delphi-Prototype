//Intelligence.js
import React, { useState, useRef, useEffect, useCallback } from "react";
import "./intellegence.css";

const API_BASE = "http://127.0.0.1:8000";
const SESSION_ID = `user_${Math.random().toString(36).slice(2, 9)}`;

const FIELD_LABELS = {
  geography: "Geography",
  industry: "Industry",
  industry_domain: "Sector",
  job_function: "Job Function",
  job_level: "Seniority",
  employee_size: "Company Size",
  revenue_range: "Revenue",
};

const FIELD_ICONS = {
  geography: "",
  industry: "",
  industry_domain: "",
  job_function: "",
  job_level: "",
  employee_size: "",
  revenue_range: "",
};

const SUGGESTION_LABELS = {
  geography: "Target Geographies",
  industry: "Industries",
  industry_domain: "Sectors / Domains",
  job_function: "Job Functions",
  job_level: "Seniority Levels",
  employee_size: "Company Sizes",
  revenue_range: "Revenue Ranges",
};

const FIELD_ORDER = [
  "geography",
  "industry",
  "industry_domain",
  "job_function",
  "job_level",
  "employee_size",
  "revenue_range",
];

function ContextPill({ field, value }) {
  return (
    <div className="context-pill">
      <span className="pill-icon">{FIELD_ICONS[field]}</span>
      <span className="pill-label">{FIELD_LABELS[field]}</span>
      <span className="pill-value">{value}</span>
    </div>
  );
}

function ProgressBar({ filled, total }) {
  const pct = Math.round((filled / total) * 100);
  return (
    <div className="progress-bar-wrap">
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-label">{filled}/{total} fields</span>
    </div>
  );
}

function LeadsTable({ rows }) {
  if (!rows || rows.length === 0) return (
    <div className="empty-table">No matching leads found for this criteria.</div>
  );
  const cols = Object.keys(rows[0]);
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>{cols.map(c => <th key={c}>{c.replace(/_/g, " ")}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {cols.map(c => <td key={c}>{row[c] ?? "—"}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SuggestionGroup({ field, items, onSelect }) {
  return (
    <div className="suggestion-group">
      <div className="suggestion-group-label">
        <span>{FIELD_ICONS[field]}</span>
        <span>{SUGGESTION_LABELS[field] || field}</span>
      </div>
      <div className="suggestion-chips">
        {items.map(item => (
          <button
            key={item}
            className="chip"
            onClick={() => onSelect(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="typing-indicator">
      <span /><span /><span />
    </div>
  );
}

export default function Intellegence() {
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [context, setContext]         = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [progress, setProgress]       = useState({ filled: 0, total: 7 });
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);
  const sessionRef  = useRef(SESSION_ID);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, suggestions, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 140) + "px";
  }, [input]);

  const pushMessage = useCallback((msg) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), ...msg }]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const finalText = (text || input).trim();
    if (!finalText || loading) return;

    pushMessage({ role: "user", text: finalText });
    setInput("");
    setLoading(true);
    setSuggestions({});

    try {
      const res = await fetch(`${API_BASE}/context/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionRef.current,
          message: finalText,
        }),
      });

      const data = await res.json();
      console.log("[API Response]", data);

      // Update context display
      if (data.context) setContext(data.context);
      if (data.progress) setProgress(data.progress);

      if (data.status === "complete") {
        // Show summary then table
        if (data.summary) {
          pushMessage({ role: "bot", text: data.summary });
        }
        pushMessage({ role: "bot", table: data.data || [] });
        setSuggestions({});
        setProgress({ filled: 7, total: 7 });
      } else {
        // In progress — show conversational response
        if (data.response) {
          pushMessage({ role: "bot", text: data.response });
        }
        // Show suggestions (exclude geography if empty)
        if (data.suggestions) {
          const filtered = {};
          for (const [k, v] of Object.entries(data.suggestions)) {
            if (Array.isArray(v) && v.length > 0) filtered[k] = v;
          }
          setSuggestions(filtered);
        }
      }
    } catch (err) {
      console.error(err);
      pushMessage({ role: "bot", text: "Something went wrong connecting to the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [input, loading, pushMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = async () => {
    // Save current chat if non-empty
    if (messages.length > 0) {
      const title = messages.find(m => m.role === "user")?.text?.slice(0, 40) || "Chat";
      setChatHistory(prev => [
        { id: Date.now(), title, messages, context },
        ...prev,
      ]);
    }
    // Reset backend session
    try {
      await fetch(`${API_BASE}/context/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionRef.current }),
      });
    } catch {}

    setMessages([]);
    setInput("");
    setSuggestions({});
    setContext({});
    setProgress({ filled: 0, total: 7 });
    setActiveChatId(null);
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setContext(chat.context || {});
    setSuggestions({});
    setActiveChatId(chat.id);
  };

  const filledFields = FIELD_ORDER.filter(f => context[f]);

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>

      {/* ═══ SIDEBAR ═════════════════════════════════════ */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            {/* <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#6366f1" opacity="0.9"/>
              <polygon points="12,6 18,9.5 18,16.5 12,20 6,16.5 6,9.5" fill="none" stroke="#a5b4fc" strokeWidth="1.5"/>
            </svg> */}
            <span>Delphi</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(v => !v)} title="Toggle sidebar">
            ‹
          </button>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          <span>＋</span> New Search
        </button>

        {/* Context summary */}
        {filledFields.length > 0 && (
          <div className="context-panel">
            <div className="context-panel-title ">Context</div>
            {filledFields.map(f => (
              <ContextPill key={f} field={f} value={context[f]} />
            ))}
            <ProgressBar filled={filledFields.length} total={7} />
          </div>
        )}

        {/* Chat history */}
        <div className="history-list">
          {messages.length > 0 && !activeChatId && (
            <div className="history-item active">
              {messages.find(m => m.role === "user")?.text?.slice(0, 38) || "Current chat"}
            </div>
          )}
          {chatHistory.map(chat => (
            <div
              key={chat.id}
              className={`history-item ${activeChatId === chat.id ? "active" : ""}`}
              onClick={() => loadChat(chat)}
            >
              {chat.title}
            </div>
          ))}
          {chatHistory.length === 0 && messages.length === 0 && (
            <p className="history-empty">Start a conversation to find leads</p>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">D</div>
          <div className="user-info">
            <span className="user-name">Delphi User</span>
            <span className="user-email">B2B Lead Intelligence</span>
          </div>
        </div>
      </aside>

      {/* Collapsed toggle */}
      {!sidebarOpen && (
        <button className="sidebar-reopen" onClick={() => setSidebarOpen(true)} title="Open sidebar">
          ›
        </button>
      )}

      {/* ═══ MAIN PANEL ══════════════════════════════════ */}
      <main className="main-panel">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="empty-state">
            {/* <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#6366f1" opacity="0.15"/>
                <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="none" stroke="#6366f1" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" fill="#6366f1" opacity="0.7"/>
              </svg>
            </div> */}
           
            <h1 className="empty-title">Describe your target audience and find the best matching leads</h1>
            <div className="starter-prompts">
              {[
                "I want to run a campaign targeting C-Level at mid-size tech companies in the US",
                "Find me marketing leads in the healthcare sector in Europe",
                "I need sales leads from fintech companies with 500+ employees",
              ].map(prompt => (
                <button key={prompt} className="starter-chip" onClick={() => sendMessage(prompt)}>
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className={`messages-area ${messages.length === 0 ? "no-scroll" : ""}`}>
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.role}`}>
              {msg.role === "bot" && (
                <div className="bot-avatar">
                  {/* <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#6366f1"/>
                  </svg> */}
                </div>
              )}
              <div className="message-content">
                {msg.text && <div className="bubble">{msg.text}</div>}
                {msg.table !== undefined && <LeadsTable rows={msg.table} />}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="message-row bot">
              <div className="bot-avatar">
                {/* <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <polygon points="12,2 22,7 22,17 12,22 2,17 2,7" fill="#6366f1"/>
                </svg> */}
              </div>
              <div className="message-content">
                <div className="bubble"><TypingDots /></div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!loading && Object.keys(suggestions).length > 0 && (
            <div className="suggestions-area">
              {Object.entries(suggestions).map(([field, items]) => (
                <SuggestionGroup
                  key={field}
                  field={field}
                  items={items}
                  onSelect={(val) => sendMessage(val)}
                />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ═══ INPUT ═══════════════════════════════════════ */}
        <div className="input-zone">
          <div className="input-card">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder=""
              value={input}
              rows={1}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              title="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="input-hint"></p>
        </div>

      </main>
    </div>
  );
}