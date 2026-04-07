import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Package, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order } from "@shared/schema";
import { format } from "date-fns";

export default function MyOrders() {
  const { user } = useAuth();
  
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <Package className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2" data-testid="text-login-required">
          Please Log In
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to view your orders
        </p>
        <Link href="/auth">
          <Button data-testid="button-goto-login">Go to Login</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const sortedOrders = orders?.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          My Orders
        </h1>
        <p className="text-muted-foreground">
          Track and manage your orders
        </p>
      </div>

      {!sortedOrders || sortedOrders.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2" data-testid="text-no-orders">
              No orders yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Link href="/products">
              <Button data-testid="button-browse-products">Browse Products</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card key={order.id} className="hover-elevate" data-testid={`card-order-${order.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg" data-testid={`text-order-id-${order.id}`}>
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </CardTitle>
                    <CardDescription data-testid={`text-order-date-${order.id}`}>
                      Placed on {format(new Date(order.createdAt), "PPP")}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={
                      order.status === "delivered" ? "default" :
                      order.status === "pending" ? "secondary" : 
                      "outline"
                    }
                    data-testid={`badge-order-status-${order.id}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-xl font-semibold" data-testid={`text-order-total-${order.id}`}>
                      ₦{order.total.toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    asChild
                    data-testid={`button-view-order-${order.id}`}
                  >
                    <Link href={`/orders/${order.id}`}>
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
