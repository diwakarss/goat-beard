'use client';

import React from 'react';

interface Article {
  number: string;
  count: number;
}

interface ArticlesChartProps {
  articles: Article[];
  onArticleClick?: (articleNumber: string) => void;
}

export function ArticlesChart({ articles, onArticleClick }: ArticlesChartProps) {
  const maxCount = Math.max(...articles.map(a => a.count), 1);

  return (
    <div className="card p-4 h-full flex flex-col">
      <h2 className="text-sm font-bold text-slate-700 mb-3">Articles Invoked</h2>
      <div className="flex-1 flex flex-col justify-center space-y-2">
        {articles.map((article) => (
          <button
            key={article.number}
            onClick={() => onArticleClick?.(article.number)}
            className="flex items-center gap-2 cursor-pointer hover:bg-indigo-50/50 p-1 rounded-lg w-full transition-colors"
          >
            <span className="text-xs text-slate-500 w-14 font-medium">Art. {article.number}</span>
            <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-500 rounded-full"
                style={{ width: `${(article.count / maxCount) * 100}%` }}
              ></div>
            </div>
            <span className="kpi-number text-xs text-slate-700 w-6 text-right font-semibold">{article.count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
