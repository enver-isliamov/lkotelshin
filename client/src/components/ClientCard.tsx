import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client, FieldVisibility, fieldLabels } from "@shared/schema";
import { Calendar, Package, MapPin, FileText, AlertCircle, Car } from "lucide-react";

interface ClientCardProps {
  client: Client;
  fieldVisibility: FieldVisibility;
}

export function ClientCard({ client, fieldVisibility }: ClientCardProps) {
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('активн') || statusLower.includes('active')) {
      return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    }
    if (statusLower.includes('завершен') || statusLower.includes('complete')) {
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
    }
    return 'bg-muted text-muted-foreground';
  };

  const renderField = (key: keyof FieldVisibility, icon?: React.ReactNode) => {
    if (!fieldVisibility[key]) return null;
    
    const value = client[key];
    if (!value) return null;

    return (
      <div className="flex items-start gap-3 py-2" data-testid={`field-${key}`}>
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
    <Card className="overflow-hidden" data-testid="client-card">
      <CardHeader className="space-y-2 pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold" data-testid="text-client-name">
            {fieldVisibility.name ? client.name : 'Клиент'}
          </CardTitle>
          {fieldVisibility.dealStatus && client.dealStatus && (
            <Badge 
              className={getStatusColor(client.dealStatus)}
              data-testid="badge-status"
            >
              {client.dealStatus}
            </Badge>
          )}
        </div>
        {fieldVisibility.carNumber && client.carNumber && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="w-4 h-4" />
            <span data-testid="text-car-number">{client.carNumber}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-1">
        {renderField('phone')}
        {renderField('orderQr', <FileText className="w-4 h-4" />)}
        
        <div className="h-px bg-border my-3" />
        
        {renderField('tireCount', <Package className="w-4 h-4" />)}
        {renderField('hasRims')}
        {renderField('pricePerMonth')}
        {renderField('totalAmount')}
        {renderField('debt', <AlertCircle className="w-4 h-4" />)}
        
        <div className="h-px bg-border my-3" />
        
        {renderField('startDate', <Calendar className="w-4 h-4" />)}
        {renderField('duration')}
        {renderField('endDate')}
        {renderField('reminder')}
        
        <div className="h-px bg-border my-3" />
        
        {renderField('storageLocation', <MapPin className="w-4 h-4" />)}
        {renderField('cell')}
        {renderField('clientAddress')}
        
        <div className="h-px bg-border my-3" />
        
        {renderField('contract')}
        {renderField('dotCode')}
        {renderField('trafficSource')}
      </CardContent>
    </Card>
  );
}
