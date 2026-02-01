import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Sprint } from '@/types';
import Link from 'next/link';

interface SprintProgressProps {
  sprint: Sprint | null;
}

export default function SprintProgress({ sprint }: SprintProgressProps) {
  if (sprint === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>اسپرینت فعال</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-2 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>اسپرینت فعال</CardTitle>
        <Link href="/sprints">
          <Button variant="ghost" size="sm">
            جزئیات
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <h4 className="font-medium mb-2">{sprint.name}</h4>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{sprint.startDate}</span>
          <span>-</span>
          <span>{sprint.endDate}</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">پیشرفت</span>
            <span className="font-medium text-primary">{sprint.progress}%</span>
          </div>
          <Progress value={sprint.progress} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-2xl font-bold">{sprint.completedTasks}</p>
            <p className="text-xs text-muted-foreground">تکمیل شده</p>
          </div>
          <div className="text-center p-3 bg-accent rounded-lg">
            <p className="text-2xl font-bold">{sprint.totalTasks - sprint.completedTasks}</p>
            <p className="text-xs text-muted-foreground">باقیمانده</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}