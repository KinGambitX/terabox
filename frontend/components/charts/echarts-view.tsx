"use client";

import { useEffect, useRef } from "react";
import type { EChartsOption } from "echarts";

export type ChartPalette = {
  danger: string;
  warning: string;
  success: string;
  info: string;
  border: string;
  copy: string;
  muted: string;
  ink: string;
  soft: string;
  fontFamily: string;
};

type OptionFactory = (palette: ChartPalette) => EChartsOption;
type EChartsCore = typeof import("echarts/core");

let echartsModule: Promise<EChartsCore> | null = null;

function loadECharts() {
  if (!echartsModule) {
    echartsModule = Promise.all([
      import("echarts/core"),
      import("echarts/charts"),
      import("echarts/components"),
      import("echarts/renderers"),
    ]).then(([core, charts, components, renderers]) => {
      core.use([
        charts.BarChart,
        components.GridComponent,
        components.TooltipComponent,
        components.AriaComponent,
        renderers.SVGRenderer,
      ]);
      return core;
    });
  }
  return echartsModule;
}

function readPalette(element: HTMLElement): ChartPalette {
  const style = getComputedStyle(element);
  const token = (name: string) => style.getPropertyValue(`--workspace-${name}`).trim();

  return {
    danger: token("danger"),
    warning: token("warning"),
    success: token("success"),
    info: token("info"),
    border: token("border"),
    copy: token("copy"),
    muted: token("muted"),
    ink: token("ink"),
    soft: token("soft"),
    fontFamily: style.fontFamily,
  };
}

export function EChartsView({
  option,
  label,
  className,
}: {
  option: OptionFactory;
  label: string;
  className: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const chart = useRef<import("echarts").ECharts | null>(null);
  const palette = useRef<ChartPalette | null>(null);
  const makeOption = useRef(option);

  useEffect(() => {
    makeOption.current = option;
    if (chart.current && palette.current) {
      chart.current.setOption(makeOption.current(palette.current), { notMerge: true });
    }
  }, [option]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;

    let disposed = false;
    let observer: ResizeObserver | undefined;

    void loadECharts().then((echarts) => {
      if (disposed) return;
      palette.current = readPalette(element);
      chart.current = echarts.init(element, undefined, { renderer: "svg" });
      chart.current.setOption(makeOption.current(palette.current));
      observer = new ResizeObserver(() => chart.current?.resize());
      observer.observe(element);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      chart.current?.dispose();
      chart.current = null;
    };
  }, []);

  return <div ref={host} className={className} role="img" aria-label={label} />;
}
