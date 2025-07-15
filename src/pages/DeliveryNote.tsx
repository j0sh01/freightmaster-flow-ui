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

const mockDeliveryNotes = [
  {
    id: "DN-2024-001",
    goodsReceiptId: "GR-2024-001",
    customer: "Acme Corporation",
    deliveredTo: "Mr. Rajesh Gupta",
    deliveryAddress: "Plot 45, Sector 12, Mumbai, Maharashtra - 400001",
    deliveredDate: "2024-01-17",
    deliveredBy: "Rahul Kumar",
    status: "delivered",
    totalAmount: "₹45,000",
    invoiceGenerated: true,
    paymentStatus: "pending"
  },
  {
    id: "DN-2024-002", 
    goodsReceiptId: "GR-2024-002",
    customer: "Tech Solutions Ltd",
    deliveredTo: "Ms. Priya Sharma",
    deliveryAddress: "Building B-12, IT Park, Delhi, NCR - 110001",
    deliveredDate: "2024-01-16",
    deliveredBy: "Suresh Patel",
    status: "delivered",
    totalAmount: "₹32,500",
    invoiceGenerated: true,
    paymentStatus: "paid"
  },
  {
    id: "DN-2024-003",
    goodsReceiptId: "GR-2024-003",
    customer: "Global Traders",
    deliveredTo: "Mr. Amit Patel",
    deliveryAddress: "Shop 25, Commercial Complex, Bangalore, Karnataka - 560001",
    deliveredDate: null,
    deliveredBy: "Amit Sharma",
    status: "in-transit",
    totalAmount: "₹67,800",
    invoiceGenerated: false,
    paymentStatus: "not-applicable"
  }
];

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

export default function DeliveryNote() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredNotes = mockDeliveryNotes.filter(note =>
    note.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.deliveredTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deliveries</CardTitle>
            <FileText className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">198</div>
            <p className="text-xs text-muted-foreground">84% conversion</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹12.4L</div>
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
              {filteredNotes.map((note) => (
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
                        <DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  );
}