"use client";

import { useMemo, useState } from "react";
import { Order, Customer, OrderDetail } from "../../data/mealPrepData";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/components/ui/Toast";

const tomorrow = () => new Date(Date.now() + 86400000).toISOString().split("T")[0];

/**
 * Holds all state + business logic for drafting / editing a single order.
 * Shared by the desktop modal (OrderManagement) and the mobile "Lên đơn" page.
 * `save()` returns the persisted Order on success, or null on validation/IO failure.
 */
export function useOrderDraft() {
  const { orders, customers, meals, saveOrder, saveCustomer } = useData();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  // Customer fields (also used as temp fields for walk-in customers).
  const [newOrderCustomerId, setNewOrderCustomerId] = useState("");
  const [tempCustomerName, setTempCustomerName] = useState("");
  const [tempCustomerPhone, setTempCustomerPhone] = useState("");
  const [tempCustomerAddress, setTempCustomerAddress] = useState("");
  const [tempCustomerEmail, setTempCustomerEmail] = useState("");

  // Shipment & billing.
  const [deliveryFee, setDeliveryFee] = useState(30000);
  const [paymentMethod, setPaymentMethod] = useState<Order["paymentMethod"]>("Chuyển khoản");
  const [paymentStatus, setPaymentStatus] = useState<Order["paymentStatus"]>("Chưa thanh toán");
  const [deliveryDate, setDeliveryDate] = useState(tomorrow());
  const [notes, setNotes] = useState("");

  // Draft line items + the "add item" selector row.
  const [orderItems, setOrderItems] = useState<OrderDetail[]>([]);
  const [currentMealId, setCurrentMealId] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [currentQty, setCurrentQty] = useState(1);

  const draftTotals = useMemo(() => {
    let priceSum = 0;
    let costSum = 0;
    orderItems.forEach((item) => {
      priceSum += item.price * item.quantity;
      costSum += item.cost * item.quantity;
    });
    return { priceSum, costSum, profitSum: priceSum - costSum };
  }, [orderItems]);

  const handleCustomerSelection = (id: string) => {
    setNewOrderCustomerId(id);
    if (id !== "NEW") {
      const cust = customers.find((c) => c.id === id);
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

  const handleMealSelectionChange = (mealId: string) => {
    setCurrentMealId(mealId);
    const meal = meals.find((m) => m.id === mealId);
    setCurrentWeight(meal && meal.options.length > 0 ? meal.options[0].weight : "");
  };

  const addSubItemToDraft = () => {
    if (!currentMealId || !currentWeight) return;
    const meal = meals.find((m) => m.id === currentMealId);
    if (!meal) return;
    const option = meal.options.find((o) => o.weight === currentWeight);
    if (!option) return;

    const existingIndex = orderItems.findIndex(
      (it) => it.mealId === currentMealId && it.weight === currentWeight,
    );
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += currentQty;
      setOrderItems(updated);
    } else {
      setOrderItems([
        ...orderItems,
        {
          mealId: meal.id,
          mealName: meal.name,
          weight: currentWeight,
          quantity: currentQty,
          price: option.price,
          cost: option.cost,
        },
      ]);
    }
    setCurrentMealId("");
    setCurrentWeight("");
    setCurrentQty(1);
  };

  const removeSubItemFromDraft = (idx: number) =>
    setOrderItems(orderItems.filter((_, i) => i !== idx));

  const reset = () => {
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
    setDeliveryDate(tomorrow());
    setNotes("");
    setCurrentMealId("");
    setCurrentWeight("");
    setCurrentQty(1);
  };

  /** Pre-fill the draft from an existing order (edit mode). */
  const loadOrder = (order: Order) => {
    setEditingOrderId(order.id);
    const linked = customers.find((c) => c.id === order.customerId);
    setNewOrderCustomerId(linked ? order.customerId : "NEW");
    setTempCustomerName(order.customerName);
    setTempCustomerPhone(order.customerPhone);
    setTempCustomerAddress(order.customerAddress);
    setTempCustomerEmail(linked?.email ?? "");
    setOrderItems(order.items.map((it) => ({ ...it })));
    setDeliveryFee(order.deliveryFee);
    setPaymentMethod(order.paymentMethod);
    setPaymentStatus(order.paymentStatus);
    setDeliveryDate(order.deliveryDate);
    setNotes(order.notes ?? "");
  };

  /** Validate + persist the draft. Returns the saved Order, or null on failure. */
  const save = async (): Promise<Order | null> => {
    if (orderItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 món ăn vào đơn hàng!");
      return null;
    }

    // ----- EDIT MODE -----
    if (editingOrderId) {
      const existing = orders.find((o) => o.id === editingOrderId);
      if (!existing) {
        toast.error("Không tìm thấy đơn để cập nhật.");
        return null;
      }
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
        return updated;
      } catch {
        toast.error("Cập nhật đơn hàng thất bại. Vui lòng thử lại.");
        return null;
      } finally {
        setSubmitting(false);
      }
    }

    // ----- CREATE MODE -----
    let customerIdToLink = newOrderCustomerId;
    let custName = tempCustomerName;
    let custPhone = tempCustomerPhone;
    let custAddress = tempCustomerAddress;

    if (newOrderCustomerId === "NEW" || !newOrderCustomerId) {
      if (!tempCustomerName || !tempCustomerPhone) {
        toast.error("Vui lòng điền tên và số điện thoại của khách hàng!");
        return null;
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
        createdAt: new Date().toISOString().split("T")[0],
      };
      setSubmitting(true);
      try {
        await saveCustomer(newCust);
      } catch {
        setSubmitting(false);
        toast.error("Lưu khách hàng thất bại.");
        return null;
      }
      customerIdToLink = newCustId;
    } else {
      const existing = customers.find((c) => c.id === customerIdToLink);
      if (existing) {
        custName = existing.name;
        custPhone = existing.phone;
        custAddress = existing.address;
      }
    }

    const uniqueNumber = `MP-${new Date().toISOString().replace(/[-:T]/g, "").slice(0, 8)}-${Math.floor(
      Math.random() * 900 + 100,
    )}`;
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
      notes,
    };

    setSubmitting(true);
    try {
      await saveOrder(newOrder);
      toast.success(`Đã lên đơn ${newOrder.orderNumber} thành công!`);
      return newOrder;
    } catch {
      toast.error("Lưu đơn hàng thất bại. Vui lòng thử lại.");
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    meals,
    customers,
    submitting,
    editingOrderId,
    // customer
    newOrderCustomerId,
    tempCustomerName,
    setTempCustomerName,
    tempCustomerPhone,
    setTempCustomerPhone,
    tempCustomerAddress,
    setTempCustomerAddress,
    // billing
    deliveryFee,
    setDeliveryFee,
    paymentMethod,
    setPaymentMethod,
    paymentStatus,
    setPaymentStatus,
    deliveryDate,
    setDeliveryDate,
    notes,
    setNotes,
    // items
    orderItems,
    currentMealId,
    currentWeight,
    setCurrentWeight,
    currentQty,
    setCurrentQty,
    draftTotals,
    // actions
    handleCustomerSelection,
    handleMealSelectionChange,
    addSubItemToDraft,
    removeSubItemFromDraft,
    reset,
    loadOrder,
    save,
  };
}

export type OrderDraft = ReturnType<typeof useOrderDraft>;
