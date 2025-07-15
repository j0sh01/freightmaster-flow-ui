import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Truck, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  MapPin,
  Clock,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockVehicleLogs = [
  {
    id: "VL-2024-001",
    vehicleNumber: "TN-45-AB-1234",
    driver: "Rajesh Kumar",
    manifestId: "SM-2024-001",
    route: "Chennai → Mumbai",
    startDate: "2024-01-15",
    endDate: "2024-01-17",
    status: "completed",
    totalDistance: "1,338 km",
    fuelConsumed: "187 L",
    tollCharges: "₹2,450"
  },
  {
    id: "VL-2024-002", 
    vehicleNumber: "KA-12-CD-5678",
    driver: "Suresh Patel",
    manifestId: "SM-2024-002",
    route: "Bangalore → Delhi",
    startDate: "2024-01-14",
    endDate: null,
    status: "in-transit",
    totalDistance: "2,144 km",
    fuelConsumed: "156 L",
    tollCharges: "₹3,200"
  },
  {
    id: "VL-2024-003",
    vehicleNumber: "MH-02-EF-9012",
    driver: "Amit Sharma",
    manifestId: "SM-2024-003",
    route: "Mumbai → Pune",
    startDate: "2024-01-13",
    endDate: "2024-01-13",
    status: "completed",
    totalDistance: "149 km",
    fuelConsumed: "28 L",
    tollCharges: "₹350"
  }
];

const mockVehicles = [
  { number: "TN-45-AB-1234", type: "Truck", capacity: "5 Ton" },
  { number: "KA-12-CD-5678", type: "Van", capacity: "2 Ton" },
  { number: "MH-02-EF-9012", type: "Truck", capacity: "10 Ton" },
  { number: "GJ-03-XY-4567", type: "Mini Truck", capacity: "1 Ton" },
];

const mockDrivers = [
  "Rajesh Kumar", "Suresh Patel", "Amit Sharma", "Priya Singh", "Ravi Verma"
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "awaiting":
      return <Badge variant="outline">Awaiting</Badge>;
    case "in-transit":
      return <Badge className="bg-status-in-transit text-primary-foreground">In Transit</Badge>;
    case "completed":
      return <Badge className="bg-status-completed text-success-foreground">Completed</Badge>;
    case "delayed":
      return <Badge className="bg-status-delayed text-destructive-foreground">Delayed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function VehicleLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredLogs = mockVehicleLogs.filter(log =>
    log.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.route.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vehicle Log</h1>
          <p className="text-muted-foreground">Track vehicle movements and driver assignments</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Vehicle Log
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Vehicle Log</DialogTitle>
              <DialogDescription>
                Record vehicle movement and assign driver.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle Number</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.number} value={vehicle.number}>
                          {vehicle.number} ({vehicle.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver">Driver</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDrivers.map((driver) => (
                        <SelectItem key={driver} value={driver}>
                          {driver}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Input id="route" placeholder="e.g., Mumbai → Delhi" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedEndDate">Estimated End Date</Label>
                  <Input id="estimatedEndDate" type="datetime-local" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input id="distance" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel (L)</Label>
                  <Input id="fuel" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="toll">Toll Charges (₹)</Label>
                  <Input id="toll" type="number" placeholder="0" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently on road</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <MapPin className="h-4 w-4 text-status-in-transit" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Moving shipments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Trips</CardTitle>
            <Clock className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Drivers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Ready for assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Logs</CardTitle>
          <CardDescription>Monitor all vehicle movements and trip details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicle logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.vehicleNumber}</TableCell>
                  <TableCell>{log.driver}</TableCell>
                  <TableCell>{log.route}</TableCell>
                  <TableCell>{log.startDate}</TableCell>
                  <TableCell>{log.endDate || "-"}</TableCell>
                  <TableCell>{log.totalDistance}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MapPin className="h-4 w-4 mr-2" />
                          Track Location
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Truck className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Cancel Trip
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}