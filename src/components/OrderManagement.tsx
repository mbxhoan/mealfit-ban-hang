"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Order, Customer, OrderDetail } from "../data/mealPrepData";
import { uploadInvoiceToDrive } from "../services/googleDriveService";
import { useData } from "@/contexts/DataContext";
import { StatStrip, type Stat } from "@/components/ui/StatStrip";
import { useToast } from "@/components/ui/Toast";
import { useIsAdmin } from "@/contexts/AuthContext";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Trash2,
  Printer,
  Clipboard,
  X,
  TrendingUp,
  Edit2,
  FileText,
  Save,
  Wallet,
  AlertCircle,
  Columns3,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";

// ---- Table column + sort configuration (module-level: pure, no re-creation) ----
type ColKey = "code" | "customer" | "items" | "total" | "delivery" | "payment";
type SortKey = ColKey | "updated";

const COLUMNS: { key: ColKey; label: string; sortKey?: SortKey; align?: "left" | "right" | "center" }[] = [
  { key: "code", label: "Mã đơn & Ngày giao", sortKey: "code" },
  { key: "customer", label: "Thông tin khách", sortKey: "customer" },
  { key: "items", label: "Đơn hàng (Phần cơm)" },
  { key: "total", label: "Tổng thực tế", sortKey: "total", align: "right" },
  { key: "delivery", label: "Giao hàng", sortKey: "delivery", align: "center" },
  { key: "payment", label: "Thanh toán", sortKey: "payment", align: "center" },
];

const STATUS_ORDER: Record<Order["status"], number> = {
  "Mới": 0,
  "Đang xử lý": 1,
  "Đang giao": 2,
  "Đã giao": 3,
  "Đã hủy": 4,
};

const DELIVERY_STATUSES: Order["status"][] = ["Mới", "Đang xử lý", "Đang giao", "Đã giao", "Đã hủy"];
const PAYMENT_STATUSES: Order["paymentStatus"][] = ["Chưa thanh toán", "Đã thanh toán"];
const PAYMENT_METHODS: Order["paymentMethod"][] = ["COD", "Chuyển khoản", "Tiền mặt"];

const sortValue = (o: Order, key: SortKey): string | number => {
  switch (key) {
    case "code": return o.orderNumber;
    case "customer": return o.customerName;
    case "total": return o.totalAmount + o.deliveryFee;
    case "delivery": return STATUS_ORDER[o.status];
    case "payment": return o.paymentStatus;
    case "updated": return o.updatedAt ?? o.createdAt;
    default: return o.createdAt;
  }
};

const COL_LABELS: Record<ColKey, string> = {
  code: "Mã đơn & Ngày giao",
  customer: "Thông tin khách",
  items: "Đơn hàng (Phần cơm)",
  total: "Tổng thực tế",
  delivery: "Giao hàng",
  payment: "Thanh toán",
};

const PAGE_SIZES = [10, 20, 50, 100];
const COLS_STORAGE_KEY = "mealfit_orders_cols_v1";
const PAGESIZE_STORAGE_KEY = "mealfit_orders_pagesize_v1";

export default function OrderManagement() {
  const { orders, customers, meals, saveOrder, removeOrder, saveCustomer } = useData();
  const toast = useToast();
  const isAdmin = useIsAdmin();

  // Navigation & view states
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("_default_no_search");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showBillModal, setShowBillModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Table controls
  const [sortKey, setSortKey] = useState<SortKey>("updated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<{ status: string[]; paymentStatus: string[]; paymentMethod: string[] }>({
    status: [],
    paymentStatus: [],
    paymentMethod: [],
  });
  const [openMenu, setOpenMenu] = useState<"filter" | "cols" | null>(null);
  const [visibleCols, setVisibleCols] = useState<Record<ColKey, boolean>>({
    code: true, customer: true, items: true, total: true, delivery: true, payment: true,
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // New order form fields
  const [newOrderCustomerId, setNewOrderCustomerId] = useState<string>("");
  // In case of a new customer that's not in database:
  const [tempCustomerName, setTempCustomerName] = useState<string>("");
  const [tempCustomerPhone, setTempCustomerPhone] = useState<string>("");
  const [tempCustomerAddress, setTempCustomerAddress] = useState<string>("");
  const [tempCustomerEmail, setTempCustomerEmail] = useState<string>("");

  const [deliveryFee, setDeliveryFee] = useState<number>(30000);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Chuyển khoản" | "Tiền mặt">("Chuyển khoản");
  const [paymentStatus, setPaymentStatus] = useState<"Chưa thanh toán" | "Đã thanh toán">("Chưa thanh toán");
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0] // Tomorrow as default
  );
  const [notes, setNotes] = useState<string>("");

  // Custom multi-item list inside the new order form
  const [orderItems, setOrderItems] = useState<OrderDetail[]>([]);
  const [currentMealId, setCurrentMealId] = useState<string>("");
  const [currentWeight, setCurrentWeight] = useState<string>("");
  const [currentQty, setCurrentQty] = useState<number>(1);

  // Drive upload notice
  const [driveUploadStatus, setDriveUploadStatus] = useState<{status: "idle" | "loading" | "success" | "error"; msg: string}>({
    status: "idle",
    msg: ""
  });

  // Restore persisted UI state (column visibility + page size).
  useEffect(() => {
    try {
      const c = localStorage.getItem(COLS_STORAGE_KEY);
      if (c) setVisibleCols((prev) => ({ ...prev, ...JSON.parse(c) }));
      const p = localStorage.getItem(PAGESIZE_STORAGE_KEY);
      if (p && PAGE_SIZES.includes(Number(p))) setPageSize(Number(p));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(COLS_STORAGE_KEY, JSON.stringify(visibleCols)); } catch { /* ignore */ }
  }, [visibleCols]);
  useEffect(() => {
    try { localStorage.setItem(PAGESIZE_STORAGE_KEY, String(pageSize)); } catch { /* ignore */ }
  }, [pageSize]);

  // Safe Search Term
  const computedSearchTerm = useMemo(() => {
    return searchTerm === "_default_no_search" ? "" : searchTerm;
  }, [searchTerm]);

  // Format currency
  const formatVND = (num: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);
  };

  // Filter orders (search + multi-field filters)
  const filteredOrders = useMemo(() => {
    const term = computedSearchTerm.toLowerCase();
    return orders.filter(o => {
      const matchSearch = term === "" ||
        o.orderNumber.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.customerAddress.toLowerCase().includes(term);
      const matchStatus = filters.status.length === 0 || filters.status.includes(o.status);
      const matchPay = filters.paymentStatus.length === 0 || filters.paymentStatus.includes(o.paymentStatus);
      const matchMethod = filters.paymentMethod.length === 0 || filters.paymentMethod.includes(o.paymentMethod);
      return matchSearch && matchStatus && matchPay && matchMethod;
    });
  }, [orders, computedSearchTerm, filters]);

  // Sort
  const sortedOrders = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filteredOrders].sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb), "vi") * dir;
    });
  }, [filteredOrders, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedOrders = useMemo(
    () => sortedOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedOrders, currentPage, pageSize]
  );

  // Reset to first page when the result set shrinks/changes.
  useEffect(() => { setPage(1); }, [computedSearchTerm, filters, pageSize]);

  const activeFilterCount = filters.status.length + filters.paymentStatus.length + filters.paymentMethod.length;

  // Toggle a value inside a filter group
  const toggleFilter = (group: keyof typeof filters, value: string) => {
    setFilters((prev) => {
      const set = new Set(prev[group]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...prev, [group]: Array.from(set) };
    });
  };

  // Header click: toggle sort direction or switch sort column
  const handleSort = (key?: SortKey) => {
    if (!key) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  // ---- Selection helpers ----
  const pageIds = pagedOrders.map((o) => o.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      set.has(id) ? set.delete(id) : set.add(id);
      return set;
    });
  };
  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => set.delete(id));
      else pageIds.forEach((id) => set.add(id));
      return set;
    });
  };
  const clearSelection = () => setSelectedIds(new Set());

  // Aggregate stats over the currently selected orders.
  const selectionSummary = useMemo(() => {
    const sel = orders.filter((o) => selectedIds.has(o.id));
    let grand = 0, profit = 0, paid = 0, unpaid = 0, delivered = 0, undelivered = 0, dishes = 0, combos = 0;
    sel.forEach((o) => {
      grand += o.totalAmount + o.deliveryFee;
      profit += o.totalProfit;
      o.paymentStatus === "Đã thanh toán" ? paid++ : unpaid++;
      o.status === "Đã giao" ? delivered++ : undelivered++;
      o.items.forEach((it) => {
        if (it.weight === "Combo") combos += it.quantity;
        else dishes += it.quantity;
      });
    });
    return { count: sel.length, grand, profit, paid, unpaid, delivered, undelivered, dishes, combos };
  }, [orders, selectedIds]);

  const stats: Stat[] = useMemo(() => {
    const revenue = orders.reduce((s, o) => s + o.totalAmount, 0);
    const profit = orders.reduce((s, o) => s + o.totalProfit, 0);
    const unpaid = orders.filter((o) => o.paymentStatus === "Chưa thanh toán").length;
    return [
      { label: "Tổng đơn hàng", value: orders.length, icon: <ShoppingBag className="h-5 w-5" />, accent: "bg-brand-50 text-brand-600" },
      { label: "Doanh thu", value: formatVND(revenue), icon: <TrendingUp className="h-5 w-5" />, accent: "bg-indigo-50 text-indigo-600" },
      { label: "Lợi nhuận", value: formatVND(profit), icon: <Wallet className="h-5 w-5" />, accent: "bg-emerald-50 text-emerald-600" },
      { label: "Chưa thanh toán", value: unpaid, sub: `/ ${orders.length} đơn`, icon: <AlertCircle className="h-5 w-5" />, accent: "bg-orange-50 text-orange-600" },
    ];
  }, [orders]);

  // Handle selected customer change on create new order
  const handleCustomerSelection = (id: string) => {
    setNewOrderCustomerId(id);
    if (id !== "NEW") {
      const cust = customers.find(c => c.id === id);
      if (cust) {
        setTempCustomerName(cust.name);
        setTempCustomerPhone(cust.phone);
        setTempCustomerAddress(cust.address);
        setTempCustomerEmail(cust.email);
      }
    } else {
      setTempCustomerName("");
      setTempCustomerPhone("");
      setTempCustomerAddress("");
      setTempCustomerEmail("");
    }
  };

  // When meal is selected, auto set default pricing weight option
  const handleMealSelectionChange = (mealId: string) => {
    setCurrentMealId(mealId);
    const meal = meals.find(m => m.id === mealId);
    if (meal && meal.options.length > 0) {
      setCurrentWeight(meal.options[0].weight);
    } else {
      setCurrentWeight("");
    }
  };

  // Add sub-item to the current order drafting list
  const addSubItemToDraft = () => {
    if (!currentMealId || !currentWeight) return;
    const meal = meals.find(m => m.id === currentMealId);
    if (!meal) return;

    const option = meal.options.find(o => o.weight === currentWeight);
    if (!option) return;

    // Check if item already exists in list, increment quantity instead
    const existingIndex = orderItems.findIndex(
      it => it.mealId === currentMealId && it.weight === currentWeight
    );

    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += currentQty;
      setOrderItems(updated);
    } else {
      const draft: OrderDetail = {
        mealId: meal.id,
        mealName: meal.name,
        weight: currentWeight,
        quantity: currentQty,
        price: option.price,
        cost: option.cost
      };
      setOrderItems([...orderItems, draft]);
    }

    // Reset fields
    setCurrentMealId("");
    setCurrentWeight("");
    setCurrentQty(1);
  };

  // Remove item from draft order list
  const removeSubItemFromDraft = (idx: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== idx));
  };

  // Calculate stats for draft order
  const draftTotals = useMemo(() => {
    let priceSum = 0;
    let costSum = 0;
    orderItems.forEach(item => {
      priceSum += item.price * item.quantity;
      costSum += item.cost * item.quantity;
    });
    return {
      priceSum,
      costSum,
      profitSum: priceSum - costSum
    };
  }, [orderItems]);

  // Reset the order form back to a clean "create" state.
  const resetOrderForm = () => {
    setShowAddModal(false);
    setEditingOrderId(null);
    setOrderItems([]);
    setNewOrderCustomerId("");
    setTempCustomerName("");
    setTempCustomerPhone("");
    setTempCustomerAddress("");
    setTempCustomerEmail("");
    setDeliveryFee(30000);
    setPaymentMethod("Chuyển khoản");
    setPaymentStatus("Chưa thanh toán");
    setDeliveryDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    setNotes("");
    setCurrentMealId("");
    setCurrentWeight("");
    setCurrentQty(1);
  };

  // Open the modal pre-filled for editing an existing order (admin only).
  const openEditModal = (order: Order) => {
    setEditingOrderId(order.id);
    const linked = customers.find(c => c.id === order.customerId);
    setNewOrderCustomerId(linked ? order.customerId : "NEW");
    setTempCustomerName(order.customerName);
    setTempCustomerPhone(order.customerPhone);
    setTempCustomerAddress(order.customerAddress);
    setTempCustomerEmail(linked?.email ?? "");
    setOrderItems(order.items.map(it => ({ ...it })));
    setDeliveryFee(order.deliveryFee);
    setPaymentMethod(order.paymentMethod);
    setPaymentStatus(order.paymentStatus);
    setDeliveryDate(order.deliveryDate);
    setNotes(order.notes ?? "");
    setShowAddModal(true);
  };

  // Submit and save drafted (or edited) order
  const handleSaveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 món ăn vào đơn hàng!");
      return;
    }

    // ----- EDIT MODE: keep identity, recompute totals -----
    if (editingOrderId) {
      const existing = orders.find(o => o.id === editingOrderId);
      if (!existing) { toast.error("Không tìm thấy đơn để cập nhật."); return; }
      const updated: Order = {
        ...existing,
        customerName: tempCustomerName || existing.customerName,
        customerPhone: tempCustomerPhone || existing.customerPhone,
        customerAddress: tempCustomerAddress || existing.customerAddress,
        items: [...orderItems],
        totalAmount: draftTotals.priceSum,
        totalCost: draftTotals.costSum,
        totalProfit: draftTotals.profitSum,
        deliveryFee: Number(deliveryFee),
        paymentMethod,
        paymentStatus,
        deliveryDate,
        notes,
        updatedAt: new Date().toISOString(),
      };
      setSubmitting(true);
      try {
        await saveOrder(updated);
        toast.success(`Đã cập nhật đơn ${updated.orderNumber}.`);
      } catch {
        toast.error("Cập nhật đơn hàng thất bại. Vui lòng thử lại.");
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
      resetOrderForm();
      return;
    }

    // ----- CREATE MODE -----
    let customerIdToLink = newOrderCustomerId;
    let custName = tempCustomerName;
    let custPhone = tempCustomerPhone;
    let custAddress = tempCustomerAddress;

    // Create new customer on the fly if applicable
    if (newOrderCustomerId === "NEW" || !newOrderCustomerId) {
      if (!tempCustomerName || !tempCustomerPhone) {
        toast.error("Vui lòng điền tên và số điện thoại của khách hàng!");
        return;
      }
      const newCustId = `cust-${Date.now()}`;
      const newCust: Customer = {
        id: newCustId,
        name: tempCustomerName,
        phone: tempCustomerPhone,
        address: tempCustomerAddress,
        email: tempCustomerEmail || "khach.hang@gmail.com",
        totalOrders: 1,
        totalSpent: draftTotals.priceSum,
        createdAt: new Date().toISOString().split("T")[0]
      };
      setSubmitting(true);
      try {
        await saveCustomer(newCust);
      } catch {
        setSubmitting(false);
        toast.error("Lưu khách hàng thất bại.");
        return;
      }
      customerIdToLink = newCustId;
    } else {
      // Link to an existing customer profile (stats are recomputed from orders on reload).
      const existing = customers.find(c => c.id === customerIdToLink);
      if (existing) {
        custName = existing.name;
        custPhone = existing.phone;
        custAddress = existing.address;
      }
    }

    // Create new order record
    const uniqueNumber = `MP-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 8)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: uniqueNumber,
      customerId: customerIdToLink,
      customerName: custName,
      customerPhone: custPhone,
      customerAddress: custAddress,
      items: [...orderItems],
      totalAmount: draftTotals.priceSum,
      totalCost: draftTotals.costSum,
      totalProfit: draftTotals.profitSum,
      deliveryFee: Number(deliveryFee),
      paymentMethod,
      paymentStatus,
      status: "Mới",
      deliveryDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes
    };

    setSubmitting(true);
    try {
      await saveOrder(newOrder);
      toast.success(`Đã lên đơn ${newOrder.orderNumber} thành công!`);
    } catch {
      toast.error("Lưu đơn hàng thất bại. Vui lòng thử lại.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    resetOrderForm();
  };

  // Change single order status
  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    await saveOrder({ ...target, status, updatedAt: new Date().toISOString() });
    toast.info(`Cập nhật trạng thái đơn: ${status}.`);
  };

  // Change single order payment status
  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: Order["paymentStatus"]) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    await saveOrder({ ...target, paymentStatus, updatedAt: new Date().toISOString() });
    toast.info(`Thanh toán: ${paymentStatus}.`);
  };

  // ---- Bulk actions on selected orders ----
  const bulkUpdateStatus = async (status: Order["status"]) => {
    const targets = orders.filter(o => selectedIds.has(o.id));
    if (targets.length === 0) return;
    const now = new Date().toISOString();
    await Promise.all(targets.map(o => saveOrder({ ...o, status, updatedAt: now })));
    toast.success(`Đã đổi giao hàng "${status}" cho ${targets.length} đơn.`);
  };
  const bulkUpdatePayment = async (paymentStatus: Order["paymentStatus"]) => {
    const targets = orders.filter(o => selectedIds.has(o.id));
    if (targets.length === 0) return;
    const now = new Date().toISOString();
    await Promise.all(targets.map(o => saveOrder({ ...o, paymentStatus, updatedAt: now })));
    toast.success(`Đã đổi thanh toán "${paymentStatus}" cho ${targets.length} đơn.`);
  };
  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    setConfirmBulkDelete(false);
    try {
      await Promise.all(ids.map(id => removeOrder(id)));
      toast.success(`Đã xóa ${ids.length} đơn hàng.`);
      clearSelection();
    } catch {
      toast.error("Xóa hàng loạt thất bại.");
    }
  };

  // Delete an order
  const handleDeleteOrder = async () => {
    if (!confirmOrder) return;
    const ord = confirmOrder;
    setConfirmOrder(null);
    try {
      await removeOrder(ord.id);
      toast.success(`Đã xóa đơn ${ord.orderNumber}.`);
    } catch {
      toast.error("Xóa đơn thất bại.");
    }
  };

  // Autogenerated message confirmation suitable for sending to messaging apps (Telegram, Zalo...)
  const getZaloConfirmationText = (order: Order) => {
    const paymentNotice = order.paymentMethod === "Chuyển khoản"
      ? `🔹 Thanh toán qua chuyển khoản: Ngân hàng Techcombank - STK: 190300123456 - Chuyển khoản nội dung: ${order.orderNumber}`
      : `🔹 Khách hàng lựa chọn thanh toán COD khi nhận hàng.`;

    const itemsText = order.items.map(it => `- ${it.mealName} (Hộp ${it.weight}): x${it.quantity} suất`).join("\n");
    return `MealPrep Healthy Food - XÁC NHẬN ĐƠN HÀNG 💚\n\nKính chào anh/chị ${order.customerName},\nChúng tôi xin xác nhận đơn hàng thành công với thông tin chi tiết dưới đây:\n\n📌 Mã đơn hàng: ${order.orderNumber}\n📅 Ngày dự kiến giao: ${order.deliveryDate}\n📍 Địa chỉ giao: ${order.customerAddress}\n📞 Số điện thoại: ${order.customerPhone}\n\n🛒 Chi tiết phần ăn:\n${itemsText}\n\n💵 Chi tiết thanh toán:\n- Tổng tiền phần ăn: ${formatVND(order.totalAmount)}\n- Phí giao hàng: ${formatVND(order.deliveryFee)}\n- Tổng cộng thanh toán: ${formatVND(order.totalAmount + order.deliveryFee)}\n\n${paymentNotice}\n\nXin cảm ơn quý khách đã tin dùng MealPrep và chúc quý khách một tuần ăn uống thật ngon miệng, khỏe mạnh!`;
  };

  const handleCopyConfirmation = (order: Order) => {
    const text = getZaloConfirmationText(order);
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép mẫu tin nhắn xác nhận đơn (Zalo/SMS)!");
  };

  // Clean printable HTML invoice creator
  const renderHTMLInvoice = (order: Order): string => {
    const itemsRows = order.items.map((it, i) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: left;">${i+1}. ${it.mealName} (${it.weight})</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${it.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${formatVND(it.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: bold;">${formatVND(it.price * it.quantity)}</td>
      </tr>
    `).join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hóa đơn ${order.orderNumber}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff; color: #1e293b; padding: 30px; line-height: 1.5; }
          .header { text-align: center; border-bottom: 3px double #e2e8f0; padding-bottom: 15px; margin-bottom: 25px; }
          .brand { font-size: 24px; font-weight: bold; color: #10b981; text-transform: uppercase; letter-spacing: 1px; }
          .title { font-size: 18px; margin-top: 5px; color: #64748b; font-weight: bold; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 13px; }
          .col { flex: 1; }
          .col-right { text-align: right; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
          .th { background-color: #f8fafc; padding: 10px; font-weight: bold; text-align: left; border-bottom: 2px solid #cbd5e1; }
          .summary { text-align: right; font-size: 13px; margin-top: 15px; }
          .summary-line { padding: 4px 0; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; font-style: italic; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="brand">MealPrep Health Kitchen</div>
          <div class="title">HÓA ĐƠN KHÁCH HÀNG / INVOICE</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">Mã đơn: ${order.orderNumber} | Ngày giao: ${order.deliveryDate}</div>
        </div>

        <div class="grid">
          <div class="col" style="text-align: left;">
            <strong style="color: #475569; font-size: 14px;">KHÁCH HÀNG:</strong><br>
            <strong>Anh/Chị:</strong> ${order.customerName}<br>
            <strong>Điện thoại:</strong> ${order.customerPhone}<br>
            <strong>Địa chỉ:</strong> ${order.customerAddress}
          </div>
          <div class="col col-right" style="text-align: right;">
            <strong style="color: #475569; font-size: 14px;">THÔNG TIN ĐƠN:</strong><br>
            <strong>Hình thức thanh toán:</strong> ${order.paymentMethod}<br>
            <strong>Trạng thái:</strong> <span style="color: ${order.paymentStatus === "Đã thanh toán" ? "#10b981" : "#ef4444"}">${order.paymentStatus}</span><br>
            <strong>Ngày thanh toán:</strong> ${order.paymentStatus === "Đã thanh toán" ? "Đã xác nhận" : "Chờ xác nhận"}
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th class="th" style="text-align: left;">Món ăn / Suất ăn</th>
              <th class="th" style="text-align: center; width: 80px;">SL</th>
              <th class="th" style="text-align: right; width: 110px;">Đơn giá</th>
              <th class="th" style="text-align: right; width: 130px;">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-line">Tiền phần ăn: <strong>${formatVND(order.totalAmount)}</strong></div>
          <div class="summary-line">Phí vận chuyển: <strong>${formatVND(order.deliveryFee)}</strong></div>
          <div class="summary-line" style="font-size: 16px; color: #1e293b; padding-top: 5px; margin-top: 5px; border-top: 1px solid #cbd5e1;">Tổng số tiền thanh toán: <strong style="color: #10b981;">${formatVND(order.totalAmount + order.deliveryFee)}</strong></div>
        </div>

        <div id="notes-view" style="margin-top: 20px; font-size: 12px; text-align: left; background-color: #f8fafc; border-left: 3px solid #10b981; padding: 10px;">
          <strong>Ghi chú đơn hàng:</strong> ${order.notes || "Khách không có ghi chú thêm."}
        </div>

        <div class="footer">
          Cảm ơn quý khách hàng đã lựa chọn thực đơn lành mạnh từ MealPrep!<br>
          <i>Chúc quý khách luôn ngập tràn năng lượng và duy trì vóc dáng như ý!</i>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrintBill = (order: Order) => {
    const html = renderHTMLInvoice(order);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      // wait for stylesheets inside window
      setTimeout(() => {
        win.print();
        win.close();
      }, 500);
    }
  };

  // Upload bill to Google Drive
  const handleSaveToGoogleDrive = async (order: Order) => {
    setDriveUploadStatus({
      status: "loading",
      msg: "Đang tiến hành kết nối & đăng hóa đơn lên Google Drive..."
    });

    const htmlContent = renderHTMLInvoice(order);
    const fileName = `MealPrep_Invoice_${order.orderNumber}_${order.customerName.replace(/\s+/g, "_")}.html`;

    const result = await uploadInvoiceToDrive(fileName, htmlContent);
    if (result.success) {
      setDriveUploadStatus({
        status: "success",
        msg: `Lưu hóa đơn ${order.orderNumber} vào Google Drive thành công!`
      });
      toast.success(`Đã xuất hóa đơn ${order.orderNumber} lên Google Drive!`);
    } else {
      setDriveUploadStatus({
        status: "error",
        msg: `Lỗi: ${result.error || "Không thể thực hiện tác vụ"}`
      });
    }
  };

  // Small sort-direction indicator for table headers
  const SortIcon = ({ colKey }: { colKey?: SortKey }) => {
    if (!colKey || sortKey !== colKey) return <span className="text-slate-300">↕</span>;
    return sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
  };

  const renderStatusSelect = (order: Order) => (
    <select
      value={order.status}
      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order["status"])}
      className={`text-[10px] px-2 py-1 font-bold rounded-lg border focus:outline-none ${
        order.status === "Mới" ? "bg-red-50 text-red-700 border-red-200" :
        order.status === "Đang xử lý" ? "bg-amber-50 text-amber-700 border-amber-200" :
        order.status === "Đang giao" ? "bg-sky-50 text-sky-700 border-sky-200" :
        order.status === "Đã giao" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
        "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      <option value="Mới">Mới nhận</option>
      <option value="Đang xử lý">Đang chế biến</option>
      <option value="Đang giao">Đang giao hàng</option>
      <option value="Đã giao">Đã hoàn tất</option>
      <option value="Đã hủy">Đã hủy bỏ</option>
    </select>
  );

  const renderPaymentSelect = (order: Order) => (
    <>
      <select
        value={order.paymentStatus}
        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as Order["paymentStatus"])}
        className={`text-[10px] px-2 py-1 font-bold rounded-lg border focus:outline-none ${
          order.paymentStatus === "Đã thanh toán" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"
        }`}
      >
        <option value="Chưa thanh toán">Chưa trả</option>
        <option value="Đã thanh toán">Đã trả tiền</option>
      </select>
      <div className="text-[9px] text-slate-400 mt-1 font-medium">{order.paymentMethod}</div>
    </>
  );

  // Render one table cell by column key
  const renderCell = (order: Order, key: ColKey) => {
    switch (key) {
      case "code":
        return (
          <>
            <div id={`order-${order.orderNumber}`} className="font-bold text-indigo-700 text-xs">
              {order.orderNumber}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Giao ngày: <span className="font-semibold text-slate-600">{order.deliveryDate}</span>
            </div>
          </>
        );
      case "customer":
        return (
          <>
            <div className="font-bold text-slate-800">{order.customerName}</div>
            <div className="text-[10px] text-slate-500 font-medium font-mono">{order.customerPhone}</div>
            <div className="text-[10px] text-slate-400 max-w-[150px] truncate mt-0.5" title={order.customerAddress}>
              📍 {order.customerAddress}
            </div>
          </>
        );
      case "items":
        return (
          <>
            <div className="space-y-1">
              {order.items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                  <span className="font-medium">{it.mealName}</span>
                  <span className="bg-slate-100 px-1 py-0.2 text-[9px] rounded font-mono font-bold text-slate-500">
                    {it.weight}
                  </span>
                  <span className="text-slate-400 text-[10px]">x{it.quantity}</span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="text-[10px] text-orange-600 bg-orange-50/50 border-l-2 border-orange-500 px-1.5 py-0.5 mt-2 rounded">
                ✍️ {order.notes}
              </div>
            )}
          </>
        );
      case "total":
        return (
          <>
            <div className="font-bold text-slate-800">{formatVND(order.totalAmount + order.deliveryFee)}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5" title="Doanh thu trừ giá vốn nguyên liệu">
              Lãi gộp: {formatVND(order.totalProfit)}
            </div>
          </>
        );
      case "delivery":
        return renderStatusSelect(order);
      case "payment":
        return renderPaymentSelect(order);
    }
  };

  const cellAlign = (a?: "left" | "right" | "center") =>
    a === "right" ? "text-right" : a === "center" ? "text-center" : "text-left";

  return (
    <div className="space-y-6">
      <StatStrip stats={stats} />

      {/* Search and control row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Tìm kiếm: Mã đơn, tên, điện thoại..."
            value={computedSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 bg-slate-50 text-slate-700 outline-none"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        </div>

        {/* Filter dropdown · Column picker · Add order button */}
        <div className="w-full sm:w-auto flex flex-wrap gap-2.5 justify-end">
          {/* Multi-field filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "filter" ? null : "filter")}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Lọc</span>
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white rounded-full text-[9px] font-bold px-1.5 py-0.5 leading-none">{activeFilterCount}</span>
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
            {openMenu === "filter" && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4 space-y-3">
                <FilterGroup title="Giao hàng" options={DELIVERY_STATUSES} selected={filters.status} onToggle={(v) => toggleFilter("status", v)} />
                <FilterGroup title="Thanh toán" options={PAYMENT_STATUSES} selected={filters.paymentStatus} onToggle={(v) => toggleFilter("paymentStatus", v)} />
                <FilterGroup title="Hình thức TT" options={PAYMENT_METHODS} selected={filters.paymentMethod} onToggle={(v) => toggleFilter("paymentMethod", v)} />
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setFilters({ status: [], paymentStatus: [], paymentMethod: [] })}
                    className="text-[11px] font-bold text-slate-500 hover:text-red-600"
                  >
                    Xóa lọc
                  </button>
                  <button onClick={() => setOpenMenu(null)} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">Xong</button>
                </div>
              </div>
            )}
          </div>

          {/* Column picker dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenMenu(openMenu === "cols" ? null : "cols")}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Cột</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {openMenu === "cols" && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-3 space-y-1.5">
                {COLUMNS.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 text-xs text-slate-700 font-medium px-1.5 py-1 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCols[col.key]}
                      onChange={() => setVisibleCols((p) => ({ ...p, [col.key]: !p[col.key] }))}
                      className="accent-indigo-600"
                    />
                    {COL_LABELS[col.key]}
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            id="btn-trigger-add-order"
            onClick={() => { resetOrderForm(); setShowAddModal(true); }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-transform cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Lên đơn hàng mới
          </button>
        </div>
      </div>

      {/* Click-away overlay for dropdown menus */}
      {openMenu && <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />}

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 px-4 py-3 rounded-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="text-xs font-bold text-indigo-800 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Đã chọn {selectedIds.size} đơn
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value=""
                onChange={(e) => { if (e.target.value) bulkUpdateStatus(e.target.value as Order["status"]); }}
                className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="">↳ Đổi giao hàng…</option>
                {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value=""
                onChange={(e) => { if (e.target.value) bulkUpdatePayment(e.target.value as Order["paymentStatus"]); }}
                className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 bg-white font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="">↳ Đổi thanh toán…</option>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {isAdmin && (
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-red-600 border border-red-200 bg-white hover:bg-red-50 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              )}
              <button onClick={clearSelection} className="text-[11px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5">Bỏ chọn</button>
            </div>
          </div>

          {/* Aggregate summary of selected orders */}
          <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-indigo-200/70 text-[11px] font-semibold">
            <span className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1 text-slate-600">
              Tổng tiền: <strong className="text-indigo-700">{formatVND(selectionSummary.grand)}</strong>
            </span>
            <span className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1 text-slate-600">
              Lãi gộp: <strong className="text-emerald-600">{formatVND(selectionSummary.profit)}</strong>
            </span>
            <span className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1 text-slate-600">
              Thanh toán: <strong className="text-emerald-600">{selectionSummary.paid} đã</strong> · <strong className="text-orange-600">{selectionSummary.unpaid} chưa</strong>
            </span>
            <span className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1 text-slate-600">
              Giao hàng: <strong className="text-emerald-600">{selectionSummary.delivered} đã</strong> · <strong className="text-sky-600">{selectionSummary.undelivered} chưa</strong>
            </span>
            <span className="bg-white border border-indigo-100 rounded-lg px-2.5 py-1 text-slate-600">
              Món: <strong className="text-slate-800">{selectionSummary.dishes}</strong> · Combo: <strong className="text-slate-800">{selectionSummary.combos}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Grid of existing orders or empty view */}
      {sortedOrders.length === 0 ? (
        <div id="no-orders-banner" className="bg-white border border-slate-100 px-6 py-12 text-center rounded-xl">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h4 className="font-bold text-slate-800 text-sm">Chưa có thông tin đơn hàng</h4>
          <p className="text-slate-400 text-xs mt-1">Sử dụng thanh công cụ tìm kiếm hoặc bấm &apos;Lên đơn hàng mới&apos; để bắt đầu bán hàng.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAllPage}
                      className="accent-indigo-600 cursor-pointer"
                      title="Chọn tất cả đơn trên trang"
                    />
                  </th>
                  {COLUMNS.filter((c) => visibleCols[c.key]).map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.sortKey)}
                      className={`py-3 px-4 ${cellAlign(col.align)} ${col.sortKey ? "cursor-pointer select-none hover:text-slate-700" : ""}`}
                    >
                      <span className={`inline-flex items-center gap-1 ${col.align === "right" ? "flex-row-reverse" : ""}`}>
                        {col.label}
                        {col.sortKey && <SortIcon colKey={col.sortKey} />}
                      </span>
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagedOrders.map(order => {
                  const editable = isAdmin && order.status !== "Đã hủy";
                  return (
                    <tr key={order.id} className={`hover:bg-slate-50/70 transition-colors ${selectedIds.has(order.id) ? "bg-indigo-50/40" : ""}`}>
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          className="accent-indigo-600 cursor-pointer"
                        />
                      </td>
                      {COLUMNS.filter((c) => visibleCols[c.key]).map((col) => (
                        <td key={col.key} className={`py-4 px-4 ${cellAlign(col.align)} ${col.key === "code" ? "font-medium text-slate-800" : ""}`}>
                          {renderCell(order, col.key)}
                        </td>
                      ))}
                      <td className="py-4 px-4 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => { setSelectedOrder(order); setShowBillModal(true); }}
                            className="p-1 px-2 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-indigo-600 rounded-lg flex items-center gap-1.5 text-[10px] font-bold"
                            title="Xem xuất hóa đơn & xác nhận"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ra Bill / Drive
                          </button>
                          {editable && (
                            <button
                              onClick={() => openEditModal(order)}
                              className="p-1 px-2 border border-slate-200 hover:border-indigo-300 text-slate-500 hover:text-indigo-600 rounded-lg flex items-center gap-1.5 text-[10px] font-bold"
                              title="Sửa đơn hàng"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setConfirmOrder(order)}
                              className="p-1 px-2 border border-slate-200 hover:border-red-300 text-slate-500 hover:text-red-600 rounded-lg flex items-center gap-1.5 text-[10px] font-bold"
                              title="Xóa đơn hàng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white font-semibold text-slate-700 outline-none cursor-pointer"
              >
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <span>/ trang · Tổng {sortedOrders.length} đơn</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
              <span>
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedOrders.length)} / {sortedOrders.length}
              </span>
              <button
                disabled={currentPage <= 1}
                onClick={() => setPage(currentPage - 1)}
                className="p-1 border border-slate-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-1">Trang {currentPage}/{totalPages}</span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setPage(currentPage + 1)}
                className="p-1 border border-slate-200 rounded-lg bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT ORDER */}
      {showAddModal && (
        <div id="add-order-modal-backdrop" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-3xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {editingOrderId ? "Sửa đơn hàng MealPrep" : "Lên đơn hàng MealPrep mới"}
                </h3>
              </div>
              <button onClick={resetOrderForm} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSaveOrder} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Section A: Customer Details */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-slate-700 tracking-tight border-b pb-1">1. Thông tin Khách hàng</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Select profile */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Chọn hồ sơ khách hàng</label>
                    <select
                      value={newOrderCustomerId}
                      onChange={(e) => handleCustomerSelection(e.target.value)}
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 outline-none bg-white font-semibold text-slate-700 rounded-lg p-2"
                    >
                      <option value="">-- Tạo mới thông tin khách hàng --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                      ))}
                      <option value="NEW">+ Khách hàng vãng lai (Gõ tay)</option>
                    </select>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Họ tên khách hàng *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={tempCustomerName}
                      onChange={(e) => setTempCustomerName(e.target.value)}
                      disabled={newOrderCustomerId !== "" && newOrderCustomerId !== "NEW"}
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg p-2 bg-white text-slate-800 outline-none disabled:bg-slate-100"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      required
                      placeholder="0912..."
                      value={tempCustomerPhone}
                      onChange={(e) => setTempCustomerPhone(e.target.value)}
                      disabled={newOrderCustomerId !== "" && newOrderCustomerId !== "NEW"}
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg p-2 bg-white text-slate-800 outline-none disabled:bg-slate-100"
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Địa chỉ giao hàng *</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Nguyễn Huệ, Quận 1"
                      value={tempCustomerAddress}
                      onChange={(e) => setTempCustomerAddress(e.target.value)}
                      disabled={newOrderCustomerId !== "" && newOrderCustomerId !== "NEW"}
                      className="w-full text-xs border border-slate-200 focus:border-indigo-500 rounded-lg p-2 bg-white text-slate-800 outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Section B: Choose Meal Meals */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-slate-700 tracking-tight border-b pb-1">2. Chọn món cơm MealPrep & Bảng giá</h4>

                {/* Selection helper row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-white p-3 border border-slate-100 rounded-lg">
                  {/* Meal list */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Tên món</label>
                    <select
                      value={currentMealId}
                      onChange={(e) => handleMealSelectionChange(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-700"
                    >
                      <option value="">-- Tìm chọn suất cơm --</option>
                      {meals.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.category} - {m.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weight Option */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">Đóng gói</label>
                    <select
                      value={currentWeight}
                      onChange={(e) => setCurrentWeight(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
                    >
                      <option value="">-- Trọng lượng --</option>
                      {currentMealId && meals.find(m => m.id === currentMealId)?.options.map(opt => (
                        <option key={opt.weight} value={opt.weight}>
                          {opt.weight} ({formatVND(opt.price).replace("₫", "")})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity & Add button */}
                  <div className="flex gap-2">
                    <div className="w-16">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={currentQty}
                        onChange={(e) => setCurrentQty(Math.max(1, Number(e.target.value)))}
                        className="w-full text-xs border border-slate-200 p-1.5 rounded-lg text-center font-bold text-slate-700 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      id="btn-add-line-item"
                      onClick={addSubItemToDraft}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2.5 px-3 rounded-lg text-xs shrink-0 self-end cursor-pointer"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* Sub-items table */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100">
                      <tr>
                        <th className="p-2 border-r">Tên Suất ăn</th>
                        <th className="p-2 border-r text-center">Đóng gói</th>
                        <th className="p-2 border-r text-center">SL</th>
                        <th className="p-2 border-r text-right">Đơn giá</th>
                        <th className="p-2 border-r text-right">Thành tiền</th>
                        <th className="p-2 text-center" style={{ width: "60px" }}>Xóa</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-6 text-slate-400 font-medium">
                            Chưa có phần cơm nào được đưa vào giỏ hàng của đơn.
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-semibold text-slate-800">{item.mealName}</td>
                            <td className="p-2.5 text-center font-bold text-slate-500">{item.weight}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-slate-800">{item.quantity}</td>
                            <td className="p-2.5 text-right text-slate-600">{formatVND(item.price)}</td>
                            <td className="p-2.5 text-right font-bold text-slate-800">{formatVND(item.price * item.quantity)}</td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => removeSubItemFromDraft(idx)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-4 h-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {orderItems.length > 0 && (
                  <div className="flex justify-end p-2 bg-white rounded-lg border border-slate-100 text-xs text-slate-700">
                    <div>
                      Cộng tiền món ăn: <strong className="text-indigo-700 text-sm font-bold">{formatVND(draftTotals.priceSum)}</strong>
                      <span className="text-emerald-600 font-semibold ml-3">(Lãi dự chi: {formatVND(draftTotals.profitSum)})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section C: Shipment & Billing configs */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                <h4 className="font-bold text-xs text-slate-700 tracking-tight border-b pb-1">3. Cấu hình vận chuyển & Thanh toán</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Delivery Day */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ngày giao cơm hàng tuần</label>
                    <input
                      type="date"
                      required
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-semibold text-slate-700"
                    />
                  </div>

                  {/* Delivery Fee */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Phí giao hàng (VND)</label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Hình thức thanh toán</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as "COD" | "Chuyển khoản" | "Tiền mặt")}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
                    >
                      <option value="Chuyển khoản">Chuyển khoản</option>
                      <option value="COD">Thu tiền mặt (COD)</option>
                      <option value="Tiền mặt">Tiền mặt tại quầy</option>
                    </select>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Trạng thái thanh toán của khách</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as "Chưa thanh toán" | "Đã thanh toán")}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none font-bold text-slate-700"
                    >
                      <option value="Chưa thanh toán">Chờ thanh toán (Chưa trả)</option>
                      <option value="Đã thanh toán">Đã hoàn tất thanh toán</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">Ghi chú chuẩn bị (như không hành tây, cay...)</label>
                    <input
                      type="text"
                      placeholder="Ghi chú sở thích của khách hàng về gia vị, nguyên liệu..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs border border-slate-200 p-2 rounded-lg bg-white outline-none text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={resetOrderForm}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Đóng/Hủy
                </button>
                <button
                  type="submit"
                  id="btn-sub-save-order"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition-transform cursor-pointer"
                >
                  {submitting ? "Đang lưu…" : editingOrderId ? "Cập nhật đơn hàng" : "Xác nhận lưu đơn hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOrder !== null}
        title="Xóa đơn hàng?"
        message={`Đơn ${confirmOrder?.orderNumber ?? ""} sẽ bị xóa vĩnh viễn cùng chi tiết đơn. Hành động không thể hoàn tác.`}
        confirmLabel="Xóa đơn"
        onConfirm={handleDeleteOrder}
        onCancel={() => setConfirmOrder(null)}
      />

      <ConfirmDialog
        open={confirmBulkDelete}
        title="Xóa nhiều đơn hàng?"
        message={`${selectedIds.size} đơn đã chọn sẽ bị xóa vĩnh viễn cùng chi tiết đơn. Hành động không thể hoàn tác.`}
        confirmLabel={`Xóa ${selectedIds.size} đơn`}
        onConfirm={handleBulkDelete}
        onCancel={() => setConfirmBulkDelete(false)}
      />

      {/* MODAL 2: BILL PREVIEW & CONFIRMATIONS */}
      {showBillModal && selectedOrder && (
        <div id="bill-view-modal-backdrop" className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white border rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">XUẤT HÓA ĐƠN & drive</h3>
              </div>
              <button onClick={() => { setSelectedOrder(null); setShowBillModal(false); setDriveUploadStatus({ status: "idle", msg: "" }); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Drive backing, printed invoice instructions */}
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-indigo-900 text-xs">Phát hành hóa đơn / Ra Bill</h4>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Bạn có thể in hóa đơn bán hàng để đính kèm lên hộp cơm MealPrep, hoặc tự động xuất lưu trữ lên Google Drive.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      id="btn-trigger-print-win"
                      onClick={() => handlePrintBill(selectedOrder)}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      In hóa đơn bán hàng (A4/A5)
                    </button>

                    {/* Google Drive Trigger */}
                    <button
                      id="btn-trigger-drive-save"
                      onClick={() => handleSaveToGoogleDrive(selectedOrder)}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      Tải lên Google Drive
                    </button>
                  </div>
                </div>

                {/* Status indicator on drive sync */}
                {driveUploadStatus.status !== "idle" && (
                  <div className={`p-3 rounded-xl border text-[11px] font-medium ${
                    driveUploadStatus.status === "loading" ? "bg-amber-50 border-amber-200 text-amber-800 animate-pulse" :
                    driveUploadStatus.status === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
                    "bg-red-50 border-red-200 text-red-800"
                  }`}>
                    {driveUploadStatus.msg}
                  </div>
                )}

                {/* Zalo / Message format confirmation templates */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-700 text-xs">Mẫu tin nhắn gửi khách hàng</h4>
                    <button
                      id="btn-copy-template-text"
                      type="button"
                      onClick={() => handleCopyConfirmation(selectedOrder)}
                      className="flex items-center gap-1 text-[10px] fg-indigo-600 font-bold hover:text-indigo-800"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      Sao chép mẫu
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={getZaloConfirmationText(selectedOrder)}
                    className="w-full h-36 border border-slate-200 rounded-lg p-2.5 outline-none font-mono text-[10px] text-slate-600 bg-white"
                  />
                </div>
              </div>

              {/* Right Column: Mini Bill View representation */}
              <div className="bg-slate-100 p-4 rounded-xl border border-dashed border-slate-300 max-h-[60vh] overflow-y-auto">
                <div className="bg-white p-4 shadow-sm space-y-4 text-[11px] text-slate-800 font-sans text-left">
                  <div className="text-center font-bold text-slate-900 border-b pb-2">
                    <h5 className="text-sm font-bold text-emerald-600 uppercase">MEALPREP HEALTHY</h5>
                    <p className="text-[9px] text-slate-400">Suất Ăn Lành Mạnh • Tinh Tế</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-1">Mã đơn: {selectedOrder.orderNumber}</p>
                  </div>

                  <div className="space-y-1">
                    <div><strong>Họ tên:</strong> {selectedOrder.customerName}</div>
                    <div><strong>SĐT:</strong> {selectedOrder.customerPhone}</div>
                    <div className="truncate"><strong>Địa chỉ:</strong> {selectedOrder.customerAddress}</div>
                    <div><strong>Giao ngày:</strong> {selectedOrder.deliveryDate}</div>
                  </div>

                  {/* Sub-items mini table */}
                  <div className="border-t border-b py-2 space-y-1.5 label text-[10px]">
                    {selectedOrder.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-start">
                        <span>{it.quantity} x {it.mealName} ({it.weight})</span>
                        <span className="font-mono">{formatVND(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span>Cộng tiền cơm:</span>
                      <span className="font-mono">{formatVND(selectedOrder.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí giao nhận:</span>
                      <span className="font-mono">{formatVND(selectedOrder.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-double pt-1.5 text-slate-900 font-bold">
                      <span>TỔNG CỘNG:</span>
                      <span className="font-mono text-emerald-600 text-xs">{formatVND(selectedOrder.totalAmount + selectedOrder.deliveryFee)}</span>
                    </div>
                    <div className="text-slate-400 font-normal text-[9px] text-center mt-3">
                      Hình thức: {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex justify-end bg-slate-50 rounded-b-2xl">
              <button
                id="btn-close-invoice"
                onClick={() => { setSelectedOrder(null); setShowBillModal(false); setDriveUploadStatus({ status: "idle", msg: "" }); }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs py-2 px-4 rounded-lg cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable filter checkbox group for the filter dropdown.
function FilterGroup({ title, options, selected, onToggle }: {
  title: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onToggle(opt)}
              className={`text-[10px] font-semibold px-2 py-1 rounded-lg border cursor-pointer ${
                active ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
