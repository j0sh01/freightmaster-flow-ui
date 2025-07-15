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
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  CreditCard,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockCustomers = [
  {
    id: "CUST-001",
    name: "Acme Corporation",
    contactPerson: "Mr. Rajesh Gupta",
    email: "rajesh@acmecorp.com",
    phone: "+91 98765 43210",
    address: "Plot 45, Sector 12, Mumbai, Maharashtra - 400001",
    totalShipments: 45,
    totalRevenue: "₹4,25,000",
    status: "active",
    lastOrderDate: "2024-01-15",
    paymentStatus: "good"
  },
  {
    id: "CUST-002", 
    name: "Tech Solutions Ltd",
    contactPerson: "Ms. Priya Sharma",
    email: "priya@techsolutions.com",
    phone: "+91 87654 32109",
    address: "Building B-12, IT Park, Delhi, NCR - 110001",
    totalShipments: 32,
    totalRevenue: "₹2,85,000",
    status: "active",
    lastOrderDate: "2024-01-14",
    paymentStatus: "good"
  },
  {
    id: "CUST-003",
    name: "Global Traders",
    contactPerson: "Mr. Amit Patel",
    email: "amit@globaltraders.com",
    phone: "+91 76543 21098",
    address: "Shop 25, Commercial Complex, Bangalore, Karnataka - 560001",
    totalShipments: 67,
    totalRevenue: "₹6,78,000",
    status: "active",
    lastOrderDate: "2024-01-13",
    paymentStatus: "delayed"
  },
  {
    id: "CUST-004",
    name: "Metro Distributors",
    contactPerson: "Ms. Sneha Reddy",
    email: "sneha@metrodist.com",
    phone: "+91 65432 10987",
    address: "Unit 8, Industrial Area, Hyderabad, Telangana - 500001",
    totalShipments: 23,
    totalRevenue: "₹1,89,000",
    status: "inactive",
    lastOrderDate: "2024-01-05",
    paymentStatus: "overdue"
  }
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-status-completed text-success-foreground">Active</Badge>;
    case "inactive":
      return <Badge variant="outline">Inactive</Badge>;
    case "suspended":
      return <Badge className="bg-status-delayed text-destructive-foreground">Suspended</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "good":
      return <Badge className="bg-status-completed text-success-foreground">Good</Badge>;
    case "delayed":
      return <Badge className="bg-status-pending text-warning-foreground">Delayed</Badge>;
    case "overdue":
      return <Badge className="bg-status-delayed text-destructive-foreground">Overdue</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground">Manage customer relationships and track business metrics</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Enter customer details for future shipments and billing.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Enter company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input id="contactPerson" placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" placeholder="Job title" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@company.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Complete business address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input id="gstNumber" placeholder="GST registration number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input id="panNumber" placeholder="PAN card number" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit (₹)</Label>
                  <Input id="creditLimit" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Days)</Label>
                  <Input id="paymentTerms" type="number" placeholder="30" />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                Add Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Package className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">134</div>
            <p className="text-xs text-muted-foreground">86% active rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45.6L</div>
            <p className="text-xs text-muted-foreground">This fiscal year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2.3L</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Directory</CardTitle>
          <CardDescription>Manage customer information and track business relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
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
                <TableHead>Customer ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Details</TableHead>
                <TableHead>Shipments</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {customer.address.split(',')[1]?.trim()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.contactPerson}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                        {customer.phone}
                      </div>
                      <div className="text-sm flex items-center">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {customer.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{customer.totalShipments}</TableCell>
                  <TableCell>{customer.totalRevenue}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(customer.paymentStatus)}</TableCell>
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
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Package className="h-4 w-4 mr-2" />
                          View Shipments
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payment History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Edit Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Suspend Account
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