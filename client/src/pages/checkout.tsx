import { useEffect, useState } from "react";
import { useLocation, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { CartItem, Product, ShippingRate } from "@shared/schema";

type CartItemWithProduct = CartItem & { product?: Product };

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [shippingState, setShippingState] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");

  const { data: cartItems } = useQuery<CartItem[]>({
    queryKey: ["/api/cart"],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: shippingRates } = useQuery<ShippingRate[]>({
    queryKey: ["/api/shipping-rates"],
  });

  const cartWithProducts: CartItemWithProduct[] =
    cartItems?.map((item) => ({
      ...item,
      product: products?.find((p) => p.id === item.productId),
    })) || [];

  const subtotal = cartWithProducts.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const selectedShippingRate = shippingRates?.find((rate) => rate.state === shippingState) || shippingRates?.[0];
  const shippingFee = selectedShippingRate?.fee ?? 0;
  const total = subtotal + shippingFee;

  useEffect(() => {
    if (!shippingState && shippingRates?.length) {
      setShippingState(shippingRates[0].state);
    }
  }, [shippingRates, shippingState]);

  const handlePayWithPaystack = async () => {
    setPaymentError(null);

    if (!shippingState || !shippingAddress.trim()) {
      setPaymentError("Please provide your state and delivery address.");
      return;
    }

    if (!selectedShippingRate) {
      setPaymentError("Shipping is not available for the selected state.");
      return;
    }

    setIsPaying(true);

    try {
      const response = await apiRequest("POST", "/api/payments/paystack/initialize", {
        shippingState,
        shippingAddress,
        shippingPhone,
      });
      const data = await response.json();
      if (!data.authorization_url) {
        throw new Error("Could not start payment session");
      }
      window.location.href = data.authorization_url;
    } catch (error: any) {
      setPaymentError(error?.message || "Failed to start payment");
      setIsPaying(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (cartWithProducts.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto max-w-4xl px-6 py-16">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add some items to proceed with checkout</p>
              <Button onClick={() => setLocation("/products")} data-testid="button-continue-shopping">
                Browse Products
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <div className="bg-primary text-primary-foreground py-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-serif mb-2" data-testid="text-checkout-title">Checkout</h1>
          <p className="text-lg opacity-90">Complete your purchase with Paystack</p>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Enter your delivery address and state.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {shippingRates && shippingRates.length === 0 && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                      No shipping rates are configured yet. Please add shipping rates from the admin panel or contact support.
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium" htmlFor="shippingState">State</label>
                    <select
                      id="shippingState"
                      value={shippingState}
                      onChange={(event) => setShippingState(event.target.value)}
                      className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                      disabled={shippingRates?.length === 0}
                    >
                      {shippingRates?.length ? (
                        shippingRates.map((rate) => (
                          <option key={rate.id} value={rate.state}>{rate.state}</option>
                        ))
                      ) : (
                        <option value="">{shippingRates ? "No states available" : "Loading shipping rates..."}</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="shippingAddress">Delivery Address</label>
                    <textarea
                      id="shippingAddress"
                      value={shippingAddress}
                      onChange={(event) => setShippingAddress(event.target.value)}
                      rows={4}
                      className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Street, town, landmark"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium" htmlFor="shippingPhone">Phone Number</label>
                    <input
                      id="shippingPhone"
                      type="tel"
                      value={shippingPhone}
                      onChange={(event) => setShippingPhone(event.target.value)}
                      className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="08012345678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartWithProducts.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4"
                    data-testid={`checkout-item-${item.id}`}
                  >
                    {item.product?.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product?.name || "Unknown Product"}</h4>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      <p className="text-sm font-medium mt-1">
                        ₦{((item.product?.price || 0) * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Paystack is used to process card and local payment transactions securely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Click the button below to complete payment through Paystack.
                  </p>
                  {paymentError && (
                    <p className="text-sm text-destructive mb-4">{paymentError}</p>
                  )}
                  <Button
                    className="mt-4"
                    onClick={handlePayWithPaystack}
                    disabled={isPaying || !shippingAddress.trim() || !shippingState || !selectedShippingRate}
                    data-testid="button-place-order"
                  >
                    {isPaying ? "Redirecting to Paystack..." : "Pay with Paystack"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Total</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>₦{shippingFee.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span data-testid="text-order-total">₦{total.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  Logged in as {user.email}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
