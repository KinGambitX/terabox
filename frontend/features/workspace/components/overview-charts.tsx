import { EChartsView } from "@/components/charts/echarts-view";
import type { ChartPalette } from "@/components/charts/echarts-view";
import type { EChartsOption } from "echarts";
import { similarityBand, statusLabel } from "../lib/review-display";
import type { Review } from "../types/review";

type StatusCount = { status: Review["status"]; count: number };

function statusOption(statuses: StatusCount[], palette: ChartPalette): EChartsOption {
  const statusColor: Record<Review["status"], string> = {
    pending: palette.warning,
    reviewed: palette.success,
    relevant: palette.info,
    dismissed: palette.muted,
  };
  return {
    animation: false,
    aria: { enabled: true, description: "Submission counts by review status." },
    grid: { left: 0, right: 26, top: 2, bottom: 2, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value) => `${value} submissions` },
    xAxis: { type: "value", min: 0, max: Math.max(1, ...statuses.map(({ count }) => count)), splitLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, axisLine: { show: false } },
    yAxis: { type: "category", data: statuses.map(({ status }) => statusLabel(status)), axisLabel: { color: palette.copy, fontSize: 12, fontFamily: palette.fontFamily }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{
      type: "bar",
      data: statuses.map(({ status, count }) => ({ value: count, itemStyle: { color: statusColor[status] } })),
      barWidth: 7,
      showBackground: true,
      backgroundStyle: { color: palette.soft, borderRadius: 4 },
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: "right", color: palette.ink, fontSize: 12, fontFamily: palette.fontFamily },
      emphasis: { focus: "self" },
    }],
  };
}

function similarityOption(reviews: Review[], palette: ChartPalette): EChartsOption {
  const entries = reviews.toSorted((left, right) => (right.score ?? -1) - (left.score ?? -1)).slice(0, 10);
  return {
    animation: false,
    aria: { enabled: true, description: "Submissions sorted from highest to lowest detected similarity." },
    grid: { left: 0, right: 44, top: 3, bottom: 3, containLabel: true },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, valueFormatter: (value) => `${value}% similarity detected` },
    xAxis: { type: "value", min: 0, max: 100, splitLine: { show: false }, axisLabel: { show: false }, axisTick: { show: false }, axisLine: { show: false } },
    yAxis: { type: "category", inverse: true, data: entries.map(({ title }) => title), axisLabel: { color: palette.copy, fontSize: 12, fontFamily: palette.fontFamily, width: 150, overflow: "truncate" }, axisTick: { show: false }, axisLine: { show: false } },
    series: [{
      type: "bar",
      data: entries.map((review) => {
        const band = similarityBand(review.score);
        const color = band.severity === "high" ? palette.danger : band.severity === "medium" ? palette.warning : band.severity === "low" ? palette.success : palette.muted;
        return { value: review.score === null ? 0 : Math.round(review.score * 100), itemStyle: { color } };
      }),
      barWidth: 8,
      itemStyle: { borderRadius: [0, 4, 4, 0] },
      label: { show: true, position: "right", color: palette.ink, fontSize: 12, fontFamily: palette.fontFamily, formatter: ({ value }) => `${value}%` },
      emphasis: { focus: "self" },
    }],
  };
}

export function ReviewStatusChart({ reviews }: { reviews: Review[] }) {
  const statuses = (['pending', 'reviewed', 'relevant', 'dismissed'] as const).map((status) => ({ status, count: reviews.filter((review) => review.status === status).length }));
  const label = `Review status counts: ${statuses.map(({ status, count }) => `${statusLabel(status)} ${count}`).join("; ")}`;
  return <EChartsView className="h-[116px] w-full" label={label} option={(palette) => statusOption(statuses, palette)} />;
}

export function SimilarityBySubmissionChart({ reviews }: { reviews: Review[] }) {
  const scored = reviews.filter((review) => review.score !== null).toSorted((left, right) => (right.score ?? -1) - (left.score ?? -1));
  const visible = scored.slice(0, 10);
  const label = `Similarity by submission, highest first: ${visible.map(({ title, score }) => `${title}, ${Math.round((score ?? 0) * 100)} percent`).join("; ")}`;
  const height = Math.max(112, visible.length * 32 + 8);
  return <div style={{ height }}><EChartsView className="h-full w-full" label={label} option={(palette) => similarityOption(scored, palette)} /></div>;
}
