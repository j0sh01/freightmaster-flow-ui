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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="goods-receipt" element={<GoodsReceipt />} />
            <Route path="shipment-manifest" element={<div className="p-8">Shipment Manifest - Coming Soon</div>} />
            <Route path="vehicle-log" element={<div className="p-8">Vehicle Log - Coming Soon</div>} />
            <Route path="left-goods-log" element={<div className="p-8">Left Goods Log - Coming Soon</div>} />
            <Route path="delivery-note" element={<div className="p-8">Delivery Note - Coming Soon</div>} />
            <Route path="customers" element={<div className="p-8">Customers - Coming Soon</div>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
