import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useInertia } from '../../context/InertiaContext';

interface MonthlyDataPoint {
  month: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  expenses: number;
  netProfit: number;
}

interface BrandSharePoint {
  name: string;
  value: number;
  color: string;
}

interface CategorySharePoint {
  category: string;
  revenue: number;
  cost: number;
  margin: number;
}

interface FinancialChartsProps {
  monthlyData: MonthlyDataPoint[];
  brandData: BrandSharePoint[];
  categoryData: CategorySharePoint[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  monthlyData,
  brandData,
  categoryData
}) => {
  const { formatMoney, currency } = useInertia();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#111111] text-white p-3 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1 z-50">
          <p className="font-bold text-slate-300 font-mono text-[11px] mb-1.5 border-b border-white/10 pb-1">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span 
                  className="w-2 h-2 rounded-full inline-block" 
                  style={{ backgroundColor: entry.color }} 
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {formatMoney(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[#111111] text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-mono">
          <div className="font-bold text-slate-200">{data.name}</div>
          <div className="text-[#F6AF31] font-bold mt-0.5">
            {formatMoney(data.value)} ({((data.value / brandData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Revenue vs COGS Area Chart */}
      <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F6AF31] bg-[#111111] px-2 py-0.5 rounded-md">
              Trend Analysis
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight mt-1">
              Monthly Revenue vs. OEM Procurement (COGS)
            </h3>
            <p className="text-xs text-slate-500">
              Tracking gross sales volume against factory component acquisition cost
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#111111]" />
              Gross Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F6AF31]" />
              OEM Cost (COGS)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#22A06B]" />
              Net Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111111" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#111111" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorCogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F6AF31" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#F6AF31" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22A06B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22A06B" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  if (currency === 'UGX') {
                    return `${(value / 1000000).toFixed(0)}M`;
                  }
                  return `$${(value / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                stroke="#111111" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="cogs" 
                name="COGS" 
                stroke="#F6AF31" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorCogs)" 
              />
              <Area 
                type="monotone" 
                dataKey="netProfit" 
                name="Net Profit" 
                stroke="#22A06B" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OEM Brand Contribution Pie / Donut */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Market Share
              </span>
              <h3 className="text-base font-black text-[#111111] tracking-tight">
                Revenue by OEM Brand
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              YTD 2026
            </span>
          </div>

          <div className="h-48 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {brandData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Donut Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
              <span className="text-xs font-black text-[#111111] font-mono">
                {formatMoney(brandData.reduce((a, b) => a + b.value, 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Brand Legend with Breakdown */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {brandData.map((item, idx) => {
            const total = brandData.reduce((a, b) => a + b.value, 0);
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400 text-[11px]">{pct}%</span>
                  <span className="font-black text-[#111111]">{formatMoney(item.value)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Component Category Performance Bar Chart */}
      <div className="lg:col-span-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Department Performance
            </span>
            <h3 className="text-base font-black text-[#111111] tracking-tight">
              Component Category Revenue vs. Margins
            </h3>
            <p className="text-xs text-slate-500">
              Breakdown of spare parts categories by revenue generation and profit percentage
            </p>
          </div>
          <div className="text-xs font-bold text-slate-500">
            Top Performer: <strong className="text-[#111111]">Hydraulics & Cylinders</strong>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={categoryData} 
              margin={{ top: 10, right: 10, left: -10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 10, fill: '#475569' }} 
                interval={0}
                angle={-15}
                textAnchor="end"
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => {
                  if (currency === 'UGX') {
                    return `${(value / 1000000).toFixed(0)}M`;
                  }
                  return `$${(value / 1000).toFixed(0)}k`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: 12, fontSize: 11 }} 
              />
              <Bar 
                dataKey="revenue" 
                name="Gross Sales" 
                fill="#111111" 
                radius={[6, 6, 0, 0]} 
              />
              <Bar 
                dataKey="cost" 
                name="Component Cost" 
                fill="#F6AF31" 
                radius={[6, 6, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
