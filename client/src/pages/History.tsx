import { useQuery } from "@tanstack/react-query";
import { ArchiveOrderCard } from "@/components/ArchiveOrderCard";
import { SmallLoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { Archive } from "lucide-react";
import { ArchiveOrder, FieldVisibility } from "@shared/schema";

export default function History() {
  const { data: orders, isLoading: isLoadingOrders, error: ordersError, refetch: refetchOrders } = useQuery<ArchiveOrder[]>({
    queryKey: ['/api/archive'],
  });

  const { data: fieldVisibility, isLoading: isLoadingVisibility } = useQuery<FieldVisibility>({
    queryKey: ['/api/field-visibility'],
  });

  const isLoading = isLoadingOrders || isLoadingVisibility;

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">История заказов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ваши завершенные заказы
          </p>
        </div>
        <SmallLoadingState />
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">История заказов</h1>
        </div>
        <ErrorState
          title="Ошибка загрузки истории"
          message="Не удалось загрузить историю заказов. Проверьте подключение к интернету."
          onRetry={refetchOrders}
        />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-4" data-testid="page-history">
        <div className="mb-4">
          <h1 className="text-2xl font-bold" data-testid="text-history-title">История заказов</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ваши завершенные заказы
          </p>
        </div>
        <EmptyState
          icon={Archive}
          title="История пуста"
          description="У вас пока нет завершенных заказов. Когда заказы будут завершены, они появятся здесь."
        />
      </div>
    );
  }

  return (
    <div className="p-4" data-testid="page-history">
      <div className="mb-4">
        <h1 className="text-2xl font-bold" data-testid="text-history-title">История заказов</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'}
        </p>
      </div>
      
      <div className="space-y-3">
        {orders.map((order, index) => (
          <ArchiveOrderCard
            key={order.orderQr || index}
            order={order}
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
        ))}
      </div>
    </div>
  );
}
