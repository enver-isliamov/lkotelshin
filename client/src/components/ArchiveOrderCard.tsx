import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArchiveOrder, FieldVisibility, fieldLabels } from "@shared/schema";
import { ChevronDown, ChevronUp, Calendar, Package, MapPin, FileText, Car } from "lucide-react";

interface ArchiveOrderCardProps {
  order: ArchiveOrder;
  fieldVisibility: FieldVisibility;
}

export function ArchiveOrderCard({ order, fieldVisibility }: ArchiveOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('завершен') || statusLower.includes('complete')) {
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    }
    if (statusLower.includes('архив') || statusLower.includes('archive')) {
      return 'bg-muted text-muted-foreground';
    }
    return 'bg-muted text-muted-foreground';
  };

  const renderField = (key: keyof FieldVisibility, icon?: React.ReactNode) => {
    if (!fieldVisibility[key]) return null;
    
    const value = order[key];
    if (!value) return null;

    return (
      <div className="flex items-start gap-3 py-2" data-testid={`archive-field-${key}`}>
        {icon && <div className="text-muted-foreground mt-0.5">{icon}</div>}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {fieldLabels[key]}
          </p>
          <p className="text-sm text-foreground mt-1 break-words">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`archive-order-${order.orderQr}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold truncate">
              {fieldVisibility.carNumber && order.carNumber ? order.carNumber : 'Заказ'}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {fieldVisibility.endDate && order.endDate && (
                <p className="text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {order.endDate}
                </p>
              )}
              {fieldVisibility.dealStatus && order.dealStatus && (
                <Badge 
                  className={`${getStatusColor(order.dealStatus)} text-xs`}
                  data-testid="badge-archive-status"
                >
                  {order.dealStatus}
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-archive"
            className="shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-1 pt-0">
          {renderField('name')}
          {renderField('phone')}
          {renderField('orderQr', <FileText className="w-4 h-4" />)}
          
          <div className="h-px bg-border my-3" />
          
          {renderField('tireCount', <Package className="w-4 h-4" />)}
          {renderField('hasRims')}
          {renderField('pricePerMonth')}
          {renderField('totalAmount')}
          
          <div className="h-px bg-border my-3" />
          
          {renderField('startDate', <Calendar className="w-4 h-4" />)}
          {renderField('duration')}
          {renderField('storageLocation', <MapPin className="w-4 h-4" />)}
          {renderField('cell')}
          {renderField('contract')}
          {renderField('dotCode')}
        </CardContent>
      )}
    </Card>
  );
}
