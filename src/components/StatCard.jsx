import React, { useEffect, useState } from 'react';
import { FileText, Star, Folder, HardDrive } from 'lucide-react';
import { useNotes } from '../hooks/useNotes.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = typeof value === 'number' ? value : 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    const duration = 600; // ms
    const stepTime = Math.max(16, Math.floor(duration / end));
    const timer = setInterval(() => {
      start += 1;
      setDisplayValue(start);
      if (start >= end) {
        clearInterval(timer);
        setDisplayValue(end);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

export function StatCardGrid() {
  const { stats } = useNotes();
  const { authStatus } = useAuth();

  const driveStatusText = authStatus === 'authenticated' 
    ? 'Active / Synced' 
    : (authStatus === 'demo' ? 'Interactive Demo' : 'Not Connected');

  const cards = [
    {
      title: 'Total Notes',
      value: stats.totalNotes,
      isNumeric: true,
      description: 'Saved in CloudNotes',
      icon: <FileText size={20} className="stat-icon-blue" />,
      accentClass: 'stat-blue'
    },
    {
      title: 'Favorites',
      value: stats.favoriteCount,
      isNumeric: true,
      description: 'Pinned notes',
      icon: <Star size={20} className="stat-icon-amber" />,
      accentClass: 'stat-amber'
    },
    {
      title: 'Categories',
      value: stats.categoryCount,
      isNumeric: true,
      description: 'Active categories',
      icon: <Folder size={20} className="stat-icon-cyan" />,
      accentClass: 'stat-cyan'
    },
    {
      title: 'Drive Status',
      value: driveStatusText,
      isNumeric: false,
      description: authStatus === 'authenticated' ? 'CloudNotes folder in Drive' : 'Local sandbox session',
      icon: <HardDrive size={20} className="stat-icon-green" />,
      accentClass: 'stat-green'
    }
  ];

  return (
    <div className="stat-cards-grid">
      {cards.map((card, idx) => (
        <div key={idx} className={`stat-card glass-card ${card.accentClass}`}>
          <div className="stat-card-header">
            <span className="stat-card-title">{card.title}</span>
            <div className="stat-icon-wrap">{card.icon}</div>
          </div>
          <div className="stat-card-value">
            {card.isNumeric ? (
              <AnimatedNumber value={card.value} />
            ) : (
              <span className="stat-status-text">{card.value}</span>
            )}
          </div>
          <div className="stat-card-description">{card.description}</div>
        </div>
      ))}
    </div>
  );
}
