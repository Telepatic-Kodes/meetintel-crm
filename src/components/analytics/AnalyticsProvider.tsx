'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface AnalyticsEvent {
  id: string;
  event: string;
  timestamp: number;
  data?: any;
}

interface AnalyticsContextType {
  track: (event: string, data?: any) => void;
  getMetrics: () => {
    totalSessions: number;
    totalAnalyses: number;
    averageAnalysisTime: number;
    mostUsedSections: string[];
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  useEffect(() => {
    // Load analytics from localStorage
    const savedEvents = localStorage.getItem('meetintel-analytics');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save analytics to localStorage
    localStorage.setItem('meetintel-analytics', JSON.stringify(events));
  }, [events]);

  const track = (event: string, data?: any) => {
    const newEvent: AnalyticsEvent = {
      id: Date.now().toString(),
      event,
      timestamp: Date.now(),
      data
    };
    
    setEvents(prev => [...prev, newEvent]);
    
    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to external analytics service
      console.log('Analytics Event:', newEvent);
    }
  };

  const getMetrics = () => {
    const now = Date.now();
    const last24Hours = events.filter(e => now - e.timestamp < 24 * 60 * 60 * 1000);
    
    const totalSessions = new Set(events.map(e => e.data?.sessionId)).size;
    const totalAnalyses = events.filter(e => e.event === 'analysis_completed').length;
    
    const analysisEvents = events.filter(e => e.event === 'analysis_completed');
    const averageAnalysisTime = analysisEvents.length > 0 
      ? analysisEvents.reduce((sum, e) => sum + (e.data?.duration || 0), 0) / analysisEvents.length
      : 0;
    
    const sectionEvents = events.filter(e => e.event === 'section_viewed');
    const sectionCounts = sectionEvents.reduce((acc, e) => {
      const section = e.data?.section;
      if (section) {
        acc[section] = (acc[section] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedSections = Object.entries(sectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([section]) => section);

    return {
      totalSessions,
      totalAnalyses,
      averageAnalysisTime,
      mostUsedSections
    };
  };

  return (
    <AnalyticsContext.Provider value={{ track, getMetrics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
