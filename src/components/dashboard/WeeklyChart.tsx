import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WeeklyData } from '@/types';

interface WeeklyChartProps {
  data: WeeklyData[] | null;
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>پیشرفت هفتگی</CardTitle>
          <CardDescription>تکمیل تسک‌ها در هفته جاری</CardDescription>
        </CardHeader>
        <CardContent>
          {data === null ? (
            <Skeleton className="h-[240px] w-full rounded-lg" />
          ) : (
            <p className="text-center py-20 text-muted-foreground">
              داده‌ای برای نمایش وجود ندارد
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>پیشرفت هفتگی</CardTitle>
        <CardDescription>تکمیل تسک‌ها در هفته جاری</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(142.1 76.2% 36.3%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* شبکه پس‌زمینه با رنگ مناسب تم */}
            <CartesianGrid
              strokeDasharray="4 4"
              className="stroke-muted/40"
              vertical={false}
            />

            {/* محور X - روزهای هفته */}
            <XAxis
              dataKey="day"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}  // درست: داخل string
              tickMargin={10}
            />

            <YAxis
              tick={{ fill: 'currentColor', fontSize: 12 }}
              tickLine={{ stroke: 'currentColor' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}  // درست شد!
              tickMargin={12}
              width={50}
            />
            {/* Tooltip کاملاً با تم هماهنگ */}
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 12px hsl(var(--muted)/0.2)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
            />

            {/* مساحت تکمیل شده */}
            <Area
              type="monotone"
              dataKey="completed"
              stroke="hsl(142.1 76.2 36.3%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCompleted)"
              name="تکمیل شده"
            />

            {/* مساحت در حال انجام */}
            <Area
              type="monotone"
              dataKey="inProgress"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorInProgress)"
              name="در حال انجام"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}