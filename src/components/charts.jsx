"use client";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { num, taka } from "@/lib/format";

// Colors are CSS variables (see globals.css) so charts follow the light/dark toggle.
const AXIS_TICK = { fill: "var(--chart-axis)", fontSize: 12 };
const axisTicks = (max) => (v) => (max >= 10000 && v !== 0 ? `${v / 1000}K` : num(v));

function ChartTooltip({ active, payload }) {
    if (!active || !payload?.length)
        return null;
    const { title, value } = payload[0].payload;
    return (<div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md dark:border-slate-700 dark:bg-slate-800">
      <div className="text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-0.5 text-sm font-semibold">{taka(value)}</div>
    </div>);
}

// Card with a Chart/Table switch, so every value is readable without relying on color or hover.
export function ChartCard({ title, subtitle, table, children }) {
    const [showTable, setShowTable] = useState(false);
    return (<section className="card">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        <button type="button" className="shrink-0 rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" aria-pressed={showTable} onClick={() => setShowTable(!showTable)}>
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>
      {showTable ? (<div className="max-h-60 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-slate-500 dark:text-slate-400"><tr>
              {table.head.map((h, i) => <th key={h} className={`py-1.5 font-medium ${i ? "text-right" : ""}`}>{h}</th>)}
            </tr></thead>
            <tbody className="tabular-nums">
              {table.rows.map((row) => (<tr key={row[0]} className="border-t border-slate-200 dark:border-slate-800">
                  {row.map((cell, i) => <td key={i} className={`py-1.5 ${i ? "text-right" : ""}`}>{cell}</td>)}
                </tr>))}
            </tbody>
          </table>
        </div>) : children}
    </section>);
}

export function ColumnChart({ data, label }) {
    const max = Math.max(0, ...data.map((d) => d.value));
    return (<div className="h-60" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)"/>
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: "var(--chart-grid)" }} interval="preserveStartEnd"/>
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} tickFormatter={axisTicks(max)}/>
          <Tooltip content={<ChartTooltip/>} cursor={{ fill: "var(--chart-cursor)" }}/>
          <Bar dataKey="value" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false}/>
        </BarChart>
      </ResponsiveContainer>
    </div>);
}

export function GrowthChart({ data, label }) {
    const max = Math.max(0, ...data.map((d) => d.value));
    const last = data.length - 1;
    return (<div className="h-60" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)"/>
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: "var(--chart-grid)" }} interval="preserveStartEnd"/>
          <YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} tickFormatter={axisTicks(max)}/>
          <Tooltip content={<ChartTooltip/>} cursor={{ stroke: "var(--chart-axis)" }}/>
          <Area dataKey="value" type="linear" stroke="var(--chart-1)" strokeWidth={2} fill="var(--chart-1)" fillOpacity={0.1} isAnimationActive={false} activeDot={{ r: 5, stroke: "var(--chart-surface)", strokeWidth: 2 }} dot={({ index, cx, cy }) => (<circle key={index} cx={cx} cy={cy} r={index === last ? 5 : 0} fill="var(--chart-1)" stroke="var(--chart-surface)" strokeWidth={2}/>)} label={({ index, x, y, value }) => (index === last ? <text key={index} x={x} y={y - 12} textAnchor="end" fontSize={12} fontWeight={600} fill="var(--chart-ink)">{taka(value)}</text> : <g key={index}/>)}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>);
}

// Horizontal bars with the value at each tip.
export function HorizontalBars({ data, label }) {
    const height = Math.max(160, data.length * 44 + 16);
    return (<div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, bottom: 4, left: 0 }}>
          <XAxis type="number" hide domain={[0, "dataMax"]}/>
          <YAxis type="category" dataKey="label" width={132} tick={AXIS_TICK} tickLine={false} axisLine={false}/>
          <Tooltip content={<ChartTooltip/>} cursor={{ fill: "var(--chart-cursor)" }}/>
          <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} maxBarSize={24} isAnimationActive={false}>
            <LabelList dataKey="value" position="right" formatter={taka} fontSize={12} fill="var(--chart-ink)"/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>);
}

// One whole split into parts. `format` prints each part's value in its hover text.
export function SegmentedBar({ title, parts, format = num }) {
    const shown = parts.filter((p) => p.value > 0);
    const total = shown.reduce((a, p) => a + p.value, 0);
    const describe = (p) => `${p.label}: ${format(p.value)} (${Math.round((p.value / total) * 100)}%)`;
    return (<div>
      <div className="mb-1.5 text-sm font-medium">{title}</div>
      {total === 0 ? <p className="text-sm text-slate-500">No data yet.</p> : (<div className="flex h-7 gap-0.5" role="group" aria-label={`${title}. ${shown.map(describe).join(", ")}`}>
          {shown.map((p) => {
                const share = Math.round((p.value / total) * 100);
                return (<div key={p.key} tabIndex={0} title={describe(p)} aria-label={describe(p)} className="flex min-w-1 items-center rounded px-1.5 text-xs font-semibold" style={{ flexGrow: p.value, flexBasis: 0, background: `var(--seg-${p.key})`, color: `var(--seg-${p.key}-ink, #ffffff)` }}>
                {share >= 12 && `${share}%`}
              </div>);
            })}
        </div>)}
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
        {parts.map((p) => (<li key={p.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: `var(--seg-${p.key})` }}/>{p.label}
          </li>))}
      </ul>
    </div>);
}
