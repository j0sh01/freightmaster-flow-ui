import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Users,
  Calendar,
  BarChart3
} from "lucide-react";
import heroImage from "@/assets/hero-logistics.jpg";
import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/api/frappe";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<any>({});
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchDashboardData();
        setMetrics(data.metrics || {});
        setRecentActivities(data.recent_activities || []);
        setPerformance(data.performance || {});
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Stats cards config
const statsData = [
  {
    title: "Goods Received",
      value: loading ? "-" : metrics.goods_received ?? "-",
      change: "+12%", // Placeholder, can be dynamic if backend provides
    changeType: "increase",
    icon: Package,
    color: "status-pending"
  },
  {
    title: "Shipments in Transit",
      value: loading ? "-" : metrics.shipments_in_transit ?? "-",
    change: "+5%",
    changeType: "increase",
    icon: Truck,
    color: "status-in-transit"
  },
  {
    title: "Left Goods",
      value: loading ? "-" : metrics.left_goods ?? "-",
    change: "-8%",
    changeType: "decrease",
    icon: AlertTriangle,
    color: "status-delayed"
  },
  {
    title: "Completed Deliveries",
      value: loading ? "-" : metrics.completed_deliveries ?? "-",
    change: "+18%",
    changeType: "increase",
    icon: CheckCircle,
    color: "status-completed"
  }
];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div 
        className="relative h-64 rounded-lg overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/60" />
        <div className="relative p-8 text-primary-foreground">
          <h1 className="text-4xl font-bold mb-2">Welcome to FreightMaster</h1>
          <p className="text-xl opacity-90">Your comprehensive logistics management solution</p>
          <div className="mt-4 flex space-x-4">
            <Button variant="secondary" size="lg">
              Create Shipment
            </Button>
            <Button variant="outline" size="lg" className="text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
              View Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 text-status-${stat.color === 'status-pending' ? 'pending' : stat.color === 'status-in-transit' ? 'in-transit' : stat.color === 'status-delayed' ? 'delayed' : 'completed'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendingUp className={`h-3 w-3 mr-1 ${stat.changeType === 'increase' ? 'text-success' : 'text-destructive'}`} />
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates from your logistics operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center text-muted-foreground">No recent activities</div>
              ) : recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{activity.type}</span>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : activity.status === 'in-transit' ? 'secondary' : 'outline'}
                        className={
                          activity.status === 'completed' ? 'bg-success text-success-foreground' :
                          activity.status === 'in-transit' ? 'bg-status-in-transit text-primary-foreground' :
                          'bg-status-pending text-warning-foreground'
                        }
                      >
                        {activity.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Create Goods Receipt
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Truck className="h-4 w-4 mr-2" />
              New Shipment Manifest
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Check Left Goods
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Key metrics for this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Delivery Success Rate</span>
                <span className="text-sm text-muted-foreground">{loading ? '-' : (performance.delivery_success_rate ?? '-')}%</span>
              </div>
              <Progress value={performance.delivery_success_rate || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Vehicle Utilization</span>
                <span className="text-sm text-muted-foreground">{loading ? '-' : (performance.vehicle_utilization ?? '-')}%</span>
              </div>
              <Progress value={performance.vehicle_utilization || 0} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Customer Satisfaction</span>
                <span className="text-sm text-muted-foreground">{loading ? '-' : (performance.customer_satisfaction ?? '-')}%</span>
              </div>
              <Progress value={performance.customer_satisfaction || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}