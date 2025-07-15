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

const mockLeftGoods = [
  {
    id: "LG-2024-001",
    goodsReceiptId: "GR-2024-001",
    manifestId: "SM-2024-001",
    customer: "Acme Corporation",
    itemsExpected: "Electronics, Documents, Accessories",
    itemsLeft: "Accessories (2 boxes)",
    reason: "Damaged packaging during loading",
    status: "pending",
    reportedDate: "2024-01-15",
    reportedBy: "Warehouse Staff",
    estimatedValue: "₹15,000"
  },
  {
    id: "LG-2024-002", 
    goodsReceiptId: "GR-2024-003",
    manifestId: "SM-2024-002",
    customer: "Global Traders",
    itemsExpected: "Textiles, Garments, Fabrics",
    itemsLeft: "Fabrics (1 roll)",
    reason: "Vehicle capacity exceeded",
    status: "resolved",
    reportedDate: "2024-01-14",
    reportedBy: "Loading Team",
    estimatedValue: "₹8,500"
  },
  {
    id: "LG-2024-003",
    goodsReceiptId: "GR-2024-005",
    manifestId: "SM-2024-003",
    customer: "Tech Solutions Ltd",
    itemsExpected: "Computer Parts, Cables",
    itemsLeft: "Cables (3 boxes)",
    reason: "Items not ready for shipment",
    status: "investigating",
    reportedDate: "2024-01-13",
    reportedBy: "Quality Check",
    estimatedValue: "₹12,000"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-status-pending text-warning-foreground">Pending</Badge>;
    case "investigating":
      return <Badge className="bg-status-delayed text-destructive-foreground">Investigating</Badge>;
    case "resolved":
      return <Badge className="bg-status-completed text-success-foreground">Resolved</Badge>;
    case "cancelled":
      return <Badge variant="outline">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function LeftGoodsLog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredLeftGoods = mockLeftGoods.filter(item =>
    item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.goodsReceiptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemsLeft.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Resolution</CardTitle>
            <Clock className="h-4 w-4 text-status-pending" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <Package className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">Successfully handled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2.1L</div>
            <p className="text-xs text-muted-foreground">Items value affected</p>
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
              {filteredLeftGoods.map((item) => (
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
                        <DropdownMenuItem>
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
        </CardContent>
      </Card>
    </div>
  );
}