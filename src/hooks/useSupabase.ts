"use client";
import * as React from "react";
import { fetchAll, insertRow, updateRow, deleteRow } from "@/lib/data";

/**
 * useCollection — generic client-side CRUD hook backed by the data layer
 * (Supabase when configured, mock data otherwise). Handles optimistic refresh.
 */
export function useCollection<T extends { id: string }>(table: string) {
  const [data, setData] = React.useState<T[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const rows = await fetchAll<T>(table);
    setData(rows);
    setLoading(false);
  }, [table]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const create = React.useCallback(async (row: Partial<T>) => {
    await insertRow<T>(table, row);
    await refresh();
  }, [table, refresh]);

  const update = React.useCallback(async (id: string, patch: Partial<T>) => {
    await updateRow<T>(table, id, patch);
    await refresh();
  }, [table, refresh]);

  const remove = React.useCallback(async (id: string) => {
    await deleteRow(table, id);
    await refresh();
  }, [table, refresh]);

  return { data, loading, refresh, create, update, remove };
}
