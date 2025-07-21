
'use client';

import { useState, useEffect, useCallback } from 'react';

const USAGE_LIMIT = 3;
const STORAGE_KEY = 'waylo_ai_usage';

type Usage = {
  count: number;
  month: number;
};

export const useUsageTracker = () => {
  const [usage, setUsage] = useState<Usage>({ count: 0, month: new Date().getMonth() });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let storedUsage: string | null = null;
    try {
      if (typeof window !== 'undefined') {
        storedUsage = localStorage.getItem(STORAGE_KEY);
      }
    } catch (error) {
       console.error("Could not read from localStorage", error);
    }
    
    const currentMonth = new Date().getMonth();

    if (storedUsage) {
      try {
        const parsedUsage: Usage = JSON.parse(storedUsage);
        if (parsedUsage.month === currentMonth) {
          setUsage(parsedUsage);
        } else {
          const newUsage = { count: 0, month: currentMonth };
          setUsage(newUsage);
           if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
        }
      } catch (e) {
         const newUsage = { count: 0, month: currentMonth };
         setUsage(newUsage);
         if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      }
    } else {
        const newUsage = { count: 0, month: currentMonth };
        setUsage(newUsage);
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
            } catch(e) {
                console.error("Could not write to localStorage", e);
            }
        }
    }
    setIsReady(true);
  }, []);

  const canGenerate = useCallback(() => {
    return usage.count < USAGE_LIMIT;
  }, [usage.count]);

  const incrementUsage = useCallback(() => {
    const newCount = usage.count + 1;
    const currentMonth = new Date().getMonth();

    const newUsage = { count: newCount, month: currentMonth };
    setUsage(newUsage);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUsage));
      }
    } catch (error) {
      console.error("Could not write usage to localStorage", error);
    }
  }, [usage]);

  const getUsage = useCallback(() => {
    return usage;
  }, [usage]);

  return { isReady, canGenerate, incrementUsage, getUsage };
};
