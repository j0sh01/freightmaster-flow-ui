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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  TrendingDown,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchLeftGoodsLogs } from "@/api/frappe";

const getStatusBadge = (status: string) => {
  switch (status?.toLowerCase()) {
    case "manifest left":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Manifest Left</Badge>;
    case "shipped":
      return <Badge className="bg-green-100 text-green-800 border-green-300">Shipped</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    case "investigating":
      return <Badge className="bg-red-100 text-red-800 border-red-300">Investigating</Badge>;
    case "resolved":
      return <Badge className="bg-green-100 text-green-800 border-green-300">Resolved</Badge>;
    case "cancelled":
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function formatTZS(amount: number | undefined) {
  if (typeof amount !== "number") return "-";
  return amount.toLocaleString("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
}

const PAGE_SIZE = 20;

export default function LeftGoodsLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    setPage(1); // Reset to first page on new search
  }, [searchTerm]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchLeftGoodsLogs(searchTerm);
        setLogs(result.data);
        setMetrics(result.metrics || {});
      } catch (err: any) {
        setError(err.message || "Error fetching left goods logs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm]);

  const filteredLeftGoods = logs.map(log => ({
    id: log.name,
    customer: log.customer,
    goodsReceiptId: log.goods_receipt,
    manifestId: log.shipment_manifest,
    itemsLeft: log.left_goods_details?.map(d => `${d.item_name} (${d.quantity_left} ${d.uom})`).join(", ") || "-",
    reason: log.remarks || "-",
    status: log.status,
    reportedDate: log.log_date,
    estimatedValue: log.left_goods_details?.reduce((sum, d) => sum + (d.estimated_value || 0), 0) || "-"
  }));

  const totalPages = Math.max(1, Math.ceil(filteredLeftGoods.length / PAGE_SIZE));
  const paginatedLeftGoods = filteredLeftGoods.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Left Goods Log</h1>
          <p className="text-muted-foreground">Track discrepancies and unshipped items</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Report Left Goods
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Report Left Goods</DialogTitle>
              <DialogDescription>
                Record items that were not shipped as planned.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goodsReceipt">Goods Receipt ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goods receipt" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GR-2024-001">GR-2024-001 - Acme Corp</SelectItem>
                      <SelectItem value="GR-2024-002">GR-2024-002 - Tech Solutions</SelectItem>
                      <SelectItem value="GR-2024-003">GR-2024-003 - Global Traders</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manifest">Manifest ID</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select manifest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SM-2024-001">SM-2024-001</SelectItem>
                      <SelectItem value="SM-2024-002">SM-2024-002</SelectItem>
                      <SelectItem value="SM-2024-003">SM-2024-003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemsExpected">Items Expected</Label>
                <Textarea id="itemsExpected" placeholder="List all items that were supposed to be shipped..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="itemsLeft">Items Left Behind</Label>
                <Textarea id="itemsLeft" placeholder="Specify which items were not shipped and quantities..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damaged">Damaged packaging</SelectItem>
                    <SelectItem value="capacity">Vehicle capacity exceeded</SelectItem>
                    <SelectItem value="not-ready">Items not ready for shipment</SelectItem>
                    <SelectItem value="quality-issue">Quality check failed</SelectItem>
                    <SelectItem value="documentation">Documentation incomplete</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedValue">Estimated Value (₹)</Label>
                  <Input id="estimatedValue" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportedBy">Reported By</Label>
                  <Input id="reportedBy" placeholder="Staff name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea id="notes" placeholder="Any additional details..." />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Report Left Goods
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Left Goods</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_logs ?? "-"}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manifest Left</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending_logs ?? "-"}</div>
            <p className="text-xs text-muted-foreground">Status: Manifest Left</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
            <Package className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completed_logs ?? "-"}</div>
            <p className="text-xs text-muted-foreground">Status: Shipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity Left</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_quantity_left ?? "-"}</div>
            <p className="text-xs text-muted-foreground">Items not shipped</p>
          </CardContent>
        </Card>
      </div>

      {/* Left Goods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Left Goods Log</CardTitle>
          <CardDescription>Monitor and resolve shipping discrepancies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search left goods..."
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
                <TableHead>Customer</TableHead>
                <TableHead>Goods Receipt</TableHead>
                <TableHead>Items Left</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reported Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeftGoods.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.customer}</TableCell>
                  <TableCell>{item.goodsReceiptId}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.itemsLeft}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{item.estimatedValue}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.reportedDate}</TableCell>
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
                            // Find the full log object from logs (not filteredLeftGoods)
                            const fullLog = logs.find(l => l.name === item.id);
                            setSelectedLog(fullLog);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Mark Resolved
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Archive Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
              disabled={page === totalPages || paginatedLeftGoods.length < PAGE_SIZE}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Left Goods Log Details</DialogTitle>
            <DialogDescription>All details for this log entry</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><b>Log ID:</b> {selectedLog.name}</div>
                <div><b>Customer:</b> {selectedLog.customer}</div>
                <div><b>Goods Receipt:</b> {selectedLog.goods_receipt}</div>
                <div><b>Shipment Manifest:</b> {selectedLog.shipment_manifest}</div>
                <div><b>Reference Manifest:</b> {selectedLog.reference_shipment_manifest}</div>
                <div><b>Log Date:</b> {selectedLog.log_date}</div>
                <div><b>Destination:</b> {selectedLog.destination}</div>
                <div><b>Status:</b> {selectedLog.status}</div>
                <div className="col-span-2"><b>Remarks:</b> {selectedLog.remarks || '-'}</div>
              </div>
              <div>
                <b>Left Goods Details:</b>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Qty Submitted</TableHead>
                      <TableHead>Qty Shipped</TableHead>
                      <TableHead>Qty Left</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selectedLog.left_goods_details || []).map((d: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{d.item_name}</TableCell>
                        <TableCell>{d.quantity_submitted}</TableCell>
                        <TableCell>{d.quantity_shipped}</TableCell>
                        <TableCell>{d.quantity_left}</TableCell>
                        <TableCell>{d.uom}</TableCell>
                        <TableCell>{d.remarks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}