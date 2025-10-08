import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Ошибка загрузки", 
  message, 
  onRetry 
}: ErrorStateProps) {
  return (
    <Card data-testid="error-state">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-base font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" data-testid="button-retry">
            Попробовать снова
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
