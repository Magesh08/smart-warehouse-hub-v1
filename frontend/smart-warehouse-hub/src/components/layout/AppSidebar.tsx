import { LayoutDashboard, Map, Package, ShoppingCart, Bot, BarChart3, Settings, SlidersHorizontal, Warehouse, Camera, HeartPulse, Thermometer, ClipboardList } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Warehouse Map", url: "/warehouse", icon: Map },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Robots / AGV", url: "/robots", icon: Bot },
  { title: "Control Panel", url: "/control", icon: SlidersHorizontal },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const monitoringItems = [
  { title: "Camera & Vision", url: "/camera", icon: Camera },
  { title: "Robot Health", url: "/robot-health", icon: HeartPulse },
  { title: "Environment", url: "/environment", icon: Thermometer },
  { title: "Activity Log", url: "/activity", icon: ClipboardList },
];

const systemItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderMenu = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              activeClassName="bg-sidebar-accent text-primary font-medium"
            >
              <item.icon className="w-4 h-4 mr-2 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarContent className="bg-sidebar pt-4">
        <div className="px-4 pb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Warehouse className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight truncate">SmartWMS</h1>
              <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-widest">Warehouse AI</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">Main</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">Monitoring</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(monitoringItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest">System</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenu(systemItems)}</SidebarGroupContent>
        </SidebarGroup>

        {!collapsed && (
          <div className="mt-auto p-4">
            <div className="rounded-lg bg-sidebar-accent p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-slot-empty animate-pulse" />
                <span className="text-[11px] font-medium text-sidebar-accent-foreground">System Online</span>
              </div>
              <p className="text-[10px] text-sidebar-foreground/50">5 robots active · 6 cameras</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
