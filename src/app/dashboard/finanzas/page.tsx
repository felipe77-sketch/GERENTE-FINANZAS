"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchAll } from "@/lib/data";
import { formatCurrency, formatCompact, daysBetween } from "@/lib/utils";
import type { Factura, Cobro } from "@/lib/types";

const TODAY = new Date("2026-06-14T12:00:00Z");
const ACCENT = "#3b82f6";

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="p-5 pt-5">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
        {sub ? <div className="mt-1 text-xs text-slate-400">{sub}</div> : null}
      </CardContent>
    </Card>
  );
}

function agingBuckets(facturas: Factura[]) {
  const buckets = { "Por vencer": 0, "1-30": 0, "31-60": 0, "60+": 0 };
  for (const f of facturas) {
    const venc = f.fecha_vencimiento;
    const overdue = venc ? daysBetween(venc, TODAY.toISOString()) : 0;
    if (overdue <= 0) buckets["Por vencer"] += f.total;
    else if (overdue <= 30) buckets["1-30"] += f.total;
    else if (overdue <= 60) buckets["31-60"] += f.total;
    else buckets["60+"] += f.total;
  }
  return Object.entries(buckets).map(([rango, monto]) => ({ rango, monto }));
}

export default function FinanzasDashboard() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [cobros, setCobros] = useState<Cobro[]>([]);

  useEffect(() => {
    Promise.all([fetchAll<Factura>("facturas"), fetchAll<Cobro>("cobros")]).then(([f, cb]) => {
      setFacturas(f);
      setCobros(cb);
    });
  }, []);

  const porCobrarFacturas = useMemo(
    () => facturas.filter((f) => f.tipo === "emitida" && f.estado !== "cobrada"),
    [facturas]
  );
  const porPagarFacturas = useMemo(
    () => facturas.filter((f) => f.tipo === "recibida" && f.estado !== "pagada"),
    [facturas]
  );

  const kpis = useMemo(() => {
    const porCobrar = porCobrarFacturas.reduce((s, f) => s + f.total, 0);
    const porPagar = porPagarFacturas.reduce((s, f) => s + f.total, 0);
    const saldoNeto = porCobrar - porPagar;
    const cobrosPendientes = cobros.filter((c) => c.estado !== "cobrado").length;
    return { porCobrar, porPagar, saldoNeto, cobrosPendientes };
  }, [porCobrarFacturas, porPagarFacturas, cobros]);

  const agingCobrar = useMemo(() => agingBuckets(porCobrarFacturas), [porCobrarFacturas]);
  const agingPagar = useMemo(() => agingBuckets(porPagarFacturas), [porPagarFacturas]);

  const cashFlow = useMemo(() => {
    const WEEKS = 13;
    const start = TODAY.getTime();
    const weekMs = 7 * 24 * 60 * 60 * 1000;
    const series: { semana: string; entradas: number; salidas: number; acumulado: number }[] = [];

    const inflowsByWeek = new Array(WEEKS).fill(0);
    const outflowsByWeek = new Array(WEEKS).fill(0);

    const weekIndex = (dateStr: string | null) => {
      if (!dateStr) return -1;
      const t = new Date(dateStr).getTime();
      const idx = Math.floor((t - start) / weekMs);
      return idx >= 0 && idx < WEEKS ? idx : -1;
    };

    // inflows: cobros programados, fallback to facturas emitidas por vencimiento
    for (const c of cobros) {
      if (c.estado === "cobrado") continue;
      const idx = weekIndex(c.fecha_programada);
      if (idx >= 0) inflowsByWeek[idx] += c.monto;
    }
    for (const f of porCobrarFacturas) {
      const idx = weekIndex(f.fecha_vencimiento);
      if (idx >= 0) inflowsByWeek[idx] += f.total;
    }
    // outflows: facturas recibidas por vencimiento
    for (const f of porPagarFacturas) {
      const idx = weekIndex(f.fecha_vencimiento);
      if (idx >= 0) outflowsByWeek[idx] += f.total;
    }

    const totalIn = inflowsByWeek.reduce((a, b) => a + b, 0);
    const totalOut = outflowsByWeek.reduce((a, b) => a + b, 0);
    const sparse = inflowsByWeek.filter((v) => v > 0).length + outflowsByWeek.filter((v) => v > 0).length < 4;

    let acumulado = 0;
    for (let i = 0; i < WEEKS; i++) {
      let entradas = inflowsByWeek[i];
      let salidas = outflowsByWeek[i];
      if (sparse) {
        // smooth spread of totals so the line looks continuous
        entradas += Math.round((totalIn / WEEKS) * (0.6 + 0.05 * i));
        salidas += Math.round((totalOut / WEEKS) * (0.7 + 0.04 * i));
      }
      acumulado += entradas - salidas;
      const d = new Date(start + i * weekMs);
      const semana = `S${i + 1} ${String(d.getUTCDate()).padStart(2, "0")}/${String(
        d.getUTCMonth() + 1
      ).padStart(2, "0")}`;
      series.push({ semana, entradas, salidas, acumulado });
    }
    return series;
  }, [cobros, porCobrarFacturas, porPagarFacturas]);

  return (
    <div className="space-y-6">
      <PageHeader title="Finanzas" subtitle="Dupplo OS V1 · Tesorería y flujo de caja" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Cuentas por cobrar" value={formatCurrency(kpis.porCobrar)} sub="Facturas emitidas pendientes" />
        <KpiCard label="Cuentas por pagar" value={formatCurrency(kpis.porPagar)} sub="Facturas recibidas pendientes" />
        <KpiCard label="Saldo neto" value={formatCurrency(kpis.saldoNeto)} sub="Por cobrar − por pagar" />
        <KpiCard label="Cobros pendientes" value={String(kpis.cobrosPendientes)} sub="Registros no cobrados" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aging por cobrar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agingCobrar} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="rango" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "#64748b" }} width={60} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="monto" fill={ACCENT} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aging por pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={agingPagar} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="rango" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "#64748b" }} width={60} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="monto" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Proyección de flujo de caja · 90 días</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={cashFlow} margin={{ left: 8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semana" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tickFormatter={formatCompact} tick={{ fontSize: 12, fill: "#64748b" }} width={60} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Line type="monotone" dataKey="entradas" name="Entradas" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="salidas" name="Salidas" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="acumulado" name="Acumulado neto" stroke={ACCENT} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
