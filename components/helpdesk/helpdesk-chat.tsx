"use client";

import * as React from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  MapPin,
  Building2,
  HelpCircle,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { HelpdeskSource } from "@/lib/services/campus-ai";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: HelpdeskSource[];
  status?: "VERIFIED" | "NOT_FOUND" | "OUT_OF_SCOPE" | "ERROR";
  intent?: string;
  suggestedActions?: { label: string; url: string; icon?: string }[];
  timestamp: Date;
}

const SUGGESTIONS = [
  "Where is the library?",
  "Show me CSE resources.",
  "What events are coming up?",
  "Where is the CSE department?",
];

export function HelpdeskChat() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || loading) return;

    setError(null);
    setInput("");

    const userMsgId = `user_${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        role: "user",
        content: messageContent,
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setLoading(true);

    try {
      // Build conversation history to send
      const conversationPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/helpdesk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          conversation: conversationPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: "assistant",
            content: data.error || "CampusOS AI is temporarily unavailable. Please try again.",
            status: "ERROR",
            timestamp: new Date(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant_${Date.now()}`,
            role: "assistant",
            content: data.answer,
            sources: data.sources || [],
            status: data.status,
            intent: data.intent,
            suggestedActions: data.suggestedActions || [],
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "CampusOS AI is temporarily unavailable. Please try again.",
          status: "ERROR",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setError(null);
    setInput("");
  };

  // Safe markdown line renderer for assistant messages
  const renderFormattedContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }

      // Check if line is a bullet item
      const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
      const lineText = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : trimmed;

      // Simple bold parsing: **text**
      const parts = lineText.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={pIdx}>{part}</span>;
      });

      if (isBullet) {
        return (
          <li key={idx} className="flex items-start gap-2 ml-1 text-sm text-slate-700 my-0.5">
            <span className="text-brand-500 font-bold shrink-0">•</span>
            <span className="flex-1 leading-relaxed">{renderedParts}</span>
          </li>
        );
      }

      return (
        <p key={idx} className="text-sm text-slate-700 leading-relaxed my-1">
          {renderedParts}
        </p>
      );
    });
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "resource":
        return <BookOpen className="w-3.5 h-3.5 text-brand-600" />;
      case "department":
        return <Building2 className="w-3.5 h-3.5 text-indigo-600" />;
      case "location":
        return <MapPin className="w-3.5 h-3.5 text-emerald-600" />;
      case "faq":
        return <HelpCircle className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[540px] max-w-5xl w-full mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">Smart Helpdesk</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Grounded Campus AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Answers generated strictly from verified City University data.
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleResetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
      </div>

      {/* Message Feed Viewport */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.length === 0 ? (
          /* Empty State: Initial Prompt & Suggestions */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-brand-50 to-cyan-50 border border-brand-100 flex items-center justify-center text-brand-600 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-900">
                How can CampusOS help?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Ask about departments, resources, campus locations, policies, events, and more.
              </p>
            </div>

            <div className="w-full space-y-2 pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-left px-1">
                Suggested questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/90 border border-slate-200/60 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all text-left flex items-center justify-between group shadow-2xs"
                  >
                    <span>{suggestion}</span>
                    <span className="text-slate-300 group-hover:text-brand-600 transition-colors">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conversation Thread */
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-slate-800 text-white"
                    : "bg-brand-50 text-brand-600 border border-brand-200/60"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-xl rounded-2xl p-4 shadow-2xs transition-all ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-tr-xs"
                    : "bg-white border border-slate-200/80 rounded-tl-xs"
                }`}
              >
                {msg.role === "user" ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="space-y-3">
                    {msg.status === "VERIFIED" && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-semibold text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>✓ Grounded in verified CampusOS data</span>
                      </div>
                    )}

                    {(msg.status === "NOT_FOUND" || msg.status === "OUT_OF_SCOPE") && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/60 text-[10px] font-semibold text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Verified record not found</span>
                      </div>
                    )}

                    <div>{renderFormattedContent(msg.content)}</div>

                    {/* Verified Source Citations Section */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            Based on {msg.sources.length} verified campus {msg.sources.length === 1 ? "source" : "sources"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.sources.map((s, idx) => (
                            <div
                              key={`${s.id}-${idx}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/60 text-xs text-slate-700"
                            >
                              {getSourceIcon(s.type)}
                              <span className="font-semibold">{s.title}</span>
                              {s.url && (
                                <a
                                  href={s.url}
                                  target={s.url.startsWith("http") ? "_blank" : "_self"}
                                  rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                                  className="text-brand-600 hover:text-brand-800 ml-0.5 inline-flex items-center"
                                  title="View verified source"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggested Actions Section */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 ? (
                      <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Sparkles className="w-3 h-3 text-brand-600" />
                          <span>Recommended Actions</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((act) => (
                            <Link
                              key={act.url}
                              href={act.url}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 hover:bg-brand-100 border border-brand-200/70 text-xs font-semibold text-brand-700 transition-colors"
                            >
                              <span>{act.label}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-brand-500" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (msg.status === "NOT_FOUND" || msg.status === "OUT_OF_SCOPE") ? (
                      <div className="pt-2.5 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <Compass className="w-3 h-3 text-slate-500" />
                          <span>Suggested Navigation</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          <Link
                            href="/search"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <span>Search Campus</span>
                            <span className="text-slate-400">→</span>
                          </Link>
                          <Link
                            href="/resources"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <span>Browse Resources</span>
                            <span className="text-slate-400">→</span>
                          </Link>
                          <Link
                            href="/events"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                          >
                            <span>View Events</span>
                            <span className="text-slate-400">→</span>
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 border border-brand-200/60 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-xs bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2.5 text-xs font-semibold text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span>Reviewing verified CampusOS records...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer Area */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-end gap-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition-all p-1.5"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about City University..."
            rows={1}
            disabled={loading}
            className="flex-1 max-h-32 min-h-[44px] py-2.5 px-3.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 rounded-xl bg-brand-600 text-white hover:bg-brand-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-xs shrink-0"
            aria-label="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-2">
          Responses are grounded in verified City University data. CampusOS AI does not invent unverified information.
        </p>
      </div>
    </div>
  );
}
