import { useState, useEffect } from "react";
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
  User,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchVehicleLogs } from "@/api/frappe";
import { printVehicleLog } from "@/api/frappe";
import { useToast } from "@/hooks/use-toast";

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

const PAGE_SIZE = 20;

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "awaiting":
      return <Badge className="bg-gray-200 text-gray-800 border-gray-300">Awaiting</Badge>;
    case "in transit":
    case "in-transit":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">In Transit</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
    case "delayed":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Delayed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function VehicleLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchVehicleLogs(searchTerm);
        setLogs(result.data);
      } catch (err: any) {
        setError(err.message || "Error fetching vehicle logs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm]);

  const filteredLogs = logs.map(log => ({
    id: log.name,
    vehicleNumber: log.vehicle_id,
    driver: log.driver_name || log.driver,
    manifestId: log.reference_shipment_manifest,
    route: log.destination || "-",
    logDate: log.log_date,
    status: log.status,
    fuelConsumed: log.fuel_consumed || "-",
    tollCharges: log.toll_charges || "-"
  }));

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const paginatedLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
                <TableHead>Log Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Shipment Manifests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => {
                // Find the full log object to get vehicle_log_details
                const fullLog = logs.find(l => l.name === log.id) || {};
                const manifests = (fullLog.vehicle_log_details || []).map((d: any) => d.reference_shipment_manifest).filter(Boolean);
                return (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.id}</TableCell>
                  <TableCell>{log.vehicleNumber}</TableCell>
                  <TableCell>{log.driver}</TableCell>
                  <TableCell>{log.route}</TableCell>
                    <TableCell>{log.logDate}</TableCell>
                  <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>
                      {/* Chunk manifests into groups of 3 for row wrapping */}
                      {(() => {
                        const chunkSize = 3;
                        const rows = [];
                        for (let i = 0; i < manifests.length; i += chunkSize) {
                          rows.push(manifests.slice(i, i + chunkSize));
                        }
                        return rows.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {rows.map((row, rowIdx) => (
                              <div key={rowIdx} className="flex flex-wrap gap-1">
                                {row.map((m: string, i: number) => (
                                  <Badge key={m} className={((rowIdx * chunkSize + i) % 2 === 0) ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-green-100 text-green-800 border-green-300"}>{m}</Badge>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        );
                      })()}
                    </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedLog(fullLog);
                              setIsDetailsDialogOpen(true);
                            }}
                          >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={printingId === log.id}
                            onClick={async () => {
                              setPrintingId(log.id);
                              toast({ title: "Printing", description: "Generating PDF, please wait..." });
                              try {
                                const blob = await printVehicleLog(log.id);
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = `${log.id}.pdf`;
                                document.body.appendChild(a);
                                a.click();
                                a.remove();
                                window.URL.revokeObjectURL(url);
                              } catch (err) {
                                toast({ title: "Print Failed", description: "Failed to print Vehicle Log", variant: "destructive" });
                              } finally {
                                setPrintingId(null);
                              }
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {printingId === log.id ? (
                              <span className="flex items-center gap-2">
                                <span>Printing...</span>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-current rounded-full"></span>
                              </span>
                            ) : (
                              <span>Print</span>
                            )}
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
                );
              })}
            </TableBody>
          </Table>
          {/* Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vehicle Log Details</DialogTitle>
                <DialogDescription>All details for this vehicle log</DialogDescription>
              </DialogHeader>
              {selectedLog && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><b>Log ID:</b> {selectedLog.name}</div>
                    <div><b>Vehicle:</b> {selectedLog.vehicle_id}</div>
                    <div><b>Driver:</b> {selectedLog.driver_name || selectedLog.driver}</div>
                    <div><b>Destination:</b> {selectedLog.destination || '-'}</div>
                    <div><b>Log Date:</b> {selectedLog.log_date}</div>
                    <div><b>Status:</b> {selectedLog.status}</div>
                    <div><b>Total Amount:</b> {selectedLog.total_amount ?? '-'}</div>
                  </div>
                  <div>
                    <b>Vehicle Log Details:</b>
                    <Table className="mt-2">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference Manifest</TableHead>
                          <TableHead>Shipping Date</TableHead>
                          <TableHead>Shipping Charges</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Destination</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(selectedLog.vehicle_log_details || []).map((d: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{d.reference_shipment_manifest}</TableCell>
                            <TableCell>{d.shipping_date}</TableCell>
                            <TableCell>{d.shipping_charges}</TableCell>
                            <TableCell>{d.customer}</TableCell>
                            <TableCell>{d.destination}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
          {/* Pagination Controls */}
          <div className="flex justify-end mt-4 space-x-2 items-center">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="px-3 py-2">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              disabled={page === totalPages || paginatedLogs.length < PAGE_SIZE}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}