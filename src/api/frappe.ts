import { fetchWithAuth } from "./fetchWithAuth";

const BASE_URL = import.meta.env.VITE_FRAPPE_API_BASE_URL;
const GOODS_RECEIPT_LIST = import.meta.env.VITE_FRAPPE_GOODS_RECEIPT_LIST_ENDPOINT;

export async function fetchGoodsReceipts() {
  const base = BASE_URL + GOODS_RECEIPT_LIST;
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch goods receipts");
  const data = await res.json();
  // API returns { message: { data: [...], total: n } }
  return {
    data: data.message?.data || [],
    total: data.message?.total || 0
  };
}

export async function fetchShipmentManifests(search = "", filters: { agent?: string; vehicle?: string; destination?: string } = {}) {
  let base = import.meta.env.VITE_FRAPPE_API_BASE_URL + import.meta.env.VITE_FRAPPE_SHIPMENT_MANIFEST_LIST_ENDPOINT;
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (filters.agent) params.append("agent", filters.agent);
  if (filters.vehicle) params.append("vehicle", filters.vehicle);
  if (filters.destination) params.append("destination", filters.destination);
  if ([...params].length) base += `?${params.toString()}`;
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch shipment manifests");
  const data = await res.json();
  return {
    data: data.message?.data || [],
    total: data.message?.total || 0
  };
}

export async function fetchVehicleLogs(search = "") {
  let base = import.meta.env.VITE_FRAPPE_API_BASE_URL + "/api/method/tenaciousfreightmaster.tenacious_freightmaster.api.get_vehicle_logs";
  if (search && search.trim()) {
    const params = new URLSearchParams({ search });
    base += `?${params.toString()}`;
  }
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch vehicle logs");
  const data = await res.json();
  return {
    data: data.message?.data || [],
    total: data.message?.total || 0
  };
}

export async function fetchDeliveryNotes(search = "") {
  let base = import.meta.env.VITE_FRAPPE_API_BASE_URL + "/api/method/tenaciousfreightmaster.tenacious_freightmaster.api.get_delivery_notes";
  if (search && search.trim()) {
    const params = new URLSearchParams({ search });
    base += `?${params.toString()}`;
  }
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch delivery notes");
  const data = await res.json();
  return {
    data: data.message?.data || [],
    total: data.message?.total || 0,
    metrics: data.message?.metrics || {}
  };
}

export async function fetchLeftGoodsLogs(search = "") {
  let base = import.meta.env.VITE_FRAPPE_API_BASE_URL + "/api/method/tenaciousfreightmaster.tenacious_freightmaster.api.get_left_goods_logs";
  if (search && search.trim()) {
    const params = new URLSearchParams({ search });
    base += `?${params.toString()}`;
  }
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch left goods logs");
  const data = await res.json();
  return {
    data: data.message?.data || [],
    total: data.message?.total || 0,
    metrics: data.message?.metrics || {}
  };
}

export async function fetchCustomers(search = "") {
  let base = import.meta.env.VITE_FRAPPE_API_BASE_URL + "/api/method/tenaciousfreightmaster.tenacious_freightmaster.api.get_customers";
  if (search && search.trim()) {
    const params = new URLSearchParams({ search });
    base += `?${params.toString()}`;
  }
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch customers");
  const data = await res.json();
  return {
    data: data.message?.data || [],
    total: data.message?.total || 0,
    metrics: data.message?.metrics || {}
  };
}

export async function fetchDashboardData() {
  const base = BASE_URL + "/api/method/tenaciousfreightmaster.tenacious_freightmaster.api.get_dashboard_data";
  const res = await fetchWithAuth(base);
  if (!res.ok) throw new Error("Failed to fetch dashboard data");
  const data = await res.json();
  return data.message;
}

export async function printVehicleLog(name: string) {
  // Frappe's standard print endpoint
  const url = `${BASE_URL}/api/method/frappe.utils.print_format.download_pdf?doctype=Vehicle Log&name=${encodeURIComponent(name)}&format=Vehicle Log Print Format&no_letterhead=1`;
  const res = await fetchWithAuth(url);
  if (!res.ok) throw new Error("Failed to fetch Vehicle Log PDF");
  const blob = await res.blob();
  return blob;
} 