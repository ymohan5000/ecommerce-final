"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import {
  Package,
  Filter,
  Calendar,
  DollarSign,
  User,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface OrderProduct {
  product: {
    _id: string;
    name: string;
    image: string;
    price: number;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerInfo?: {
    email?: string;
  };
  products: OrderProduct[];
  totalPrice: number;
  status: string;
  createdAt: string;
  address: string;
  phoneNo: number;
}

const PAGE_SIZE = 8;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedOrderIds, setExpandedOrderIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const router = useRouter();

  // Debounce search input
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      router.push("/login");
      return;
    }
    fetchOrders();
  }, [router]);

  const fetchOrders = async (status?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      let url = `/api/orders`;
      if (status && status !== "") {
        url += `?status=${status}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
        setPage(1); // reset page on new fetch
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Failed to fetch orders";
      setError(errorMessage);
      toast.error(errorMessage);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced version of handleSearch to reduce excessive filtering on typing
  const debouncedSearch = useCallback(
    debounce((term: string, orders: Order[]) => {
      if (!term) {
        setFilteredOrders(orders);
        setPage(1);
        return;
      }
      const filtered = orders.filter(
        (order) =>
          (order.customerInfo?.email ?? "guest@mohan.com").toLowerCase().includes(term.toLowerCase()) ||
          order._id.toLowerCase().includes(term.toLowerCase()) ||
          order.address.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredOrders(filtered);
      setPage(1);
    }, 350),
    []
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term, orders);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    fetchOrders(status);
    setSearchTerm("");
  };

  const clearFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="inline w-4 h-4 mr-1" />;
      case "delivered":
        return <CheckCircle className="inline w-4 h-4 mr-1" />;
      case "cancelled":
        return <XCircle className="inline w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <Package className="mx-auto h-16 w-16 text-gray-400 animate-pulse" />
        <h3 className="mt-4 text-lg font-semibold text-gray-900">Loading orders...</h3>
        <div className="mt-6 w-full max-w-3xl animate-pulse space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-6 font-semibold">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6" />
                Orders Management
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-600 font-medium">
                Total: <span className="font-bold">{filteredOrders.length}</span> orders
              </span>
              {statusFilter || searchTerm ? (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
                >
                  Clear Filters & Search
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </nav>

      {/* Filters and Search */}
      <section className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 flex flex-col sm:flex-row sm:items-end gap-5">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Orders
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by email, order ID, or address..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div className="w-48">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              Filter by Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            >
              <option value="">All Orders</option>
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </section>

      {/* Orders List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && filteredOrders.length === 0 && !error && (
          <div className="text-center py-20 text-gray-500">
            <Package className="mx-auto h-16 w-16 mb-4" />
            <h3 className="text-lg font-semibold">No orders found</h3>
            <p>{statusFilter ? `No ${statusFilter} orders` : "No orders in the system yet"}</p>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedOrders.map((order) => (
            <article
              key={order._id}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition-shadow duration-300"
              onClick={() => toggleOrderDetails(order._id)}
              aria-expanded={expandedOrderIds.has(order._id)}
            >
              <header className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </header>

              <section className="flex justify-between items-center mb-3 text-gray-600 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="truncate max-w-[150px]">{order.customerInfo?.email ?? "guest@mohan.com"}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-green-600">
                  <DollarSign className="w-4 h-4" />
                  ${order.totalPrice.toFixed(2)}
                </div>
              </section>

              <section className="mb-3 text-gray-700 text-sm space-y-1">
                <p>
                  <span className="font-semibold">Address:</span> {order.address}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> {order.phoneNo}
                </p>
              </section>

              {/* Animated Product Details */}
              <div
                className={`overflow-hidden transition-max-height duration-500 ease-in-out ${
                  expandedOrderIds.has(order._id) ? "max-h-[1000px]" : "max-h-0"
                }`}
                aria-hidden={!expandedOrderIds.has(order._id)}
              >
                <h4 className="text-sm font-semibold mb-2 border-b border-gray-200 pb-2">
                  Products ({order.products.length} items)
                </h4>
                <ul className="space-y-3">
                  {order.products.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-4 bg-gray-50 rounded-lg p-3 shadow-sm"
                    >
                      <img
                        src={item.product.image?.trim() || "/placeholder.svg"}
                        alt={item.product.name}
                        className="w-14 h-14 object-contain rounded"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium truncate">{item.product.name}</p>
                        <p className="text-gray-600 text-xs">
                          Qty: {item.quantity} × ${item.price.toFixed(2)} = $
                          {(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOrderDetails(order._id);
                }}
                aria-expanded={expandedOrderIds.has(order._id)}
                aria-controls={`order-products-${order._id}`}
                className="mt-4 text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 select-none"
              >
                {expandedOrderIds.has(order._id) ? (
                  <>
                    Hide Product Details <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Show Product Details <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            </article>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-10 flex justify-center items-center space-x-3"
            aria-label="Pagination"
          >
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md border ${
                page === 1
                  ? "cursor-not-allowed border-gray-300 text-gray-400"
                  : "hover:bg-gray-100 border-gray-400 text-gray-700"
              } transition`}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded-md border ${
                  page === i + 1
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100 border-gray-400 text-gray-700"
                } transition`}
                aria-current={page === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md border ${
                page === totalPages
                  ? "cursor-not-allowed border-gray-300 text-gray-400"
                  : "hover:bg-gray-100 border-gray-400 text-gray-700"
              } transition`}
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </div>
  );
}
