import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import GoodsReceipt from "./pages/GoodsReceipt";
import ShipmentManifest from "./pages/ShipmentManifest";
import VehicleLog from "./pages/VehicleLog";
import LeftGoodsLog from "./pages/LeftGoodsLog";
import DeliveryNote from "./pages/DeliveryNote";
import Customers from "./pages/Customers";
import Items from "./pages/Items";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="goods-receipt" element={<RequireAuth><GoodsReceipt /></RequireAuth>} />
            <Route path="shipment-manifest" element={<RequireAuth><ShipmentManifest /></RequireAuth>} />
            <Route path="vehicle-log" element={<RequireAuth><VehicleLog /></RequireAuth>} />
            <Route path="left-goods-log" element={<RequireAuth><LeftGoodsLog /></RequireAuth>} />
            <Route path="delivery-note" element={<RequireAuth><DeliveryNote /></RequireAuth>} />
            <Route path="customers" element={<RequireAuth><Customers /></RequireAuth>} />
            <Route path="items" element={<RequireAuth><Items /></RequireAuth>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
