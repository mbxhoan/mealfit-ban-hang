'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_MEAL_ITEMS,
  type Order,
  type Customer,
  type MealItem,
} from '@/src/data/mealPrepData';

type Mode = 'loading' | 'supabase' | 'offline';

interface DataContextValue {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  meals: MealItem[];
  setMeals: React.Dispatch<React.SetStateAction<MealItem[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  mode: Mode;
  // Write-through CRUD (persists to Supabase in supabase mode, localStorage in offline mode).
  saveMeal: (m: MealItem) => Promise<void>;
  removeMeal: (m: MealItem) => Promise<void>;
  saveCustomer: (c: Customer) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  saveOrder: (o: Order) => Promise<void>;
  removeOrder: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [meals, setMeals] = useState<MealItem[]>(INITIAL_MEAL_ITEMS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [mode, setMode] = useState<Mode>('loading');

  // Load: try Supabase via API; fall back to localStorage seed (offline).
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/mealfit', { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (json.configured && alive) {
            setMeals(json.meals?.length ? json.meals : INITIAL_MEAL_ITEMS);
            setCustomers(json.customers ?? []);
            setOrders(json.orders ?? []);
            setMode('supabase');
            return;
          }
        }
      } catch {
        /* fall through to offline */
      }
      if (!alive) return;
      // Offline: hydrate from localStorage if present.
      try {
        const o = localStorage.getItem('mealfit_orders_v2');
        if (o) setOrders(JSON.parse(o));
        const c = localStorage.getItem('mealfit_customers_v2');
        if (c) setCustomers(JSON.parse(c));
        const m = localStorage.getItem('mealfit_meals_v2');
        if (m) {
          const parsed = JSON.parse(m);
          if (Array.isArray(parsed) && parsed.length >= 50) setMeals(parsed);
        }
      } catch {
        /* ignore */
      }
      setMode('offline');
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Offline persistence only (in supabase mode the DB is the source of truth).
  useEffect(() => {
    if (mode === 'offline') localStorage.setItem('mealfit_orders_v2', JSON.stringify(orders));
  }, [orders, mode]);
  useEffect(() => {
    if (mode === 'offline') localStorage.setItem('mealfit_meals_v2', JSON.stringify(meals));
  }, [meals, mode]);
  useEffect(() => {
    if (mode === 'offline') localStorage.setItem('mealfit_customers_v2', JSON.stringify(customers));
  }, [customers, mode]);

  const post = (path: string, body: unknown) =>
    fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const del = (path: string, body: unknown) =>
    fetch(path, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  const saveMeal = async (m: MealItem) => {
    setMeals((prev) => {
      const i = prev.findIndex((x) => x.id === m.id);
      return i >= 0 ? prev.map((x) => (x.id === m.id ? m : x)) : [...prev, m];
    });
    if (mode === 'supabase') await post('/api/mealfit/meals', m);
  };
  const removeMeal = async (m: MealItem) => {
    setMeals((prev) => prev.filter((x) => x.id !== m.id));
    if (mode === 'supabase') await del('/api/mealfit/meals', m);
  };
  const saveCustomer = async (c: Customer) => {
    setCustomers((prev) => {
      const i = prev.findIndex((x) => x.id === c.id);
      return i >= 0 ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c];
    });
    if (mode === 'supabase') await post('/api/mealfit/customers', c);
  };
  const removeCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((x) => x.id !== id));
    if (mode === 'supabase') await del('/api/mealfit/customers', { id });
  };
  const saveOrder = async (o: Order) => {
    setOrders((prev) => {
      const i = prev.findIndex((x) => x.id === o.id);
      return i >= 0 ? prev.map((x) => (x.id === o.id ? o : x)) : [o, ...prev];
    });
    if (mode === 'supabase') await post('/api/mealfit/orders', o);
  };
  const removeOrder = async (id: string) => {
    setOrders((prev) => prev.filter((x) => x.id !== id));
    if (mode === 'supabase') await del('/api/mealfit/orders', { id });
  };

  return (
    <DataContext.Provider
      value={{
        orders,
        setOrders,
        meals,
        setMeals,
        customers,
        setCustomers,
        mode,
        saveMeal,
        removeMeal,
        saveCustomer,
        removeCustomer,
        saveOrder,
        removeOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
