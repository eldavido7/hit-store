"use client";

import {
  getSalesData,
  getTopProducts,
  getCategoryAnalytics,
  getLowStockAlerts,
  useStore,
  useSettingsStore,
  useAuthStore,
  useContentStore,
  useEventStore,
} from "@/store/store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpIcon,
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, BookOpen, MessageSquare } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

// Define chart data types
interface ChartData {
  name: string;
  value: number;
}

// Import charts with dynamic imports and disable SSR
const LineChart = dynamic(() => import("@/components/charts/line-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});
const BarChart = dynamic(() => import("@/components/charts/bar-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});
const DonutChart = dynamic(() => import("@/components/charts/donut-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[350px] w-full" />,
});

export default function Dashboard() {
  const { user } = useAuthStore();
  const { products, orders, discounts, fetchOrders, fetchProducts, fetchDiscounts } = useStore();
  const { events, fetchEvents } = useEventStore();
  const { blogs, stories, fetchBlogs, fetchStories } = useContentStore();
  const { users, shippingOptions, fetchSettings } = useSettingsStore();
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [discountsLoading, setDiscountsLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [salesPeriod, setSalesPeriod] = useState<'week' | 'month' | '6months' | 'year'>('year');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!orders || orders.length === 0) {
          await fetchOrders();
          console.log("[FETCHED_ORDERS]", orders);
        }
        setOrdersLoading(false);
      } catch (error) {
        console.error("[FETCH_ORDERS_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please try again.",
          variant: "destructive",
        });
        setOrdersLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!products || products.length === 0) {
          await fetchProducts();
          console.log("[FETCHED_PRODUCTS]", products);
        }
        setProductsLoading(false);
      } catch (error) {
        console.error("[FETCH_PRODUCTS_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again.",
          variant: "destructive",
        });
        setProductsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!discounts || discounts.length === 0) {
          await fetchDiscounts();
          console.log("[FETCHED_DISCOUNTS]", discounts);
        }
        setDiscountsLoading(false);
      } catch (error) {
        console.error("[FETCH_DISCOUNTS_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch discounts. Please try again.",
          variant: "destructive",
        });
        setDiscountsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (users.length === 0) {
          await fetchSettings();
          console.log("[FETCHED_SETTINGS]", { users, shippingOptions });
        }
        setSettingsLoading(false);
      } catch (error) {
        console.error("[FETCH_SETTINGS_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch settings. Please try again.",
          variant: "destructive",
        });
        setSettingsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (events.length === 0) {
          await fetchEvents();
          console.log("[FETCHED_EVENTS]", events);
        }
      } catch (error) {
        console.error("[FETCH_EVENTS_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch events. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (blogs.length === 0) {
          await fetchBlogs();
          console.log("[FETCHED_BLOGS]", blogs);
        }
      } catch (error) {
        console.error("[FETCH_BLOGS_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch blogs. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (stories.length === 0) {
          await fetchStories();
          console.log("[FETCHED_STORIES]", stories);
        }
      } catch (error) {
        console.error("[FETCH_STORIES_ERROR]", error);
        toast({
          title: "Error",
          description: "Failed to fetch stories. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, []);

  if (ordersLoading || productsLoading || discountsLoading || settingsLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px] mb-2" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate dashboard metrics with variant-aware revenue
  const totalRevenue = orders
    .filter((order) => order.status === "DELIVERED" || order.status === "SHIPPED")
    .reduce((sum, order) => sum + (order.total || 0), 0);

  const totalOrders = orders.length;
  const totalProducts = products.length;
  const totalEvents = events.length;
  const totalBlogs = blogs.length;
  const totalStories = stories.length;

  // Count total variants across all products
  const totalVariants = products.reduce((sum, product) => {
    return sum + (product.variants?.length ?? 0);
  }, 0);

  const totalCustomers = new Set(orders.map((order) => order.email)).size;

  // Calculate recent stats
  const pendingOrders = orders.filter((order) => order.status === "PENDING").length;
  const processingOrders = orders.filter((order) => order.status === "PROCESSING").length;
  const shippedOrders = orders.filter((order) => order.status === "SHIPPED").length;
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED").length;

  // Use the improved low stock alerts function
  const lowStockAlerts = getLowStockAlerts(products, 10);
  const lowStockCount = lowStockAlerts.length;
  const criticalStockCount = lowStockAlerts.filter(alert => alert.currentStock < 5).length;

  // Calculate total inventory including variants
  const totalInventory = products.reduce((sum, product) => {
    if (product.variants?.length) {
      return sum + product.variants.reduce((variantSum, v) => variantSum + (v.inventory ?? 0), 0);
    }
    return sum + (product.inventory ?? 0);
  }, 0);

  // Calculate percentage change for revenue and orders (last 30 days vs previous 30 days)
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const prev30Days = new Date(last30Days.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentRevenue = orders
    .filter((order) => order.status === "DELIVERED" || order.status === "SHIPPED")
    .filter((order) => new Date(order.createdAt) >= last30Days)
    .reduce((sum, order) => sum + (order.total || 0), 0);
  const prevRevenue = orders
    .filter((order) => order.status === "DELIVERED" || order.status === "SHIPPED")
    .filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt < last30Days && createdAt >= prev30Days;
    })
    .reduce((sum, order) => sum + (order.total || 0), 0);
  const revenueChange = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

  const recentOrders = orders.filter((order) => new Date(order.createdAt) >= last30Days).length;
  const prevOrders = orders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return createdAt < last30Days && createdAt >= prev30Days;
  }).length;
  const ordersChange = prevOrders > 0 ? ((recentOrders - prevOrders) / prevOrders) * 100 : 0;

  // Calculate order status distribution for pie chart
  const orderStatusData: ChartData[] = [
    { name: "Pending", value: pendingOrders },
    { name: "Processing", value: processingOrders },
    { name: "Shipped", value: shippedOrders },
    { name: "Delivered", value: deliveredOrders },
    { name: "Cancelled", value: orders.filter((order) => order.status === "CANCELLED").length },
  ].filter((item) => item.value > 0);

  // Get category analytics with variant-aware calculations
  const categoryAnalytics = getCategoryAnalytics(products, orders.map((order) => ({
    ...order,
    createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
  })));

  const categoryData: ChartData[] = categoryAnalytics.map(cat => ({
    name: cat.name,
    value: cat.productCount,
  }));

  const salesData = getSalesData(
    orders.map((order) => ({
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    })),
    salesPeriod
  );

  // Get period label for the chart description
  const getPeriodLabel = () => {
    switch (salesPeriod) {
      case 'week':
        return 'Daily revenue for the past week';
      case 'month':
        return 'Weekly revenue for the past month';
      case '6months':
        return 'Monthly revenue for the past 6 months';
      case 'year':
      default:
        return 'Monthly revenue for the past year';
    }
  };

  const { topByRevenue, topByQuantity } = getTopProducts(
    orders.map((order) => ({
      ...order,
      createdAt: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    }))
  );

  return (
    <div className="space-y-6 p-6 pt-6 md:p-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Hello, {user?.name || "Admin"}!
        </h2>
        <p className="text-muted-foreground">
          Welcome back! Here’s a quick overview of your platform activity.
        </p>
      </div>

      <div className="relative">
        {/* Mobile: Single column */}
        <div className="grid gap-6 grid-cols-1 md:hidden">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-primary" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-3xl font-semibold">₦{totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-orange-500/10 backdrop-blur-3xl shadow-inner">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs mt-4">
                {revenueChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(revenueChange).toFixed(1)}% {revenueChange >= 0 ? "increase" : "Decrease"}
                </span>
                <span className="text-muted-foreground">vs previous month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-purple-500" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-3xl font-semibold">{totalOrders}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-purple-500/10 backdrop-blur-3xl shadow-inner">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs mt-4">
                {ordersChange >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={ordersChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(ordersChange).toFixed(1)}% {ordersChange >= 0 ? "increase" : "Decrease"}
                </span>
                <span className="text-muted-foreground">vs previous month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-blue-500" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="text-3xl font-semibold">{totalEvents}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-blue-500/10 backdrop-blur-3xl shadow-inner">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Upcoming & past events
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-indigo-500" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Blogs</p>
                    <p className="text-3xl font-semibold">{totalBlogs}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-indigo-500/10 backdrop-blur-3xl shadow-inner">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Published blog posts
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-cyan-500" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Stories</p>
                    <p className="text-3xl font-semibold">{totalStories}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-cyan-500/10 backdrop-blur-3xl shadow-inner">
                  <MessageSquare className="h-5 w-5 text-cyan-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Community stories
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-green-500" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Catalog</p>
                    <p className="text-3xl font-semibold">{totalProducts}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-green-500/10 backdrop-blur-3xl shadow-inner">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                <span>{totalVariants} variants</span>
                {lowStockCount > 0 ? (
                  <div className="flex items-center">
                    <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                    <span className="text-amber-500 font-medium">{lowStockCount} low stock</span>
                  </div>
                ) : (
                  <span className="text-green-600">All in stock</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 h-12 rounded-full bg-pink-500" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-3xl font-semibold">{totalCustomers}</p>
                  </div>
                </div>
                <div className="rounded-lg p-3 bg-pink-500/10 backdrop-blur-3xl shadow-inner">
                  <Users className="h-5 w-5 text-pink-600" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Unique customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Desktop: Horizontal scroll with arrows */}
        <div className="hidden md:block relative">
          <button
            type="button"
            title="Scroll left"
            onClick={() => {
              const container = document.getElementById('stats-scroll-container');
              container?.scrollBy({ left: -320, behavior: 'smooth' });
            }}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors border"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            title="Scroll right"
            onClick={() => {
              const container = document.getElementById('stats-scroll-container');
              container?.scrollBy({ left: 320, behavior: 'smooth' });
            }}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors border"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div
            id="stats-scroll-container"
            className="flex gap-6 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
        #stats-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-xl font-semibold">₦{totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-orange-500/10 backdrop-blur-xl shadow-inner">
                    <DollarSign className="h-5 w-5 text-[#bf5925]" />
                  </div>

                </div>
                <div className="flex items-center gap-1 text-xs mt-4">
                  {revenueChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={revenueChange >= 0 ? "text-green-600" : "text-red-600"}>
                    {Math.abs(revenueChange).toFixed(1)}% {revenueChange >= 0 ? "increase" : "Decrease"}
                  </span>
                  <span className="text-muted-foreground">vs previous month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-purple-500" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Orders</p>
                      <p className="text-xl font-semibold">{totalOrders}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-purple-500/10 backdrop-blur-3xl shadow-inner">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs mt-4">
                  {ordersChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={ordersChange >= 0 ? "text-green-600" : "text-red-600"}>
                    {Math.abs(ordersChange).toFixed(1)}% {ordersChange >= 0 ? "increase" : "Decrease"}
                  </span>
                  <span className="text-muted-foreground">vs previous month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Events</p>
                      <p className="text-xl font-semibold">{totalEvents}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-blue-500/10 backdrop-blur-3xl shadow-inner">
                    <CalendarDays className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Upcoming & past events
                </p>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-indigo-500" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Blogs</p>
                      <p className="text-xl font-semibold">{totalBlogs}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-indigo-500/10 backdrop-blur-3xl shadow-inner">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Published blog posts
                </p>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-cyan-500" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Stories</p>
                      <p className="text-xl font-semibold">{totalStories}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-cyan-500/10 backdrop-blur-3xl shadow-inner">
                    <MessageSquare className="h-5 w-5 text-cyan-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Community stories
                </p>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-green-500" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Catalog</p>
                      <p className="text-xl font-semibold">{totalProducts}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-green-500/10 backdrop-blur-3xl shadow-inner">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                  <span>{totalVariants} variants</span>
                  {lowStockCount > 0 ? (
                    <div className="flex items-center">
                      <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                      <span className="text-amber-500 font-medium">{lowStockCount} low stock</span>
                    </div>
                  ) : (
                    <span className="text-green-600">All in stock</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="flex-shrink-0 w-80 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-12 rounded-full bg-pink-500" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Customers</p>
                      <p className="text-xl font-semibold">{totalCustomers}</p>
                    </div>
                  </div>
                  <div className="rounded-lg p-4 bg-pink-500/10 backdrop-blur-3xl shadow-inner">
                    <Users className="h-5 w-5 text-pink-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Unique customers
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>{getPeriodLabel()}</CardDescription>
                </div>
                <Select value={salesPeriod} onValueChange={(value: 'week' | 'month' | '6months' | 'year') => setSalesPeriod(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                <LineChart
                  data={salesData}
                  categories={["revenue"]}
                  index="date"
                  colors={["orange"]}
                  valueFormatter={(value: number) => `₦${value.toLocaleString()}`}
                  yAxisWidth={70}
                  height={350}
                />
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card className="col-span-full lg:col-span-3 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Order Status</CardTitle>
                  <Select defaultValue="thismonth">
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="thismonth">This Month</SelectItem>
                      <SelectItem value="lastmonth">Last Month</SelectItem>
                      <SelectItem value="thisyear">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="relative h-[300px] w-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => {
                            const colors = {
                              "Pending": "#BF5925",
                              "Processing": "#a855f7",
                              "Shipped": "#3b82f6",
                              "Delivered": "#22c55e",
                              "Cancelled": "#BB0909FF"
                            };
                            return (
                              <Cell key={`cell-${index}`} fill={colors[entry.name as keyof typeof colors] || "#6b7280"} />
                            );
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="text-2xl font-semibold">{totalOrders.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 w-full">
                    {orderStatusData.map((item) => {
                      const colors = {
                        "Pending": "#BF5925",
                        "Processing": "#a855f7",
                        "Shipped": "#3b82f6",
                        "Delivered": "#22c55e",
                        "Cancelled": "#BB0909FF"
                      };
                      return (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[item.name as keyof typeof colors] || "#6b7280" }} />
                          <span className="text-xs text-muted-foreground">{item.name}</span>
                          <span className="ml-auto text-xs font-medium">{item.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>You have {pendingOrders} pending orders</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orders.slice(0, 5).map((order) => (
                    <div className="flex items-center justify-between" key={order.id}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {order.firstName} {order.lastName}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                          <span>{order.items.length} {order.items.length === 1 ? "item" : "items"}</span>
                          <span>•</span>
                          <span>₦{order.total.toLocaleString()}</span>
                          {order.items.some(item => !item.product) && (
                            <Badge variant="outline" className="text-xs">
                              Contains deleted items
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          order.status === "DELIVERED" && "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100",
                          order.status === "SHIPPED" && "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100",
                          order.status === "PROCESSING" && "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100",
                          order.status === "PENDING" && "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-100",
                          order.status === "CANCELLED" && "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                        )}
                        variant="outline"
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>Stock Alerts</CardTitle>
                <CardDescription>
                  {lowStockCount} items low in stock
                  {criticalStockCount > 0 && `, ${criticalStockCount} critical`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {lowStockAlerts.length > 0 ? (
                    lowStockAlerts.slice(0, 5).map((alert, index) => {
                      const isCritical = alert.currentStock < 5;
                      const maxStock = 50; // Assumed maximum for progress calculation
                      return (
                        <div className="space-y-2" key={`${alert.productId}-${alert.variantId || 'main'}-${index}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium leading-none">{alert.productTitle}</p>
                              <p className="text-sm text-muted-foreground">
                                {alert.type === 'variant'
                                  ? `Variant: ${alert.variantName}`
                                  : 'Main product'
                                }
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                isCritical
                                  ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900 dark:text-amber-100"
                              )}
                              variant="outline"
                            >
                              {isCritical ? "Critical" : "Low"}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>Stock: {alert.currentStock}</span>
                              <span>{Math.round((alert.currentStock / maxStock) * 100)}%</span>
                            </div>
                            <Progress
                              value={Math.round((alert.currentStock / maxStock) * 100)}
                              className={cn(isCritical ? "text-red-600" : "text-amber-600")}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">All items in stock</h3>
                      <p className="text-sm text-muted-foreground mt-1">Your inventory levels are healthy</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
                <CardDescription>Best selling products by revenue (variant-aware)</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={topByRevenue.slice(0, 8)}
                  index="title"
                  categories={["totalRevenue"]}
                  colors={["emerald"]}
                  valueFormatter={(value: number) => `₦${value.toLocaleString()}`}
                  yAxisWidth={60}
                  height={350}
                />
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>Distribution of products by category</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  data={categoryData}
                  index="name"
                  categories={["value"]}
                  colors={["blue", "emerald", "amber", "purple", "indigo"]}
                  valueFormatter={(value: number) => `${value} products`}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
              <CardDescription>Monthly order volume</CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={salesData}
                categories={["orders"]}
                index="date"
                colors={["blue"]}
                valueFormatter={(value: number) => `${value.toLocaleString()} orders`}
                yAxisWidth={70}
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}