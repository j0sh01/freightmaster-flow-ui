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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createGoodsReceipt, fetchCustomers, fetchGoodsReceipts, fetchEmployees, fetchDeliveryPersons, fetchDestinations, fetchUOMs, fetchItems, createShipmentManifestFromGoodsReceipt, createDeliveryNoteFromGoodsReceipt } from "@/api/frappe";

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
  const { toast } = useToast();

  // Form state for create dialog
  const [form, setForm] = useState({
    customer: "",
    customer_phone: "",
    delivery_note: "",
    delivery_person: "",
    received_date: "",
    branch_agent: "",
    branch_agent_name: "",
    destination: "",
    total_amount: 0,
    goods_details: [] as any[],
  });
  // Options for Link fields
  const [customerOptions, setCustomerOptions] = useState<any[]>([]);
  const [branchAgentOptions, setBranchAgentOptions] = useState<any[]>([]);
  const [deliveryPersonOptions, setDeliveryPersonOptions] = useState<any[]>([]);
  const [destinationOptions, setDestinationOptions] = useState<any[]>([]);
  const [uomOptions, setUomOptions] = useState<any[]>([]);
  const [itemOptions, setItemOptions] = useState<any[]>([]);

  // Add search state for destination and delivery person
  const [destinationSearch, setDestinationSearch] = useState("");
  const [deliveryPersonSearch, setDeliveryPersonSearch] = useState("");
  // Add search state for customer and branch agent
  const [customerSearch, setCustomerSearch] = useState("");
  const [branchAgentSearch, setBranchAgentSearch] = useState("");

  // On dialog open, fetch current user's full name and set as main_agent if not set
  useEffect(() => {
    if (!isCreateDialogOpen) return;
    fetchCustomers().then(res => setCustomerOptions(res.data));
    fetchEmployees().then(setBranchAgentOptions);
    fetchDeliveryPersons().then(setDeliveryPersonOptions);
    fetchDestinations().then(setDestinationOptions);
    fetchUOMs().then(setUomOptions);
    fetchItems().then(setItemOptions);
  }, [isCreateDialogOpen]);

  // Fetch customer phone and branch agent name on select
  useEffect(() => {
    if (form.customer && customerOptions.length) {
      const c = customerOptions.find(c => c.name === form.customer);
      setForm(f => ({ ...f, customer_phone: c?.mobile_no || "" }));
    }
    if (form.branch_agent && branchAgentOptions.length) {
      const b = branchAgentOptions.find(b => b.name === form.branch_agent);
      setForm(f => ({ ...f, branch_agent_name: b?.employee_name || "" }));
    }
  }, [form.customer, form.branch_agent, customerOptions, branchAgentOptions]);

  // Fetch goods receipts and stats on mount
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

  // Handler for form field changes
  const handleFormChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // Handler for goods details table
  const handleGoodsDetailChange = (idx: number, field: string, value: any) => {
    setForm(f => ({
      ...f,
      goods_details: f.goods_details.map((row, i) => {
        if (i !== idx) return row;
        let updated = { ...row, [field]: value };
        // Parse as float for currency fields
        const quantity = field === 'quantity' ? parseFloat(value) : parseFloat(row.quantity) || 0;
        const rate = field === 'rate' ? parseFloat(value) : parseFloat(row.rate) || 0;
        if (field === 'quantity' || field === 'rate') {
          updated.amount = quantity * rate;
        }
        return updated;
      })
    }));
  };
  // Remove 'destination' from child table row state and UI
  const addGoodsDetail = () => {
    setForm(f => ({ ...f, goods_details: [...f.goods_details, { item_name: "", quantity: 0, uom: "", rate: 0, amount: 0, description: "" }] }));
  };
  const removeGoodsDetail = (idx: number) => {
    setForm(f => ({ ...f, goods_details: f.goods_details.filter((_, i) => i !== idx) }));
  };

  // Submit handler
  const handleCreate = async () => {
    try {
      // Fetch current session user
      const userRes = await fetch('/api/method/frappe.auth.get_logged_user');
      const userData = await userRes.json();
      const main_agent = userData.message;
      const payload = { ...form, main_agent };
      const msg = await createGoodsReceipt(payload);
      let description = msg;
      if (typeof msg === 'object' && msg.message) {
        description = msg.message;
      }
      toast({ title: "Goods Receipt Created", description });
      setIsCreateDialogOpen(false);
      // Reload list after create
      const result = await fetchGoodsReceipts();
      setGoodsReceipts(result.data);
      setTotal(result.total);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

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
      : 0,
    shipment_manifest: doc.shipment_manifest,
    delivery_note: doc.delivery_note,
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
          <DialogContent className="w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Goods Receipt</DialogTitle>
              <DialogDescription>Enter details for the incoming goods shipment.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={form.customer} onValueChange={v => handleFormChange("customer", v)}>
                    <SelectTrigger id="customer">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <Input
                          placeholder="Search customer..."
                          value={customerSearch}
                          onChange={e => setCustomerSearch(e.target.value)}
                          className="mb-1"
                        />
                      </div>
                      {customerOptions.filter(c =>
                        c.customer_name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
                        c.name.toLowerCase().includes(customerSearch.toLowerCase())
                      ).map(c => (
                        <SelectItem key={c.name} value={c.name}>{c.customer_name || c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customer_phone">Customer Phone</Label>
                  <Input id="customer_phone" value={form.customer_phone} readOnly />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch_agent">Branch Agent</Label>
                  <Select value={form.branch_agent} onValueChange={v => handleFormChange("branch_agent", v)}>
                    <SelectTrigger id="branch_agent">
                      <SelectValue placeholder="Select branch agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <Input
                          placeholder="Search branch agent..."
                          value={branchAgentSearch}
                          onChange={e => setBranchAgentSearch(e.target.value)}
                          className="mb-1"
                        />
                      </div>
                      {branchAgentOptions.filter(b =>
                        b.employee_name?.toLowerCase().includes(branchAgentSearch.toLowerCase()) ||
                        b.name.toLowerCase().includes(branchAgentSearch.toLowerCase())
                      ).map(b => (
                        <SelectItem key={b.name} value={b.name}>{b.employee_name || b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="delivery_person">Delivery Person</Label>
                  <Select value={form.delivery_person} onValueChange={v => handleFormChange("delivery_person", v)}>
                    <SelectTrigger id="delivery_person">
                      <SelectValue placeholder="Select delivery person" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <Input
                          placeholder="Search delivery person..."
                          value={deliveryPersonSearch}
                          onChange={e => setDeliveryPersonSearch(e.target.value)}
                          className="mb-1"
                        />
                      </div>
                      {deliveryPersonOptions.filter(d =>
                        d.delivery_person_name?.toLowerCase().includes(deliveryPersonSearch.toLowerCase()) ||
                        d.name.toLowerCase().includes(deliveryPersonSearch.toLowerCase())
                      ).map(d => (
                        <SelectItem key={d.name} value={d.name}>{d.delivery_person_name || d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <Select value={form.destination} onValueChange={v => handleFormChange("destination", v)}>
                    <SelectTrigger id="destination">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 py-1">
                        <Input
                          placeholder="Search destination..."
                          value={destinationSearch}
                          onChange={e => setDestinationSearch(e.target.value)}
                          className="mb-1"
                        />
                      </div>
                      {destinationOptions.filter(d =>
                        d.destination_name?.toLowerCase().includes(destinationSearch.toLowerCase()) ||
                        d.name.toLowerCase().includes(destinationSearch.toLowerCase())
                      ).map(d => (
                        <SelectItem key={d.name} value={d.name}>{d.destination_name || d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="received_date">Received Date</Label>
                  <Input id="received_date" type="date" value={form.received_date} onChange={e => handleFormChange("received_date", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Goods Details</Label>
                <div className="overflow-x-auto max-w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>UOM</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {form.goods_details.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Select value={row.item_name} onValueChange={v => handleGoodsDetailChange(idx, "item_name", v)}>
                              <SelectTrigger><SelectValue placeholder="Item" /></SelectTrigger>
                              <SelectContent>
                                {itemOptions.map(i => (
                                  <SelectItem key={i.name} value={i.name}>{i.item_name || i.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="any" value={row.quantity} onChange={e => handleGoodsDetailChange(idx, "quantity", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Select value={row.uom} onValueChange={v => handleGoodsDetailChange(idx, "uom", v)}>
                              <SelectTrigger><SelectValue placeholder="UOM" /></SelectTrigger>
                              <SelectContent>
                                {uomOptions.map(u => (
                                  <SelectItem key={u.name} value={u.name}>{u.uom_name || u.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={row.destination} onValueChange={v => handleGoodsDetailChange(idx, "destination", v)}>
                              <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                              <SelectContent>
                                {destinationOptions.map(d => (
                                  <SelectItem key={d.name} value={d.name}>{d.destination_name || d.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">TZS</span>
                              <Input type="number" step="any" value={row.rate} onChange={e => handleGoodsDetailChange(idx, "rate", e.target.value)} />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input type="number" step="any" value={row.amount} readOnly />
                          </TableCell>
                          <TableCell>
                            <Textarea value={row.description} onChange={e => handleGoodsDetailChange(idx, "description", e.target.value)} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" onClick={() => removeGoodsDetail(idx)}>-</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
                <Button variant="outline" onClick={addGoodsDetail}>+ Add Row</Button>
              </div>
              {/* Remove Total Amount field from parent form UI */}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>
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
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              // Disable if already has shipment_manifest
                              if (receipt.shipment_manifest) return;
                              toast({ title: "Creating Manifest..." });
                              await createShipmentManifestFromGoodsReceipt(receipt.id);
                              toast({ title: "Manifest Created", description: `Manifest created for ${receipt.id}` });
                              // Reload list
                              const result = await fetchGoodsReceipts();
                              setGoodsReceipts(result.data);
                              setTotal(result.total);
                            } catch (err: any) {
                              toast({ title: "Error", description: err.message, variant: "destructive" });
                            }
                          }}
                          disabled={!!receipt.shipment_manifest}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Create Manifest
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {
                            try {
                              // Disable if already has delivery_note
                              if (receipt.delivery_note) return;
                              toast({ title: "Creating Delivery Note..." });
                              await createDeliveryNoteFromGoodsReceipt(receipt.id);
                              toast({ title: "Delivery Note Created", description: `Delivery Note created for ${receipt.id}` });
                              // Reload list
                              const result = await fetchGoodsReceipts();
                              setGoodsReceipts(result.data);
                              setTotal(result.total);
                            } catch (err: any) {
                              toast({ title: "Error", description: err.message, variant: "destructive" });
                            }
                          }}
                          disabled={!!receipt.delivery_note}
                        >
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