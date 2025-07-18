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
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  Truck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchGoodsReceipts } from "@/api/frappe";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Available for Shipment":
    case "received":
      return <Badge className="bg-status-pending text-warning-foreground">Received</Badge>;
    case "manifested":
      return <Badge className="bg-status-in-transit text-primary-foreground">Manifested</Badge>;
    case "Shipped":
    case "shipped":
      return <Badge className="bg-status-completed text-success-foreground">Shipped</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function GoodsReceipt() {
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchGoodsReceipts();
        setGoodsReceipts(result.data);
        setTotal(result.total);
      } catch (err: any) {
        setError(err.message || "Error fetching goods receipts");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Map Frappe data to UI fields
  const mappedReceipts = goodsReceipts.map((doc) => ({
    id: doc.name,
    customer: doc.customer,
    items: Array.isArray(doc.goods_details) ? doc.goods_details.map((g: any) => g.item_name).join(", ") : "-",
    destination: doc.destination,
    deliveryPerson: doc.delivery_person,
    status: doc.status,
    date: doc.received_date,
    totalQuantity: doc.goods_details && Array.isArray(doc.goods_details)
      ? doc.goods_details.reduce((sum: number, g: any) => sum + (g.quantity || 0), 0)
      : 0
  }));

  const filteredReceipts = mappedReceipts.filter(receipt =>
    receipt.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.destination?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalReceipts = mappedReceipts.length;
  const pendingManifests = mappedReceipts.filter(r => r.status === "Available for Shipment" || r.status === "received").length;
  const totalQuantity = mappedReceipts.reduce((sum, r) => sum + (r.totalQuantity || 0), 0);
  const processingRate = totalReceipts > 0 ? Math.round((totalReceipts - pendingManifests) / totalReceipts * 100) : 0;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedReceipts = mappedReceipts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goods Receipt</h1>
          <p className="text-muted-foreground">Manage incoming goods and create shipment manifests</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Goods Receipt</DialogTitle>
              <DialogDescription>
                Enter details for the incoming goods shipment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Input id="customer" placeholder="Enter customer name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryPerson">Delivery Person</Label>
                  <Input id="deliveryPerson" placeholder="Enter delivery person name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" placeholder="Enter destination address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalWeight">Total Weight (kg)</Label>
                  <Input id="totalWeight" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packages">Number of Packages</Label>
                  <Input id="packages" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="items">Items Description</Label>
                <Textarea id="items" placeholder="Describe the items being received..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Any additional notes..." />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Receipt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receipts</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalReceipts}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Manifests</CardTitle>
            <FileText className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : pendingManifests}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : totalQuantity}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
            <Package className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : `${processingRate}%`}</div>
            <p className="text-xs text-muted-foreground">Average efficiency</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Goods Receipts</CardTitle>
          <CardDescription>View and manage all goods receipts</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="text-red-600 mb-2">{error}</div>}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts..."
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

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Delivery Person</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.id}</TableCell>
                      <TableCell>{receipt.customer}</TableCell>
                      <TableCell>{receipt.items}</TableCell>
                      <TableCell>{receipt.destination}</TableCell>
                      <TableCell>{receipt.deliveryPerson}</TableCell>
                      <TableCell>{receipt.totalQuantity}</TableCell>
                      <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                      <TableCell>{receipt.date}</TableCell>
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
                                // Find the full receipt object from goodsReceipts (not mappedReceipts)
                                const fullReceipt = goodsReceipts.find(r => r.name === receipt.id);
                                setSelectedReceipt(fullReceipt);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Create Manifest
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Truck className="h-4 w-4 mr-2" />
                              Create Delivery Note
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete Receipt
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
                    <DialogTitle>Goods Receipt Details</DialogTitle>
                    <DialogDescription>All details for this goods receipt</DialogDescription>
                  </DialogHeader>
                  {selectedReceipt && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div><b>Receipt ID:</b> {selectedReceipt.name}</div>
                        <div><b>Customer:</b> {selectedReceipt.customer}</div>
                        <div><b>Destination:</b> {selectedReceipt.destination}</div>
                        <div><b>Delivery Person:</b> {selectedReceipt.delivery_person}</div>
                        <div><b>Status:</b> {selectedReceipt.status}</div>
                        <div><b>Date:</b> {selectedReceipt.received_date}</div>
                      </div>
                      <div>
                        <b>Goods Details:</b>
                        <Table className="mt-2">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item Name</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>UOM</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(selectedReceipt.goods_details || []).map((d: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell>{d.item_name}</TableCell>
                                <TableCell>{d.quantity}</TableCell>
                                <TableCell>{d.uom}</TableCell>
                                <TableCell>{d.description ?? '-'}</TableCell>
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
        </CardContent>
      </Card>
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
          disabled={page === totalPages || goodsReceipts.length < pageSize}
          onClick={() => setPage(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}