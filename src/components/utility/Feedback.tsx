import React, { useState } from 'react';
import { MessageCircle, CheckCircle } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export const Feedback: React.FC = () => {
  const [category, setCategory] = useState('Bug Report');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbackList, setFeedbackList] = useLocalStorage<
    Array<{ category: string; text: string; date: string }>
  >('weather_gpt_feedback', []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newItem = { category, text, date: new Date().toISOString() };
    setFeedbackList([newItem, ...feedbackList]);
    setSubmitted(true);
    setText('');
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto py-4 text-primary transition-colors duration-200">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-accent-base text-xs font-semibold tracking-wider uppercase">
          <MessageCircle size={16} />
          <span>USER INPUT</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-primary">
          Help improve WeatherLY.
        </h1>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-surface-elevated border border-border text-accent-base space-y-2 text-center shadow-sm">
          <CheckCircle size={32} className="mx-auto text-accent-base" />
          <h2 className="text-lg font-medium text-primary">
            Thanks for the feedback!
          </h2>
          <p className="text-xs text-secondary">
            Your note has been saved locally.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-4 py-2 bg-accent-base text-xs text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-surface p-6 rounded-2xl border border-border shadow-sm"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-primary">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-primary focus:outline-none focus:border-accent-base"
            >
              <option>Bug Report</option>
              <option>Incorrect Weather Information</option>
              <option>Feature Request</option>
              <option>UI Feedback</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-primary">
              Your Feedback
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your feedback or issue..."
              className="w-full bg-surface-elevated border border-border rounded-xl p-4 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent-base resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-3 bg-accent-base hover:opacity-90 text-white font-medium text-sm rounded-xl transition-opacity disabled:opacity-40 shadow-sm"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
};