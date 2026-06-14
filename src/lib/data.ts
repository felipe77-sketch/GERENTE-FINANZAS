import { supabase, isSupabaseConfigured } from "./supabase";
import * as mock from "./mock-data";
import { uid } from "./utils";

/**
 * Generic data access. When Supabase is configured and returns rows, those
 * rows are used. When Supabase is not configured OR returns an empty set,
 * the app falls back to in-memory mock data so the UI always looks complete.
 *
 * Mutations: when Supabase is configured they persist to the DB. When not,
 * they mutate the in-memory mock arrays so the demo feels real within a session.
 */

const stores: Record<string, any[]> = {
  clientes: [...mock.mockClientes],
  proyectos: [...mock.mockProyectos],
  cotizaciones: [...mock.mockCotizaciones],
  cotizacion_items: [...mock.mockCotizacionItems],
  ordenes_compra: [...mock.mockOrdenesCompra],
  facturas: [...mock.mockFacturas],
  cobros: [...mock.mockCobros],
  obras: [...mock.mockObras],
  personal: [...mock.mockPersonal],
  proveedores: [...mock.mockProveedores],
};

function nowIso() {
  return new Date().toISOString();
}

export async function fetchAll<T = any>(table: string): Promise<T[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from(table).select("*");
    if (!error && data && data.length > 0) return data as T[];
  }
  return [...stores[table]] as T[];
}

export async function insertRow<T = any>(table: string, row: any): Promise<T> {
  const record = {
    id: row.id || uid(),
    created_at: nowIso(),
    updated_at: nowIso(),
    ...row,
  };
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from(table).insert(record).select().single();
    if (!error && data) return data as T;
  }
  stores[table] = [record, ...stores[table]];
  return record as T;
}

export async function updateRow<T = any>(table: string, id: string, patch: any): Promise<T> {
  const updated = { ...patch, updated_at: nowIso() };
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from(table).update(updated).eq("id", id).select().single();
    if (!error && data) return data as T;
  }
  stores[table] = stores[table].map((r) => (r.id === id ? { ...r, ...updated } : r));
  return stores[table].find((r) => r.id === id) as T;
}

export async function deleteRow(table: string, id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) return;
  }
  stores[table] = stores[table].filter((r) => r.id !== id);
}
