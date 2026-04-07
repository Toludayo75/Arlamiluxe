import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { Order, OrderItem } from "@shared/schema";
import { format } from "date-fns";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: order, isLoading: orderLoading, isError: orderError } = useQuery<Order>({
    queryKey: ["/api/orders", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/orders/${id}`);
      return response.json();
    },
    enabled: !!user && !!id,
  });

  const { data: items, isLoading: itemsLoading } = useQuery<OrderItem[]>({
    queryKey: ["/api/orders", id, "items"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/orders/${id}/items`);
      return response.json();
    },
    enabled: !!user && !!id,
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
        <p className="text-muted-foreground mb-6">You need to be logged in to view order details.</p>
        <Link href="/auth">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  if (orderLoading || itemsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (orderError || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find that order. Please check your orders list.</p>
        <Link href="/my-orders">
          <Button>Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id.substring(0, 8).toUpperCase()}</p>
        </div>
        <Link href="/my-orders">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>Order information and status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Placed</p>
                <p>{format(new Date(order.createdAt), "PPP 'at' p")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={order.status === "delivered" ? "default" : order.status === "pending" ? "secondary" : "outline"}>
                  {order.status}
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <p>{order.paymentStatus === "paid" ? "Paid" : "Pending"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">₦{order.total.toLocaleString()}</p>
              </div>
              {order.shippingState && (
                <div>
                  <p className="text-muted-foreground">Shipping</p>
                  <p>{order.shippingState} — ₦{order.shippingFee?.toLocaleString() ?? 0}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery Information</CardTitle>
            <CardDescription>Where this order will be delivered.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">State</p>
              <p>{order.shippingState || "Not provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Address</p>
              <p>{order.shippingAddress || "Not provided"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p>{order.shippingPhone || "Not provided"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Items</CardTitle>
          <CardDescription>Products included in this order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {items && items.length > 0 ? (
            items.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 border-b border-muted/50 pb-4 last:border-b-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">No items found for this order.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
