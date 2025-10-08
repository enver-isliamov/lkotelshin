import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { useToast } from "@/hooks/use-toast";
import { FieldVisibility, fieldLabels } from "@shared/schema";
import { Settings, Save } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminSettings() {
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<FieldVisibility | null>(null);

  const { data: fieldVisibility, isLoading, error, refetch } = useQuery<FieldVisibility>({
    queryKey: ['/api/field-visibility'],
    refetchOnMount: true,
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: FieldVisibility) => {
      return await apiRequest('POST', '/api/field-visibility', settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/field-visibility'] });
      toast({
        title: "Настройки сохранены",
        description: "Изменения видимости полей успешно применены",
      });
      setLocalSettings(null);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки. Попробуйте еще раз.",
      });
    },
  });

  const currentSettings = localSettings || fieldVisibility;

  const handleToggle = (field: keyof FieldVisibility) => {
    if (!currentSettings) return;
    
    const newSettings = {
      ...currentSettings,
      [field]: !currentSettings[field],
    };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    if (localSettings) {
      updateMutation.mutate(localSettings);
    }
  };

  const hasChanges = localSettings !== null;

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorState
          title="Ошибка загрузки настроек"
          message="Не удалось загрузить настройки видимости полей."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!currentSettings) {
    return null;
  }

  const fieldGroups = [
    {
      title: "Основная информация",
      fields: ['name', 'phone', 'carNumber', 'orderQr'] as (keyof FieldVisibility)[],
    },
    {
      title: "Детали заказа",
      fields: ['tireCount', 'hasRims', 'pricePerMonth', 'totalAmount'] as (keyof FieldVisibility)[],
    },
    {
      title: "Финансовая информация",
      fields: ['debt'] as (keyof FieldVisibility)[],
    },
    {
      title: "Даты и сроки",
      fields: ['startDate', 'duration', 'endDate', 'reminder'] as (keyof FieldVisibility)[],
    },
    {
      title: "Хранение",
      fields: ['storageLocation', 'cell'] as (keyof FieldVisibility)[],
    },
    {
      title: "Документы и адреса",
      fields: ['contract', 'clientAddress'] as (keyof FieldVisibility)[],
    },
    {
      title: "Дополнительно",
      fields: ['dealStatus', 'trafficSource', 'dotCode'] as (keyof FieldVisibility)[],
    },
  ];

  return (
    <div className="p-4 pb-24" data-testid="page-admin-settings">
      <div className="mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-admin-title">Настройки администратора</h1>
          <p className="text-sm text-muted-foreground">
            Управление видимостью полей в личном кабинете
          </p>
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Информация</CardTitle>
          <CardDescription>
            Включенные поля будут видны клиентам в их личном кабинете. 
            Выключенные поля будут скрыты от клиентов.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {fieldGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle className="text-base">{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.fields.map((field) => (
                <div
                  key={field}
                  className="flex items-center justify-between gap-4"
                  data-testid={`setting-${field}`}
                >
                  <Label htmlFor={field} className="flex-1 cursor-pointer">
                    {fieldLabels[field]}
                  </Label>
                  <Switch
                    id={field}
                    checked={currentSettings[field]}
                    onCheckedChange={() => handleToggle(field)}
                    data-testid={`switch-${field}`}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full"
            data-testid="button-save-settings"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
      )}
    </div>
  );
}
