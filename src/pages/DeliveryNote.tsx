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
  Receipt, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  FileText,
  CreditCard,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchDeliveryNotes } from "@/api/frappe";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "created":
      return <Badge variant="outline">Created</Badge>;
    case "in-transit":
      return <Badge className="bg-status-in-transit text-primary-foreground">In Transit</Badge>;
    case "delivered":
      return <Badge className="bg-status-completed text-success-foreground">Delivered</Badge>;
    case "failed":
      return <Badge className="bg-status-delayed text-destructive-foreground">Failed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-status-pending text-warning-foreground">Pending</Badge>;
    case "paid":
      return <Badge className="bg-status-completed text-success-foreground">Paid</Badge>;
    case "overdue":
      return <Badge className="bg-status-delayed text-destructive-foreground">Overdue</Badge>;
    case "not-applicable":
      return <Badge variant="outline">N/A</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

function formatTZS(amount: number | undefined) {
  if (typeof amount !== "number") return "-";
  return amount.toLocaleString("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 });
}

const PAGE_SIZE = 20;

export default function DeliveryNote() {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  // Add state for details dialog
  const [selectedNote, setSelectedNote] = useState<any | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchDeliveryNotes(searchTerm);
        setNotes(result.data);
        setMetrics(result.metrics || {});
      } catch (err: any) {
        setError(err.message || "Error fetching delivery notes");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchTerm]);

  const filteredNotes = notes.map(note => ({
    id: note.name,
    customer: note.customer_name || note.customer,
    deliveredTo: note.customer_name || "-",
    deliveredDate: note.posting_date,
    totalAmount: note.grand_total,
    status: note.status,
    paymentStatus: note.per_billed >= 100 ? "paid" : (note.per_billed > 0 ? "pending" : "not-applicable"),
    invoiceGenerated: note.per_billed > 0
  }));

  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / PAGE_SIZE));
  const paginatedNotes = filteredNotes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Delivery Note</h1>
          <p className="text-muted-foreground">Manage deliveries and generate sales invoices</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Create Delivery Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Delivery Note</DialogTitle>
              <DialogDescription>
                Record delivery details and recipient information.
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
                  <Label htmlFor="deliveredBy">Delivered By</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select delivery person" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rahul-kumar">Rahul Kumar</SelectItem>
                      <SelectItem value="suresh-patel">Suresh Patel</SelectItem>
                      <SelectItem value="amit-sharma">Amit Sharma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveredTo">Delivered To</Label>
                <Input id="deliveredTo" placeholder="Recipient name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Input id="deliveryAddress" placeholder="Complete delivery address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input id="deliveryDate" type="datetime-local" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                  <Input id="totalAmount" type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientContact">Recipient Contact</Label>
                <Input id="recipientContact" placeholder="Phone number or email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryNotes">Delivery Notes</Label>
                <Input id="deliveryNotes" placeholder="Any special delivery instructions or notes" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Create Delivery Note
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_delivery_notes ?? "-"}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <FileText className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending_deliveries ?? "-"}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.invoices_generated ?? "-"}</div>
            <p className="text-xs text-muted-foreground">{metrics.total_delivery_notes ? Math.round((metrics.invoices_generated / metrics.total_delivery_notes) * 100) : 0}% conversion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTZS(metrics.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Notes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Notes</CardTitle>
          <CardDescription>Track deliveries and manage invoice generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search delivery notes..."
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
                <TableHead>Note ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivered To</TableHead>
                <TableHead>Delivery Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell className="font-medium">{note.id}</TableCell>
                  <TableCell>{note.customer}</TableCell>
                  <TableCell>{note.deliveredTo}</TableCell>
                  <TableCell>{note.deliveredDate || "-"}</TableCell>
                  <TableCell>{note.totalAmount}</TableCell>
                  <TableCell>{getStatusBadge(note.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(note.paymentStatus)}</TableCell>
                  <TableCell>
                    {note.invoiceGenerated ? (
                      <Badge className="bg-success text-success-foreground">Generated</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
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
                            // Find the full note object
                            const fullNote = notes.find(n => n.name === note.id) || {};
                            setSelectedNote(fullNote);
                            setIsDetailsDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="h-4 w-4 mr-2" />
                          Print Delivery Note
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={note.invoiceGenerated}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Cancel Delivery
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
              disabled={page === totalPages || paginatedNotes.length < PAGE_SIZE}
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
            <DialogTitle>Delivery Note Details</DialogTitle>
            <DialogDescription>All details for this delivery note</DialogDescription>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><b>Note ID:</b> {selectedNote.name}</div>
                <div><b>Customer:</b> {selectedNote.customer_name || selectedNote.customer}</div>
                <div><b>Delivered To:</b> {selectedNote.customer_name || '-'}</div>
                <div><b>Delivery Date:</b> {selectedNote.posting_date || '-'}</div>
                <div><b>Amount:</b> {formatTZS(selectedNote.grand_total)}</div>
                <div><b>Status:</b> {selectedNote.status}</div>
                <div><b>Payment Status:</b> {selectedNote.per_billed >= 100 ? 'Paid' : (selectedNote.per_billed > 0 ? 'Pending' : 'Not Applicable')}</div>
                <div><b>Invoice Generated:</b> {selectedNote.per_billed > 0 ? 'Yes' : 'No'}</div>
              </div>
              {/* If there are child tables, render them here. Example: delivery_note_items */}
              {selectedNote.items && Array.isArray(selectedNote.items) && (
                <div>
                  <b>Items:</b>
                  <Table className="mt-2">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Code</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>UOM</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedNote.items.map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{item.item_code}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.qty}</TableCell>
                          <TableCell>{item.uom}</TableCell>
                          <TableCell>{formatTZS(item.rate)}</TableCell>
                          <TableCell>{formatTZS(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}