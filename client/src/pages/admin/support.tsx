import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type Inquiry, type Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function AdminSupport() {
  const { toast } = useToast();
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const { data: inquiries, isLoading } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PATCH", `/api/admin/inquiries/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      toast({
        title: "Success",
        description: "Inquiry status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inquiry status",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (inquiryId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: inquiryId, status: newStatus });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "in-progress":
        return "default";
      case "resolved":
        return "default";
      case "closed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getProductName = (productId: string | null) => {
    if (!productId) return "General Inquiry";
    const product = products?.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-semibold mb-2" data-testid="text-support-title">Customer Support</h1>
        <p className="text-muted-foreground">Manage customer inquiries and complaints</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inquiry List</CardTitle>
          <CardDescription>View and manage customer inquiries</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : inquiries && inquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inquiry) => (
                  <TableRow key={inquiry.id} data-testid={`row-inquiry-${inquiry.id}`}>
                    <TableCell className="font-medium">{inquiry.customerName}</TableCell>
                    <TableCell>{inquiry.phone}</TableCell>
                    <TableCell>{getProductName(inquiry.productId)}</TableCell>
                    <TableCell>{format(new Date(inquiry.createdAt), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => handleStatusChange(inquiry.id, value)}
                      >
                        <SelectTrigger className="w-[140px]" data-testid={`select-inquiry-status-${inquiry.id}`}>
                          <SelectValue>
                            <Badge variant={getStatusBadgeVariant(inquiry.status)}>
                              {inquiry.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInquiry(inquiry)}
                        data-testid={`button-view-inquiry-${inquiry.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No inquiries found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedInquiry !== null} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              From: {selectedInquiry?.customerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Customer Information</h4>
              <div className="space-y-1 text-sm">
                <p>Name: {selectedInquiry?.customerName}</p>
                <p>Phone: {selectedInquiry?.phone}</p>
                <p>Email: {selectedInquiry?.email || "N/A"}</p>
                <p>Date: {selectedInquiry && format(new Date(selectedInquiry.createdAt), "PPP")}</p>
                <p>Status: <Badge variant={getStatusBadgeVariant(selectedInquiry?.status || "")}>{selectedInquiry?.status}</Badge></p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Product</h4>
              <p className="text-sm">{selectedInquiry?.productId && getProductName(selectedInquiry.productId)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Message</h4>
              <p className="text-sm text-muted-foreground">
                {selectedInquiry?.message || "No message provided"}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
