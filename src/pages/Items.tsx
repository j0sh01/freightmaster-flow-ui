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
  Package2, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Eye,
  Package,
  Tag,
  Boxes
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockItems = [
  {
    id: "ITM-001",
    name: "Electronic Components",
    category: "Electronics",
    description: "Various electronic components and circuits",
    unitOfMeasure: "Boxes",
    standardWeight: "2.5 kg",
    standardDimensions: "30x20x15 cm",
    status: "active",
    createdDate: "2024-01-01",
    lastUsed: "2024-01-15",
    usageCount: 45
  },
  {
    id: "ITM-002", 
    name: "Cotton Textiles",
    category: "Textiles",
    description: "Premium cotton fabric materials and garments",
    unitOfMeasure: "Rolls",
    standardWeight: "15.0 kg",
    standardDimensions: "120x80x20 cm",
    status: "active",
    createdDate: "2023-12-15",
    lastUsed: "2024-01-14",
    usageCount: 67
  },
  {
    id: "ITM-003",
    name: "Computer Accessories",
    category: "Electronics",
    description: "Keyboards, mice, cables, and other computer peripherals",
    unitOfMeasure: "Pieces",
    standardWeight: "0.8 kg",
    standardDimensions: "25x15x8 cm",
    status: "active",
    createdDate: "2024-01-05",
    lastUsed: "2024-01-13",
    usageCount: 23
  },
  {
    id: "ITM-004",
    name: "Industrial Tools",
    category: "Tools",
    description: "Heavy-duty industrial tools and equipment",
    unitOfMeasure: "Units",
    standardWeight: "8.5 kg",
    standardDimensions: "40x30x25 cm",
    status: "discontinued",
    createdDate: "2023-11-20",
    lastUsed: "2023-12-28",
    usageCount: 12
  }
];

const itemCategories = [
  "Electronics", "Textiles", "Tools", "Documents", "Furniture", "Food Items", "Chemicals", "Machinery"
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return <Badge className="bg-status-completed text-success-foreground">Active</Badge>;
    case "discontinued":
      return <Badge variant="outline">Discontinued</Badge>;
    case "pending":
      return <Badge className="bg-status-pending text-warning-foreground">Pending</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function Items() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const filteredItems = mockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Items Registry</h1>
          <p className="text-muted-foreground">Manage standardized items for quick selection in goods receipts</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-dark">
              <Plus className="h-4 w-4 mr-2" />
              Register Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Register New Item</DialogTitle>
              <DialogDescription>
                Add a new item to the registry for standardized use in goods receipts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="itemName">Item Name</Label>
                <Input id="itemName" placeholder="Enter item name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {itemCategories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitOfMeasure">Unit of Measure</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pieces">Pieces</SelectItem>
                      <SelectItem value="boxes">Boxes</SelectItem>
                      <SelectItem value="rolls">Rolls</SelectItem>
                      <SelectItem value="units">Units</SelectItem>
                      <SelectItem value="packets">Packets</SelectItem>
                      <SelectItem value="bundles">Bundles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Detailed description of the item..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="standardWeight">Standard Weight (kg)</Label>
                  <Input id="standardWeight" type="number" step="0.1" placeholder="0.0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions">Standard Dimensions (LxWxH cm)</Label>
                  <Input id="dimensions" placeholder="e.g., 30x20x15" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN Code (Optional)</Label>
                  <Input id="hsn" placeholder="HSN/SAC code" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storageInstructions">Storage Instructions</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fragile">Fragile</SelectItem>
                      <SelectItem value="refrigerated">Refrigerated</SelectItem>
                      <SelectItem value="hazardous">Hazardous</SelectItem>
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
                Register Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">Registered items</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Package className="h-4 w-4 text-status-completed" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">Available for use</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Item categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Used</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
            <p className="text-xs text-muted-foreground">Cotton Textiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items Registry</CardTitle>
          <CardDescription>Standardized items for efficient goods receipt processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
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
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Standard Weight</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-xs">
                        {item.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.unitOfMeasure}</TableCell>
                  <TableCell>{item.standardWeight}</TableCell>
                  <TableCell>{item.standardDimensions}</TableCell>
                  <TableCell>{item.usageCount}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                          Usage History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {item.status === 'active' ? 'Discontinue' : 'Reactivate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete Item
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