"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface RegionRow {
  label: string;
  ward: string;
  confirmationRate: number;
  belowThreshold: boolean;
  totalRecipients: number;
}

const INK = "#1a1815";
const INK_MUTED = "#55504a";
const ACCENT = "#c8873a";
const RUST = "#8b3f2a";
const HAIRLINE = "rgba(26,24,21,0.12)";

/**
 * Custom horizontal bar comparison, built directly with D3 (no chart-library
 * defaults) - the "only 40% of Ward 3 confirmed" view the spec calls out by name.
 */
export default function RegionComparisonChart({ rows }: { rows: RegionRow[] }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    if (rows.length === 0) return;

    const width = ref.current.clientWidth || 640;
    const barHeight = 34;
    const height = rows.length * barHeight + 24;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const margin = { top: 8, right: 56, bottom: 8, left: 168 };
    const innerWidth = width - margin.left - margin.right;

    const x = d3.scaleLinear().domain([0, 1]).range([0, innerWidth]);
    const y = d3
      .scaleBand()
      .domain(rows.map((r) => r.label))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.35);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Threshold guideline at 50%
    g.append("line")
      .attr("x1", x(0.5))
      .attr("x2", x(0.5))
      .attr("y1", 0)
      .attr("y2", height - margin.top - margin.bottom)
      .attr("stroke", HAIRLINE)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

    const rowsSel = g
      .selectAll("g.row")
      .data(rows)
      .join("g")
      .attr("class", "row")
      .attr("transform", (d) => `translate(0, ${y(d.label)})`);

    rowsSel
      .append("text")
      .attr("x", -12)
      .attr("y", y.bandwidth() / 2)
      .attr("dy", "0.32em")
      .attr("text-anchor", "end")
      .attr("fill", INK)
      .attr("font-size", 13)
      .attr("font-family", "var(--font-body), sans-serif")
      .text((d) => d.label);

    rowsSel
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", innerWidth)
      .attr("height", y.bandwidth())
      .attr("fill", "rgba(26,24,21,0.04)");

    rowsSel
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", (d) => (d.belowThreshold ? RUST : ACCENT))
      .transition()
      .duration(700)
      .ease(d3.easeCubicOut)
      .attr("width", (d) => x(d.confirmationRate));

    rowsSel
      .append("text")
      .attr("x", (d) => x(d.confirmationRate) + 8)
      .attr("y", y.bandwidth() / 2)
      .attr("dy", "0.32em")
      .attr("fill", INK_MUTED)
      .attr("font-size", 12)
      .attr("font-family", "var(--font-data), monospace")
      .text((d) => `${Math.round(d.confirmationRate * 100)}%`);
  }, [rows]);

  return <svg ref={ref} className="w-full" role="img" aria-label="Confirmation rate by location" />;
}
