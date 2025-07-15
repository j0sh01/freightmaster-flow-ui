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
  FileText, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Truck,
  MapPin,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockShipmentManifests = [
  {
    id: "SM-2024-001",
    vehicleNumber: "TN-45-AB-1234",
    driver: "Rajesh Kumar",
    destination: "Mumbai, Maharashtra",
    goodsReceipts: ["GR-2024-001", "GR-2024-003"],
    status: "submitted",
    createdDate: "2024-01-15",
    estimatedDelivery: "2024-01-17",
    totalWeight: "379 kg",
    totalPackages: 15
  },
  {
    id: "SM-2024-002", 
    vehicleNumber: "KA-12-CD-5678",
    driver: "Suresh Patel",
    destination: "Delhi, NCR",
    goodsReceipts: ["GR-2024-002"],
    status: "in-transit",
    createdDate: "2024-01-14",
    estimatedDelivery: "2024-01-16",
    totalWeight: "89 kg",
    totalPackages: 8
  },
  {
    id: "SM-2024-003",
    vehicleNumber: "MH-02-EF-9012",
    driver: "Amit Sharma",
    destination: "Bangalore, Karnataka",
    goodsReceipts: ["GR-2024-004", "GR-2024-005"],
    status: "completed",
    createdDate: "2024-01-13",
    estimatedDelivery: "2024-01-15",
    totalWeight: "567 kg",
    totalPackages: 23
  }
];

const mockVehicles = [
  { number: "TN-45-AB-1234", driver: "Rajesh Kumar", type: "Truck", capacity: "5 Ton" },
  { number: "KA-12-CD-5678", driver: "Suresh Patel", type: "Van", capacity: "2 Ton" },
  { number: "MH-02-EF-9012", driver: "Amit Sharma", type: "Truck", capacity: "10 Ton" },
];

const mockGoodsReceipts = [
  { id: "GR-2024-001", customer: "Acme Corp", weight: "145 kg", packages: 7 },
  { id: "GR-2024-002", customer: "Tech Solutions", weight: "89 kg", packages: 8 },
  { id: "GR-2024-003", customer: "Global Traders", weight: "234 kg", packages: 8 },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    case "submitted":
      return <Badge className="bg-status-pending text-warning-foreground">Submitted</Badge>;
    case "in-transit":
      return <Badge className="bg-status-in-transit text-primary-foreground">In Transit</Badge>;
    case "completed":
      return <Badge className="bg-status-completed text-success-foreground">Completed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function ShipmentManifest() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [selectedGoods, setSelectedGoods] = useState<string[]>([]);

  const filteredManifests = mockShipmentManifests.filter(manifest =>
    manifest.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifest.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifest.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipment Manifest</h1>
          <p className="text-muted-foreground">Manage vehicle assignments and shipment tracking</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Manifest
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Create Shipment Manifest</DialogTitle>
              <DialogDescription>
                Assign vehicle and select goods for shipment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Select Vehicle</Label>
                  <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.number} value={vehicle.number}>
                          {vehicle.number} - {vehicle.driver} ({vehicle.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Input id="destination" placeholder="Enter destination" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select Goods Receipts</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                  {mockGoodsReceipts.map((receipt) => (
                    <div key={receipt.id} className="flex items-center space-x-2 py-2">
                      <input
                        type="checkbox"
                        id={receipt.id}
                        checked={selectedGoods.includes(receipt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedGoods([...selectedGoods, receipt.id]);
                          } else {
                            setSelectedGoods(selectedGoods.filter(id => id !== receipt.id));
                          }
                        }}
                        className="rounded"
                      />
                      <label htmlFor={receipt.id} className="flex-1 text-sm">
                        {receipt.id} - {receipt.customer} ({receipt.weight}, {receipt.packages} packages)
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input id="estimatedDelivery" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Manifest
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Manifests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-status-in-transit" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Currently shipping</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <MapPin className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3</div>
            <p className="text-xs text-muted-foreground">Days average</p>
          </CardContent>
        </Card>
      </div>

      {/* Manifests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Shipment Manifests</CardTitle>
          <CardDescription>Track all shipment manifests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search manifests..."
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
                <TableHead>Manifest ID</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Goods Receipts</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredManifests.map((manifest) => (
                <TableRow key={manifest.id}>
                  <TableCell className="font-medium">{manifest.id}</TableCell>
                  <TableCell>{manifest.vehicleNumber}</TableCell>
                  <TableCell>{manifest.driver}</TableCell>
                  <TableCell>{manifest.destination}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {manifest.goodsReceipts.map((gr) => (
                        <Badge key={gr} variant="secondary" className="text-xs">
                          {gr}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{manifest.totalWeight}</TableCell>
                  <TableCell>{getStatusBadge(manifest.status)}</TableCell>
                  <TableCell>{manifest.estimatedDelivery}</TableCell>
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
                          <Truck className="h-4 w-4 mr-2" />
                          View Vehicle Log
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Manifest
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Cancel Shipment
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