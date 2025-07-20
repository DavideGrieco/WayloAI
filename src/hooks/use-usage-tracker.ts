'use client';

import { useState, useEffect, useCallback } from 'react';

const USAGE_LIMIT = 3;
const STORAGE_KEY = 'waylo_ai_usage';

type Usage = {
  count: number;
  month: number;
};

export const useUsageTracker = () => {
  const [usage, setUsage] = useState<Usage>({ count: 0, month: -1 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedUsage = localStorage.getItem(STORAGE_KEY);
      const currentMonth = new Date().getMonth();

      if (storedUsage) {
        const parsedUsage: Usage = JSON.parse(storedUsage);
        if (parsedUsage.month === currentMonth) {
          setUsage(parsedUsage);
        } else {
          // New month, reset usage
          const newUsage = { count: 0, month: currentMonth };
          setUsage(newUsage);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
        }
      } else {
        // No usage stored, initialize
        const newUsage = { count: 0, month: currentMonth };
        setUsage(newUsage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      }
    } catch (error) {
      console.error("Could not read usage from localStorage", error);
      // Fallback to in-memory tracking if localStorage is unavailable
      setUsage({ count: 0, month: new Date().getMonth() });
    }
    setIsReady(true);
  }, []);

  const canGenerate = useCallback(() => {
    return usage.count < USAGE_LIMIT;
  }, [usage.count]);

  const incrementUsage = useCallback(() => {
    const newCount = usage.count + 1;
    if (newCount <= USAGE_LIMIT) {
      const newUsage = { ...usage, count: newCount };
      setUsage(newUsage);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      } catch (error) {
        console.error("Could not write usage to localStorage", error);
      }
    }
  }, [usage]);

  const getUsage = useCallback(() => {
    return usage;
  }, [usage]);

  return { isReady, canGenerate, incrementUsage, getUsage };
};
