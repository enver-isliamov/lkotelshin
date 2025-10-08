import { useQuery } from "@tanstack/react-query";
import { ClientCard } from "@/components/ClientCard";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Package } from "lucide-react";
import { Client, FieldVisibility } from "@shared/schema";

export default function Dashboard() {
  const { data: client, isLoading: isLoadingClient, error: clientError, refetch: refetchClient } = useQuery<Client>({
    queryKey: ['/api/client'],
  });

  const { data: fieldVisibility, isLoading: isLoadingVisibility } = useQuery<FieldVisibility>({
    queryKey: ['/api/field-visibility'],
  });

  const isLoading = isLoadingClient || isLoadingVisibility;

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingState />
      </div>
    );
  }

  if (clientError) {
    return (
      <div className="p-4">
        <ErrorState
          title="Ошибка загрузки данных"
          message="Не удалось загрузить информацию о вашем заказе. Проверьте подключение к интернету."
          onRetry={refetchClient}
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-4">
        <EmptyState
          icon={Package}
          title="Нет активных заказов"
          description="У вас пока нет активных заказов на хранение. Обратитесь к администратору для создания заказа."
        />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="page-dashboard">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">Личный кабинет</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Информация о вашем текущем заказе
        </p>
      </div>
      
      <ClientCard 
        client={client} 
        fieldVisibility={fieldVisibility || {
          name: true,
          phone: true,
          carNumber: true,
          orderQr: true,
          pricePerMonth: true,
          tireCount: true,
          hasRims: true,
          startDate: true,
          duration: true,
          reminder: true,
          endDate: true,
          storageLocation: true,
          cell: true,
          totalAmount: true,
          debt: false,
          contract: true,
          clientAddress: false,
          dealStatus: true,
          trafficSource: false,
          dotCode: true,
        }}
      />
    </div>
  );
}
