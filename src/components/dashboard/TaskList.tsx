import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Task } from '@/types';

interface TaskListProps {
  tasks: Task[] | null;
}

export default function TaskList({ tasks }: TaskListProps) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'بالا';
      case 'medium': return 'متوسط';
      case 'low': return 'پایین';
      default: return priority;
    }
  };

  if (tasks === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تسک‌های من</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>تسک‌های من</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">تسکی وجود ندارد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>تسک‌های من</CardTitle>
        <Button variant="ghost" size="sm" className="text-primary">
          مشاهده همه
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="p-4 border rounded-lg hover:shadow-md transition-[box-shadow,border-color] cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-sm flex-1">
                {task.title}
              </h4>
              <Badge variant={getPriorityVariant(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString('fa-IR')}</span>
              </div>
              <span className="font-medium text-primary">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}