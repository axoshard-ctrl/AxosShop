import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertCircle, Edit, Trash2, Plus, Eye } from "lucide-react";

interface AuditLogEntry {
  id: string;
  action: "create" | "update" | "delete" | "view";
  entityType: string;
  entityId: string;
  entityName: string;
  adminId: string;
  adminName: string;
  changes?: Record<string, { old: any; new: any }>;
  timestamp: Date;
  ipAddress?: string;
}

interface AdminAuditLogsProps {
  logs: AuditLogEntry[];
  isLoading?: boolean;
}

export function AdminAuditLogs({ logs, isLoading }: AdminAuditLogsProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case "create":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "update":
        return <Edit className="h-4 w-4 text-blue-500" />;
      case "delete":
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case "view":
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, any> = {
      create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      update: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      view: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return variants[action] || variants.view;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Activity Log</CardTitle>
        <CardDescription>
          Track all administrative actions and changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading activity logs...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No activity logged yet
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge className={`text-xs ${getActionBadge(log.action)}`}>
                          {log.action.toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {log.entityType}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {log.entityName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {log.adminName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.adminId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.changes && Object.keys(log.changes).length > 0 ? (
                        <details className="cursor-pointer">
                          <summary className="text-sm text-muted-foreground hover:text-foreground">
                            {Object.keys(log.changes).length} field(s) changed
                          </summary>
                          <div className="mt-2 space-y-1 text-xs">
                            {Object.entries(log.changes).map(([key, change]) => (
                              <div key={key} className="bg-muted p-2 rounded">
                                <p className="font-medium">{key}</p>
                                <p className="text-red-600">
                                  Old: {JSON.stringify(change.old)}
                                </p>
                                <p className="text-green-600">
                                  New: {JSON.stringify(change.new)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.ipAddress || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
