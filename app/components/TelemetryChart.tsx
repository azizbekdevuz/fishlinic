"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";
import type { Telemetry } from "@/app/lib/types";
import { formatDateTime } from "@/app/lib/format";
import { useMemo } from "react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export function TelemetryChart({ history }: { history: Telemetry[] }) {
  const option: EChartsOption = useMemo(() => ({
    grid: { top: 28, left: 40, right: 16, bottom: 28 },
    tooltip: { trigger: "axis" },
    legend: { data: ["pH", "Temperature", "DO", "Fish Health"], icon: "roundRect", itemWidth: 12, itemHeight: 8 },
    xAxis: { type: "category", boundaryGap: false, data: history.map(s => formatDateTime(s.timestamp)) },
    yAxis: [
      { type: "value", name: "pH / DO", splitLine: { show: true }, min: 0, max: 14 },
      { type: "value", name: "Temp / Health", position: "right", splitLine: { show: false }, min: 0 }
    ],
    series: [
      { name: "pH", type: "line", data: history.map(s => s.pH), smooth: true, lineStyle: { width: 2 } },
      { name: "Temperature", yAxisIndex: 1, type: "line", data: history.map(s => s.temp_c), smooth: true, lineStyle: { width: 2 } },
      { name: "DO", type: "line", data: history.map(s => s.do_mg_l), smooth: true, lineStyle: { width: 2 } },
      { name: "Fish Health", yAxisIndex: 1, type: "line", data: history.map(s => s.fish_health ?? 80), smooth: true, lineStyle: { width: 2 }, areaStyle: { opacity: 0.08 } }
    ]
  }), [history]);
  return <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />;
}


