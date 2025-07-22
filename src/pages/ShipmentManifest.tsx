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
import { fetchShipmentManifests, assignVehicleToManifest, fetchVehicles } from "@/api/frappe";

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
  const [manifests, setManifests] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ agent: "", vehicle: "", destination: "" });
  const [selectedManifest, setSelectedManifest] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  // Add state for assign vehicle dialog
  const [assignVehicleDialogOpen, setAssignVehicleDialogOpen] = useState(false);
  const [assigningManifestId, setAssigningManifestId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [manifestResult, vehicleResult] = await Promise.all([
          fetchShipmentManifests(searchTerm, filters),
          fetchVehicles()
        ]);
        setManifests(manifestResult.data);
        setTotal(manifestResult.total);
        setVehicles(vehicleResult);
      } catch (err: any) {
        setError(err.message || "Error fetching shipment manifests");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm, filters]);

  // Map backend data to UI fields
  const mappedManifests = manifests.map((doc) => ({
    id: doc.name,
    vehicle: doc.vehicle,
    agent: doc.agent,
    destination: doc.destination,
    goodsReceipts: doc.reference_goods_receipt ? [doc.reference_goods_receipt] : [],
    items: Array.isArray(doc.manifest_details) ? doc.manifest_details.map((d: any) => d.item_name).join(", ") : "-",
    status: doc.status || "submitted",
    shipmentDate: doc.shipment_date,
    totalShippingCharges: doc.total_shipping_charges,
    docstatus: doc.docstatus, // <-- add this
  }));

  const filteredManifests = mappedManifests.filter(manifest =>
    manifest.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifest.vehicle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifest.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manifest.goodsReceipts.some((gr: string) =>
      gr?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedManifests = filteredManifests.slice((page - 1) * pageSize, page * pageSize);

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
                  <Select value={""} onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.name} value={vehicle.vehicle_id}>
                          {vehicle.vehicle_id} - {vehicle.driver || "No driver"} ({vehicle.vehicle_type || "Type"}, {vehicle.capacity || "?"})
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
                        checked={false} // No longer used
                        onChange={(e) => {}} // No longer used
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
          {error && <div className="text-red-600 mb-2">{error}</div>}
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
            <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
              <DialogTrigger asChild>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Filter Manifests</DialogTitle>
                  <DialogDescription>Select filter criteria and apply.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1">Agent</label>
                    <Input
                      value={filters.agent}
                      onChange={e => setFilters(f => ({ ...f, agent: e.target.value }))}
                      placeholder="Enter agent name"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Vehicle</label>
                    <Input
                      value={filters.vehicle}
                      onChange={e => setFilters(f => ({ ...f, vehicle: e.target.value }))}
                      placeholder="Enter vehicle"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Destination</label>
                    <Input
                      value={filters.destination}
                      onChange={e => setFilters(f => ({ ...f, destination: e.target.value }))}
                      placeholder="Enter destination"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setFilters({ agent: "", vehicle: "", destination: "" })}>Clear</Button>
                    <Button onClick={() => setFilterDialogOpen(false)}>Apply</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Manifest ID</TableHead>
                <TableHead>Vehicle</TableHead>
                    <TableHead>Agent</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Goods Receipts</TableHead>
                    <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                    <TableHead>Shipment Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                  {paginatedManifests.map((manifest) => (
                <TableRow key={manifest.id}>
                  <TableCell className="font-medium">{manifest.id}</TableCell>
                      <TableCell>{manifest.vehicle}</TableCell>
                      <TableCell>{manifest.agent}</TableCell>
                  <TableCell>{manifest.destination}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                          {manifest.goodsReceipts.map((gr: string) => (
                        <Badge key={gr} variant="secondary" className="text-xs">
                          {gr}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                      <TableCell>{manifest.items}</TableCell>
                  <TableCell>{getStatusBadge(manifest.status)}</TableCell>
                      <TableCell>{manifest.shipmentDate}</TableCell>
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
                                // Find the full manifest object from manifests (not mappedManifests)
                                const fullManifest = manifests.find(m => m.name === manifest.id);
                                setSelectedManifest(fullManifest);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
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
                        <DropdownMenuItem
                          onClick={() => {
                            setAssigningManifestId(manifest.id);
                            setAssignVehicleDialogOpen(true);
                          }}
                          disabled={manifest.docstatus !== 0}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Assign Vehicle
                        </DropdownMenuItem>
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
              {/* Details Dialog */}
              <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Shipment Manifest Details</DialogTitle>
                    <DialogDescription>All details for this shipment manifest</DialogDescription>
                  </DialogHeader>
                  {selectedManifest && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><b>Manifest ID:</b> {selectedManifest.name}</div>
                        <div><b>Vehicle:</b> {selectedManifest.vehicle}</div>
                        <div><b>Agent:</b> {selectedManifest.agent}</div>
                        <div><b>Destination:</b> {selectedManifest.destination}</div>
                        <div><b>Shipment Date:</b> {selectedManifest.shipment_date}</div>
                        <div><b>Status:</b> {selectedManifest.status}</div>
                        <div className="col-span-2"><b>Goods Receipts:</b> {(selectedManifest.reference_goods_receipt || "-")}</div>
                        <div className="col-span-2"><b>Total Shipping Charges:</b> {selectedManifest.total_shipping_charges}</div>
                      </div>
                      <div>
                        <b>Manifest Details:</b>
                        <Table className="mt-2">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>UOM</TableHead>
                              <TableHead>Destination</TableHead>
                              <TableHead>Shipping Charges</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(selectedManifest.manifest_details || []).map((d: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell>{d.item_name}</TableCell>
                                <TableCell>{d.quantity}</TableCell>
                                <TableCell>{d.uom}</TableCell>
                                <TableCell>{d.destination}</TableCell>
                                <TableCell>{d.shipping_charges}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
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
              disabled={page === totalPages || paginatedManifests.length < pageSize}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Assign Vehicle Dialog */}
      <Dialog open={assignVehicleDialogOpen} onOpenChange={setAssignVehicleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Vehicle</DialogTitle>
            <DialogDescription>Select a vehicle to assign to this manifest.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger>
                <SelectValue placeholder="Choose vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.name} value={vehicle.name}>
                    {vehicle.name} - {vehicle.model || "No model"} ({vehicle.make || "No make"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setAssignVehicleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!assigningManifestId || !selectedVehicle) return;
                setAssignLoading(true);
                try {
                  await assignVehicleToManifest(assigningManifestId, selectedVehicle);
                  setAssignVehicleDialogOpen(false);
                  setSelectedVehicle("");
                  setAssigningManifestId(null);
                  // Reload list
                  const result = await fetchShipmentManifests(searchTerm, filters);
                  setManifests(result.data);
                  setTotal(result.total);
                } catch (err: any) {
                  alert(err.message);
                } finally {
                  setAssignLoading(false);
                }
              }}
              disabled={!selectedVehicle || assignLoading}
            >
              {assignLoading ? "Assigning..." : "Assign Vehicle"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}