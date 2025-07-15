import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  FileText, 
  AlertTriangle, 
  Users, 
  Receipt,
  ChevronDown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Goods Receipt",
    url: "/goods-receipt",
    icon: Package,
  },
  {
    title: "Shipment Manifest",
    url: "/shipment-manifest",
    icon: FileText,
  },
  {
    title: "Vehicle Log",
    url: "/vehicle-log",
    icon: Truck,
  },
  {
    title: "Left Goods Log",
    url: "/left-goods-log",
    icon: AlertTriangle,
  },
  {
    title: "Delivery Note",
    url: "/delivery-note",
    icon: Receipt,
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={cn("border-r border-border", collapsed ? "w-14" : "w-64")} collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">FreightMaster</h1>
              <p className="text-xs text-muted-foreground">Tenacious Logistics</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mx-auto">
            <Truck className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={cn(
                      "w-full",
                      isActive(item.url) && "bg-primary/10 text-primary border-r-2 border-primary"
                    )}
                  >
                    <NavLink to={item.url} end={item.url === "/"}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}