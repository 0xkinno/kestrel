"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface TimelinePoint {
  minutesSinceSent: number;
  response: "UNDERSTOOD" | "NEED_MORE_INFO";
}

const ACCENT = "#c8873a";
const INK_MUTED = "#55504a";
const HAIRLINE = "rgba(26,24,21,0.16)";

/**
 * Cumulative confirmation curve - "how fast did comprehension actually spread"
 * after dispatch. Custom D3 area+line, not a default chart-library look.
 */
export default function CumulativeConfirmationChart({
  points,
  totalRecipients,
}: {
  points: TimelinePoint[];
  totalRecipients: number;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    if (totalRecipients === 0) return;

    const width = ref.current.clientWidth || 640;
    const height = 220;
    const margin = { top: 16, right: 24, bottom: 28, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const maxMinutes = Math.max(15, d3.max(points, (p) => p.minutesSinceSent) ?? 15);

    const cumulative: { minute: number; count: number }[] = [{ minute: 0, count: 0 }];
    let running = 0;
    for (const p of points) {
      running++;
      cumulative.push({ minute: p.minutesSinceSent, count: running });
    }
    cumulative.push({ minute: maxMinutes, count: running });

    const x = d3.scaleLinear().domain([0, maxMinutes]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, totalRecipients]).range([innerHeight, 0]);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat((d) => `${d}m`))
      .call((sel) => sel.select(".domain").attr("stroke", HAIRLINE))
      .selectAll("text")
      .attr("fill", INK_MUTED)
      .attr("font-size", 11)
      .attr("font-family", "var(--font-data), monospace");

    g.append("g")
      .call(d3.axisLeft(y).ticks(4))
      .call((sel) => sel.select(".domain").attr("stroke", HAIRLINE))
      .selectAll("text")
      .attr("fill", INK_MUTED)
      .attr("font-size", 11)
      .attr("font-family", "var(--font-data), monospace");

    const area = d3
      .area<{ minute: number; count: number }>()
      .curve(d3.curveStepAfter)
      .x((d) => x(d.minute))
      .y0(innerHeight)
      .y1((d) => y(d.count));

    const line = d3
      .line<{ minute: number; count: number }>()
      .curve(d3.curveStepAfter)
      .x((d) => x(d.minute))
      .y((d) => y(d.count));

    g.append("path").datum(cumulative).attr("fill", ACCENT).attr("fill-opacity", 0.12).attr("d", area);

    const path = g
      .append("path")
      .datum(cumulative)
      .attr("fill", "none")
      .attr("stroke", ACCENT)
      .attr("stroke-width", 2)
      .attr("d", line);

    const totalLength = (path.node() as SVGPathElement).getTotalLength();
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(900)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);
  }, [points, totalRecipients]);

  return (
    <svg
      ref={ref}
      className="w-full"
      role="img"
      aria-label="Cumulative confirmations over time since dispatch"
    />
  );
}
