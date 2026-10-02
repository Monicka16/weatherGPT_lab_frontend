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
    <div className="space-y-8 max-w-2xl mx-auto py-4 text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] text-xs font-semibold tracking-wider uppercase">
          <MessageCircle size={16} />
          <span>USER INPUT</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532] dark:text-[#E8EFEC]">
          Help improve WeatherLY.
        </h1>
      </div>

      {submitted ? (
        <div className="p-6 rounded-2xl bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/20 dark:border-[#A9C0B5]/10 text-[#536B67] dark:text-[#A9C0B5] space-y-2 text-center shadow-sm dark:shadow-black/20">
          <CheckCircle size={32} className="mx-auto text-[#536B67] dark:text-[#A9C0B5]" />
          <h2 className="text-lg font-semibold text-[#263532] dark:text-[#E8EFEC]">
            Thanks for the feedback!
          </h2>
          <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A]">
            Your note has been saved locally.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-4 py-2 bg-[#536B67] text-xs text-white rounded-xl hover:bg-[#435754] shadow-sm"
          >
            Submit Another
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 bg-[#FFFFFF] dark:bg-[#1C2925] p-6 rounded-2xl border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20"
        >
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl px-4 py-2.5 text-sm text-[#263532] dark:text-[#E8EFEC] focus:outline-none"
            >
              <option>Bug Report</option>
              <option>Incorrect Weather Information</option>
              <option>Feature Request</option>
              <option>UI Feedback</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">
              Your Feedback
            </label>
            <textarea
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your feedback or issue..."
              className="w-full bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 rounded-xl p-4 text-sm text-[#263532] dark:text-[#E8EFEC] placeholder-[#7B8985] dark:placeholder-[#8FA19A] focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={!text.trim()}
            className="w-full py-3 bg-[#536B67] hover:bg-[#435754] text-white font-medium text-sm rounded-xl transition-colors disabled:opacity-40 shadow-sm"
          >
            Submit Feedback
          </button>
        </form>
      )}
    </div>
  );
};