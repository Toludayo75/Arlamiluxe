import { useEffect, useState } from "react";
import { Link, Redirect } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying payment...");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || params.get("trxref");

    if (!reference) {
      setStatus("error");
      setMessage("Missing Paystack reference.");
      return;
    }

    (async () => {
      try {
        const response = await apiRequest("GET", `/api/payments/paystack/verify?reference=${encodeURIComponent(reference)}`);
        const data = await response.json();
        if (data?.success) {
          setStatus("success");
          setMessage("Payment confirmed. Your order has been placed.");
          setOrderId(data.order?.id ?? null);
          queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
        } else {
          setStatus("error");
          setMessage(data?.error || "Payment verification failed.");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message || "Payment verification failed.");
      }
    })();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Checking payment details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="bg-primary text-primary-foreground py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-serif mb-2">Payment Status</h1>
          <p className="text-lg opacity-90">Review your recent transaction.</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>{status === "loading" ? "Verifying payment" : status === "success" ? "Payment Successful" : "Payment Error"}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 text-lg">
              {status === "loading" && <Loader2 className="h-6 w-6 animate-spin" />}
              {status === "success" && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              {status === "error" && <AlertTriangle className="h-6 w-6 text-destructive" />}
              <span>{status === "success" ? "Thanks for your purchase." : status === "error" ? "There was a problem verifying your payment." : "Please wait while we confirm your order."}</span>
            </div>

            {orderId && (
              <div className="rounded-lg border border-border p-4">
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium break-words">{orderId}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link href="/my-orders">View My Orders</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
