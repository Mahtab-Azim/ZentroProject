import { ListTodo, CheckCircle2, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stats } from '@/types';

interface StatsGridProps {
  stats: Stats | null;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-12 w-12 mb-4" />
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'تسک‌های من',
      value: stats.myTasks,
      icon: ListTodo,
      bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    },
    {
      title: 'تکمیل شده امروز',
      value: stats.completedToday,
      icon: CheckCircle2,
      bgColor: 'bg-green-500/10 dark:bg-green-500/20',
    },
    {
      title: 'در حال انجام',
      value: stats.inProgress,
      icon: Clock,
      bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    },
    {
      title: 'نرخ تکمیل',
      value: `${stats.completionRate}%`,
      icon: Target,
      bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className={`${card.bgColor} p-3 rounded-lg w-fit mb-4`}>
              <card.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}