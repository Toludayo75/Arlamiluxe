import { Switch, Route, useLocation } from "wouter";
import { lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load pages for better performance
const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Collections = lazy(() => import("@/pages/collections"));
const Products = lazy(() => import("@/pages/products"));
const ProductDetail = lazy(() => import("@/pages/product-detail"));
const Cart = lazy(() => import("@/pages/cart"));
const ContactPage = lazy(() => import("@/pages/contact"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const PaymentSuccess = lazy(() => import("@/pages/payment-success"));
const AuthPage = lazy(() => import("@/pages/auth"));
const MyOrders = lazy(() => import("@/pages/my-orders"));
const OrderDetail = lazy(() => import("@/pages/order-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AdminLayout = lazy(() => import("@/pages/admin/layout"));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminCollections = lazy(() => import("@/pages/admin/collections"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminShipping = lazy(() => import("@/pages/admin/shipping"));
const AdminSupport = lazy(() => import("@/pages/admin/support"));

function Router() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Skeleton className="h-8 w-32 mx-auto mb-4" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </div>
    }>
      <Switch>
        <Route path="/admin/products">
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        </Route>
        <Route path="/admin/collections">
          <AdminLayout>
            <AdminCollections />
          </AdminLayout>
        </Route>
        <Route path="/admin/orders">
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        </Route>
        <Route path="/admin/shipping">
          <AdminLayout>
            <AdminShipping />
          </AdminLayout>
        </Route>
        <Route path="/admin/support">
          <AdminLayout>
            <AdminSupport />
          </AdminLayout>
        </Route>
        <Route path="/admin">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </Route>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/collections" component={Collections} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/products" component={Products} />
        <Route path="/cart" component={Cart} />
        <Route path="/contact" component={ContactPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/payment-success" component={PaymentSuccess} />
        <Route path="/auth" component={AuthPage} />
        <Route path="/my-orders" component={MyOrders} />
        <Route path="/orders/:id" component={OrderDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");
  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPage && <Navigation />}
      <main className="flex-1">
        <Router />
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
