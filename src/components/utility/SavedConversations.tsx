import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Search, Trash2, MessageSquare } from 'lucide-react';
import { getSavedConversations, deleteConversation } from '../../utils/storage';
import { Conversation } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';

function stripMarkdown(text: string): string {
  if (!text) return '';
  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export const SavedConversations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setConversations(getSavedConversations(user?.id));
  }, [user?.id]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteConversation(id, user?.id);
    setConversations(getSavedConversations(user?.id));
  };

  const filtered = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      stripMarkdown(c.lastMessage).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 text-primary transition-colors duration-200">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-accent-base text-xs font-semibold tracking-wider uppercase">
          <History size={16} />
          <span>PERSISTENT HISTORY</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-primary">Saved Conversations</h1>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-3.5 text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search saved conversations..."
          className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent-base shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-2xl space-y-3 bg-surface">
          <MessageSquare size={32} className="mx-auto text-muted" />
          <p className="text-sm text-secondary">
            No saved conversations found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/chat?id=${c.id}`)}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-accent-base/40 cursor-pointer transition-all flex items-center justify-between group shadow-sm"
            >
              <div className="space-y-1 max-w-[80%]">
                <h3 className="text-sm font-medium text-primary group-hover:text-accent-base transition-colors truncate">
                  {c.title}
                </h3>
                <p className="text-xs text-secondary truncate">
                  {stripMarkdown(c.lastMessage)}
                </p>
                <span className="text-[10px] text-muted tabular-nums">
                  {new Date(c.timestamp).toLocaleString()}
                </span>
              </div>

              <button
                onClick={(e) => handleDelete(e, c.id)}
                className="p-2 text-muted hover:text-accent-alert rounded-lg hover:bg-surface-elevated transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};