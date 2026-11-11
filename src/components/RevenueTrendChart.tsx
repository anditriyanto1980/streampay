import React, { useState, useMemo } from 'react';
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
  Area,
  ComposedChart,
} from 'recharts';
import { IncomeRecord, StreamerId } from '../types';
import { STREAMERS, STREAMER_LIST, MONTH_NAMES_ID } from '../constants';
import { formatIDR } from '../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Box,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Sparkles,
  BarChart3,
  Cylinder,
  Activity,
} from 'lucide-react';

interface RevenueTrendChartProps {
  records: IncomeRecord[];
  selectedYear: number;
  onYearChange?: (year: number) => void;
}

export type GraphicType = '3d-bar' | '3d-cylinder' | 'line';
export type ChartViewMode = 'streamers' | 'platforms' | 'total';

// Helper to adjust color brightness for 3D lighting facets
function adjustBrightness(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------------------
// 1. ISOMETRIC 3D BAR SHAPE
// ---------------------------------------------------------------------------
const Isometric3DBarShape = (props: any) => {
  const { x, y, width, height, fill, color = fill || '#6366F1' } = props;

  if (isNaN(x) || isNaN(y) || isNaN(width)) return null;

  // Depth offsets proportional to width
  const depthX = Math.max(3, Math.min(width * 0.42, 11));
  const depthY = Math.max(2, Math.min(depthX * 0.58, 7));

  // If height is negligible or 0, draw an elegant flat 3D base pedestal
  if (!height || height <= 2) {
    const topPoints = `${x},${y} ${x + depthX},${y - depthY} ${x + width + depthX},${y - depthY} ${x + width},${y}`;
    return (
      <g opacity={0.35}>
        <polygon points={topPoints} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.5} />
      </g>
    );
  }

  const frontColor = color;
  const topColor = adjustBrightness(color, 32); // Highlighted lid (light from top-left)
  const sideColor = adjustBrightness(color, -28); // Shaded right face (depth facet)
  const gradId = `front-grad-${color.replace('#', '')}-${Math.round(x)}`;

  // SVG Coordinates
  // Top Lid (Rhombus)
  const topPoints = `${x},${y} ${x + depthX},${y - depthY} ${x + width + depthX},${y - depthY} ${x + width},${y}`;

  // Right Side Extrusion (Depth)
  const sidePoints = `${x + width},${y} ${x + width + depthX},${y - depthY} ${x + width + depthX},${y + height - depthY} ${x + width},${y + height}`;

  // Ground Ambient Drop Shadow
  const shadowPoints = `${x},${y + height} ${x + depthX * 1.2},${y + height - depthY * 0.3} ${x + width + depthX * 1.3},${y + height + depthY * 0.4} ${x + width},${y + height + 3}`;

  return (
    <g className="cursor-pointer transition-transform duration-200 hover:brightness-110">
      <defs>
        {/* Subtle vertical gradient for front face */}
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={adjustBrightness(frontColor, 12)} />
          <stop offset="100%" stopColor={frontColor} />
        </linearGradient>
      </defs>

      {/* 3D Floor Shadow */}
      <polygon
        points={shadowPoints}
        fill="rgba(15, 23, 42, 0.16)"
        filter="blur(1px)"
      />

      {/* Front Face */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={`url(#${gradId})`}
        rx={0.5}
      />

      {/* Left Specular Bevel Line */}
      <line
        x1={x + 0.75}
        y1={y}
        x2={x + 0.75}
        y2={y + height}
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth={0.75}
      />

      {/* Right Side 3D Facet */}
      <polygon
        points={sidePoints}
        fill={sideColor}
      />

      {/* Top 3D Highlight Lid */}
      <polygon
        points={topPoints}
        fill={topColor}
        stroke="rgba(255, 255, 255, 0.55)"
        strokeWidth={0.75}
      />
    </g>
  );
};

// ---------------------------------------------------------------------------
// 2. CYLINDER 3D PILLAR SHAPE
// ---------------------------------------------------------------------------
const Cylinder3DBarShape = (props: any) => {
  const { x, y, width, height, fill, color = fill || '#6366F1' } = props;

  if (isNaN(x) || isNaN(y) || isNaN(width)) return null;

  const rx = width / 2;
  const ry = Math.max(2.5, Math.min(rx * 0.36, 7));
  const cx = x + rx;

  if (!height || height <= 2) {
    return (
      <g opacity={0.35}>
        <ellipse cx={cx} cy={y} rx={rx} ry={ry} fill="#cbd5e1" stroke="#94a3b8" strokeWidth={0.5} />
      </g>
    );
  }

  const topColor = adjustBrightness(color, 36);
  const darkColor = adjustBrightness(color, -30);
  const gradId = `cyl-grad-${color.replace('#', '')}-${Math.round(x)}`;

  return (
    <g className="cursor-pointer transition-transform duration-200 hover:brightness-110">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={darkColor} />
          <stop offset="28%" stopColor={adjustBrightness(color, 8)} />
          <stop offset="65%" stopColor={adjustBrightness(color, 24)} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
      </defs>

      {/* Ambient shadow beneath base */}
      <ellipse
        cx={cx + 1}
        cy={y + height + 1}
        rx={rx * 1.15}
        ry={ry * 1.1}
        fill="rgba(15, 23, 42, 0.16)"
        filter="blur(1px)"
      />

      {/* Cylinder curved body */}
      <path
        d={`M ${x} ${y} 
            L ${x} ${y + height} 
            A ${rx} ${ry} 0 0 0 ${x + width} ${y + height} 
            L ${x + width} ${y} 
            Z`}
        fill={`url(#${gradId})`}
      />

      {/* Bottom curved rim */}
      <ellipse
        cx={cx}
        cy={y + height}
        rx={rx}
        ry={ry}
        fill={color}
        opacity={0.65}
      />

      {/* Top 3D Elliptical Cap */}
      <ellipse
        cx={cx}
        cy={y}
        rx={rx}
        ry={ry}
        fill={topColor}
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth={0.75}
      />
    </g>
  );
};

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({
  records,
  selectedYear,
  onYearChange,
}) => {
  // Chart visual type: '3d-bar' (default), '3d-cylinder', or 'line'
  const [graphicType, setGraphicType] = useState<GraphicType>('3d-bar');
  const [viewMode, setChartViewMode] = useState<ChartViewMode>('streamers');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeStreamers, setActiveStreamers] = useState<Record<StreamerId, boolean>>({
    nata: true,
    dona: true,
    nina: true,
    fawwas: true,
  });

  // Available years from records
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(selectedYear);
    yearsSet.add(new Date().getFullYear());
    records.forEach((r) => {
      if (r.transactionDate) {
        const y = parseInt(r.transactionDate.split('-')[0], 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [records, selectedYear]);

  // Aggregate monthly data for selectedYear
  const monthlyData = useMemo(() => {
    return MONTH_NAMES_ID.map((name, idx) => {
      const monthNum = idx + 1;

      // Filter records for this month and selectedYear
      const monthRecords = records.filter((r) => {
        if (!r.transactionDate) return false;
        const [y, m] = r.transactionDate.split('-').map(Number);
        return y === selectedYear && m === monthNum;
      });

      const total = monthRecords.reduce((sum, r) => sum + r.amount, 0);
      const shopee = monthRecords
        .filter((r) => r.platform === 'shopee')
        .reduce((sum, r) => sum + r.amount, 0);
      const tokped = monthRecords
        .filter((r) => r.platform === 'tokopedia')
        .reduce((sum, r) => sum + r.amount, 0);

      const nata = monthRecords
        .filter((r) => r.streamerId === 'nata')
        .reduce((sum, r) => sum + r.amount, 0);
      const dona = monthRecords
        .filter((r) => r.streamerId === 'dona')
        .reduce((sum, r) => sum + r.amount, 0);
      const nina = monthRecords
        .filter((r) => r.streamerId === 'nina')
        .reduce((sum, r) => sum + r.amount, 0);
      const fawwas = monthRecords
        .filter((r) => r.streamerId === 'fawwas')
        .reduce((sum, r) => sum + r.amount, 0);

      return {
        monthIndex: monthNum,
        monthName: name.slice(0, 3), // e.g. "Jan", "Feb"
        fullMonthName: name,
        total,
        shopee,
        tokped,
        nata,
        dona,
        nina,
        fawwas,
        sessionCount: monthRecords.length,
      };
    });
  }, [records, selectedYear]);

  // Calculate year totals and trends
  const yearSummary = useMemo(() => {
    const totalYear = monthlyData.reduce((sum, m) => sum + m.total, 0);
    const monthsWithIncome = monthlyData.filter((m) => m.total > 0);
    const avgMonthly =
      monthsWithIncome.length > 0 ? totalYear / monthsWithIncome.length : 0;

    // Find highest month
    let bestMonth = monthlyData[0];
    monthlyData.forEach((m) => {
      if (m.total > bestMonth.total) {
        bestMonth = m;
      }
    });

    // Month-over-month growth calculation
    const currentMonthIndex = new Date().getMonth() + 1; // 1-12
    const currentMonthData = monthlyData[currentMonthIndex - 1] || { total: 0 };
    const prevMonthData =
      currentMonthIndex > 1
        ? monthlyData[currentMonthIndex - 2]
        : { total: 0 };

    let momGrowthPercent = 0;
    if (prevMonthData.total > 0) {
      momGrowthPercent =
        ((currentMonthData.total - prevMonthData.total) / prevMonthData.total) * 100;
    }

    return {
      totalYear,
      avgMonthly,
      bestMonth,
      currentMonthTotal: currentMonthData.total,
      prevMonthTotal: prevMonthData.total,
      momGrowthPercent,
    };
  }, [monthlyData]);

  const toggleStreamer = (id: StreamerId) => {
    setActiveStreamers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Custom IDR tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs backdrop-blur-md min-w-[210px] z-50">
          <div className="font-extrabold text-sm mb-1.5 text-slate-100 flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-indigo-400" />
              {dataPoint?.fullMonthName} {selectedYear}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {dataPoint?.sessionCount || 0} Sesi Live
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {payload.map((entry: any, index: number) => {
              const val = entry.value || 0;
              return (
                <div
                  key={`item-${index}`}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span
                    className="flex items-center gap-1.5 font-semibold"
                    style={{ color: entry.color || entry.fill }}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm shadow-xs"
                      style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    {entry.name}:
                  </span>
                  <span className="font-bold text-slate-100">
                    {formatIDR(val)}
                  </span>
                </div>
              );
            })}
          </div>

          {dataPoint && dataPoint.total > 0 && viewMode !== 'total' && (
            <div className="border-t border-slate-800 mt-2.5 pt-2 flex items-center justify-between text-xs font-bold text-indigo-300">
              <span>Total Keseluruhan:</span>
              <span className="text-white font-black">{formatIDR(dataPoint.total)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Helper to render Bar shape based on active graphicType
  const renderBarShape = (color: string) => {
    if (graphicType === '3d-cylinder') {
      return (barProps: any) => <Cylinder3DBarShape {...barProps} color={color} />;
    }
    return (barProps: any) => <Isometric3DBarShape {...barProps} color={color} />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4 transition-all">
      {/* Header bar: Title, Graphic Type Switcher, Year switcher, Collapse toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-700 p-0.5 shadow-md flex items-center justify-center text-white">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Tren Kenaikan Pendapatan (Batang 3D Modern)
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Tahun {selectedYear}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Visualisasi grafik batang dimensi 3D perbandingan omset antar live streamer & platform
            </p>
          </div>
        </div>

        {/* Action Controls: Graphic Type Toggle, Year Select, and Collapse */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Graphic Type Switcher (Batang 3D / Silinder 3D / Garis Tren) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setGraphicType('3d-bar')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                graphicType === '3d-bar'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grafik Batang 3D Isometrik"
            >
              <Box className="w-3.5 h-3.5" />
              <span>Batang 3D</span>
            </button>
            <button
              onClick={() => setGraphicType('3d-cylinder')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                graphicType === '3d-cylinder'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grafik Pilar Silinder 3D"
            >
              <Cylinder className="w-3.5 h-3.5" />
              <span>Silinder 3D</span>
            </button>
            <button
              onClick={() => setGraphicType('line')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                graphicType === 'line'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Grafik Garis Tren"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Garis</span>
            </button>
          </div>

          {/* Year select dropdown */}
          {onYearChange && (
            <select
              value={selectedYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          )}

          {/* Collapse / Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title={isExpanded ? 'Sembunyikan Grafik' : 'Tampilkan Grafik'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1 animate-fade-in">
          {/* Mode Tabs and Filter Buttons */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <button
                onClick={() => setChartViewMode('streamers')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'streamers'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Per Streamer (4)
              </button>
              <button
                onClick={() => setChartViewMode('platforms')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'platforms'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Shopee vs Tokopedia
              </button>
              <button
                onClick={() => setChartViewMode('total')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'total'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Total Keseluruhan
              </button>
            </div>

            {/* Quick Streamer toggles when in 'streamers' mode */}
            {viewMode === 'streamers' && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Filter Batang:</span>
                {STREAMER_LIST.map((st) => {
                  const isActive = activeStreamers[st.id];
                  return (
                    <button
                      key={st.id}
                      onClick={() => toggleStreamer(st.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 shadow-xs'
                          : 'opacity-40 bg-slate-100 dark:bg-slate-800 line-through'
                      }`}
                      style={{
                        borderColor: isActive ? st.color : 'transparent',
                        color: isActive ? st.color : undefined,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: st.color }}
                      />
                      <span>{st.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Platform indicators when in 'platforms' mode */}
            {viewMode === 'platforms' && (
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EE4D2D]" />
                  Shopee Live
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#03AC0E]" />
                  Tokopedia Live
                </span>
              </div>
            )}
          </div>

          {/* Quick Year Insights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Omset Tahun {selectedYear}
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {formatIDR(yearSummary.totalYear)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Rata-rata / Bulan
              </span>
              <span className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                {formatIDR(Math.round(yearSummary.avgMonthly))}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                Bulan Omset Tertinggi
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate block">
                {yearSummary.bestMonth.total > 0
                  ? `${yearSummary.bestMonth.fullMonthName} (${formatIDR(yearSummary.bestMonth.total)})`
                  : '-'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Tren Kenaikan MoM
              </span>
              <div className="flex items-center gap-1 text-xs sm:text-sm font-black">
                {yearSummary.momGrowthPercent >= 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{yearSummary.momGrowthPercent.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    {yearSummary.momGrowthPercent.toFixed(1)}%
                  </span>
                )}
                <span className="text-[10px] font-normal text-slate-400">vs bln lalu</span>
              </div>
            </div>
          </div>

          {/* 3D Bar / Cylinder / Line Chart Container */}
          <div className="h-80 sm:h-96 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              {graphicType === 'line' ? (
                // Line Chart Render
                viewMode === 'total' ? (
                  <ComposedChart
                    data={monthlyData}
                    margin={{ top: 20, right: 15, left: 5, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="totalRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${val}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      name="Total Pendapatan"
                      fill="url(#totalRevenueGrad)"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6, fill: '#4F46E5' }}
                    />
                  </ComposedChart>
                ) : viewMode === 'platforms' ? (
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 20, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${val}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(val) => (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {val}
                        </span>
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="shopee"
                      name="Shopee Live"
                      stroke="#EE4D2D"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#EE4D2D', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tokped"
                      name="Tokopedia Live"
                      stroke="#03AC0E"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#03AC0E', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : (
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 20, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${val}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      formatter={(val) => (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {val}
                        </span>
                      )}
                    />
                    {activeStreamers.nata && (
                      <Line
                        type="monotone"
                        dataKey="nata"
                        name="Nata"
                        stroke={STREAMERS.nata.color}
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: STREAMERS.nata.color, strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeStreamers.dona && (
                      <Line
                        type="monotone"
                        dataKey="dona"
                        name="Dona"
                        stroke={STREAMERS.dona.color}
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: STREAMERS.dona.color, strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeStreamers.nina && (
                      <Line
                        type="monotone"
                        dataKey="nina"
                        name="Nina"
                        stroke={STREAMERS.nina.color}
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: STREAMERS.nina.color, strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                    {activeStreamers.fawwas && (
                      <Line
                        type="monotone"
                        dataKey="fawwas"
                        name="Fawwas"
                        stroke={STREAMERS.fawwas.color}
                        strokeWidth={2.5}
                        dot={{ r: 3.5, fill: STREAMERS.fawwas.color, strokeWidth: 2, stroke: '#ffffff' }}
                        activeDot={{ r: 6 }}
                      />
                    )}
                  </LineChart>
                )
              ) : (
                // 3D BAR / 3D CYLINDER RENDER
                viewMode === 'total' ? (
                  <ComposedChart
                    data={monthlyData}
                    margin={{ top: 30, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${val}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {/* 3D Bar for Total */}
                    <Bar
                      dataKey="total"
                      name="Total Pendapatan"
                      shape={renderBarShape('#6366F1')}
                      maxBarSize={48}
                    />
                    {/* Floating Trendline over 3D Bars */}
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Garis Tren Total"
                      stroke="#F43F5E"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#F43F5E', strokeWidth: 2, stroke: '#ffffff' }}
                    />
                  </ComposedChart>
                ) : viewMode === 'platforms' ? (
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 30, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${val}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(val) => (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {val}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="shopee"
                      name="Shopee Live"
                      shape={renderBarShape('#EE4D2D')}
                      maxBarSize={32}
                    />
                    <Bar
                      dataKey="tokped"
                      name="Tokopedia Live"
                      shape={renderBarShape('#03AC0E')}
                      maxBarSize={32}
                    />
                  </BarChart>
                ) : (
                  // Per Streamer 4-Bar Chart
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 30, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                    <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) =>
                        val >= 1000000 ? `${(val / 1000000).toFixed(0)}Jt` : `${val}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      formatter={(val) => (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {val}
                        </span>
                      )}
                    />
                    {activeStreamers.nata && (
                      <Bar
                        dataKey="nata"
                        name="Nata"
                        shape={renderBarShape(STREAMERS.nata.color)}
                        maxBarSize={20}
                      />
                    )}
                    {activeStreamers.dona && (
                      <Bar
                        dataKey="dona"
                        name="Dona"
                        shape={renderBarShape(STREAMERS.dona.color)}
                        maxBarSize={20}
                      />
                    )}
                    {activeStreamers.nina && (
                      <Bar
                        dataKey="nina"
                        name="Nina"
                        shape={renderBarShape(STREAMERS.nina.color)}
                        maxBarSize={20}
                      />
                    )}
                    {activeStreamers.fawwas && (
                      <Bar
                        dataKey="fawwas"
                        name="Fawwas"
                        shape={renderBarShape(STREAMERS.fawwas.color)}
                        maxBarSize={20}
                      />
                    )}
                  </BarChart>
                )
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
