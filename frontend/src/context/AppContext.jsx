import { createContext, useContext, useReducer, useRef, useCallback, useEffect } from "react";
import {
  INITIAL_STOCK,
  SEED_TODAY_SALES,
  SEED_MOVEMENTS,
  PAYMENT_METHODS,
} from "../data/data.js";
import { fetchProducts, fetchDashboard, fetchInventoryAlerts, fetchMe } from "../services/api.js";
import { permissionsFor } from "../roles.js";

function newOrder(id) {
  return { id, startedAt: new Date(), client: "", items: [] };
}

function loadStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialState = {
  user: loadStoredUser(),
  authLoading: true,
  orderCounter: 118426,
  openOrders: [newOrder(118426)],
  activeOrderId: 118426,
  stock: INITIAL_STOCK.map((i) => ({ ...i, log: [] })),
  products: [],
  dashboard: { total: 0, count: 0 },
  alerts: [],
  sales: SEED_TODAY_SALES,
  movements: SEED_MOVEMENTS,
  toast: null,
};

function getActiveOrder(state) {
  return state.openOrders.find((o) => o.id === state.activeOrderId) || null;
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.user, authLoading: false };
    case "LOGOUT":
      return { ...state, user: null, authLoading: false };
    case "AUTH_DONE_LOADING":
      return { ...state, authLoading: false };

    case "NEW_ORDER": {
      const id = state.orderCounter + 1;
      const order = newOrder(id);
      return {
        ...state,
        orderCounter: state.orderCounter + 1,
        openOrders: [...state.openOrders, order],
        activeOrderId: id,
      };
    }
    case "SET_ACTIVE_ORDER":
      return { ...state, activeOrderId: action.orderId };
    case "SET_ORDER_CLIENT":
      return {
        ...state,
        openOrders: state.openOrders.map((o) => (o.id === action.orderId ? { ...o, client: action.client } : o)),
      };
    case "ADD_ITEM": {
      return {
        ...state,
        openOrders: state.openOrders.map((o) => {
          if (o.id !== action.orderId) return o;
          const existing = o.items.find(
            (it) => it.name === action.name && JSON.stringify(it.flavors) === JSON.stringify(action.flavors || null)
          );
          if (existing) {
            return { ...o, items: o.items.map((it) => (it === existing ? { ...it, qty: it.qty + 1 } : it)) };
          }
          const cartId = Date.now() + Math.random();
          return {
            ...o,
            items: [
              ...o.items,
              {
                cartId,
                productId: action.productId ?? null,
                name: action.name,
                price: action.price,
                qty: 1,
                flavors: action.flavors || null,
              },
            ],
          };
        }),
      };
    }
    case "UPDATE_ITEM_QTY":
      return {
        ...state,
        openOrders: state.openOrders.map((o) => {
          if (o.id !== action.orderId) return o;
          return {
            ...o,
            items: o.items
              .map((it) => (it.cartId === action.cartId ? { ...it, qty: it.qty + action.delta } : it))
              .filter((it) => it.qty > 0),
          };
        }),
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        openOrders: state.openOrders.map((o) =>
          o.id === action.orderId ? { ...o, items: o.items.filter((it) => it.cartId !== action.cartId) } : o
        ),
      };
    case "CANCEL_ORDER": {
      let openOrders = state.openOrders.filter((o) => o.id !== action.orderId);
      let orderCounter = state.orderCounter;
      let activeOrderId = state.activeOrderId;
      if (openOrders.length === 0) {
        orderCounter += 1;
        const id = orderCounter;
        openOrders = [newOrder(id)];
        activeOrderId = id;
      } else if (activeOrderId === action.orderId) {
        activeOrderId = openOrders[0].id;
      }
      return { ...state, openOrders, orderCounter, activeOrderId };
    }
    case "COMPLETE_SALE": {
      const order = state.openOrders.find((o) => o.id === action.orderId);
      if (!order || order.items.length === 0) return state;
      const method = PAYMENT_METHODS.find((m) => m.id === action.method);
      const total = order.items.reduce((sum, it) => sum + it.qty * it.price, 0);
      const commission = method ? total * method.commission : 0;
      const net = total - commission;
      const sale = {
        id: `V-${order.id.toString().replace(",", "")}`,
        time: new Date(),
        client: order.client,
        items: order.items.map((it) => ({ name: it.name, price: it.price, qty: it.qty })),
        method: action.method,
        total,
        commission,
        net,
      };
      const stock = state.stock.map((s) => ({ ...s }));
      order.items.forEach((it) => {
        if (it.flavors) {
          it.flavors.forEach((flavor) => {
            const stockItem = stock.find((s) => s.flavor === flavor);
            if (stockItem) stockItem.vitrina = Math.max(0, stockItem.vitrina - it.qty);
          });
        }
      });
      let openOrders = state.openOrders.filter((o) => o.id !== order.id);
      let orderCounter = state.orderCounter;
      let activeOrderId = state.activeOrderId;
      if (openOrders.length === 0) {
        orderCounter += 1;
        const id = orderCounter;
        openOrders = [newOrder(id)];
        activeOrderId = id;
      } else if (activeOrderId === order.id) {
        activeOrderId = openOrders[0].id;
      }
      return { ...state, openOrders, orderCounter, activeOrderId, stock, sales: [sale, ...state.sales] };
    }

    case "SET_PRODUCTS":
      return { ...state, products: action.products };
    case "SET_DASHBOARD":
      return { ...state, dashboard: action.dashboard };
    case "SET_ALERTS":
      return { ...state, alerts: action.alerts };

    case "PURCHASE": {
      const stock = state.stock.map((s) =>
        s.id === action.itemId
          ? {
              ...s,
              bodega: s.bodega + action.qty,
              log: [{ type: "Compra", text: `+${action.qty} ${s.unit} a bodega`, time: new Date() }, ...s.log],
            }
          : s
      );
      const item = stock.find((s) => s.id === action.itemId);
      const movement = {
        id: `M-${Date.now()}`,
        time: new Date(),
        type: "Compra",
        itemName: item.name,
        text: `+${action.qty} ${item.unit} a bodega`,
      };
      return { ...state, stock, movements: [movement, ...state.movements] };
    }
    case "TRANSFER": {
      const current = state.stock.find((s) => s.id === action.itemId);
      if (!current || action.qty <= 0 || action.qty > current.bodega) return state;
      const stock = state.stock.map((s) =>
        s.id === action.itemId
          ? {
              ...s,
              bodega: s.bodega - action.qty,
              vitrina: s.vitrina + action.qty,
              log: [{ type: "Traslado", text: `${action.qty} ${s.unit} bodega → vitrina`, time: new Date() }, ...s.log],
            }
          : s
      );
      const movement = {
        id: `M-${Date.now()}`,
        time: new Date(),
        type: "Traslado",
        itemName: current.name,
        text: `${action.qty} ${current.unit} bodega → vitrina`,
      };
      return { ...state, stock, movements: [movement, ...state.movements] };
    }
    case "WASTE": {
      const current = state.stock.find((s) => s.id === action.itemId);
      if (!current) return state;
      const available = action.location === "vitrina" ? current.vitrina : current.bodega;
      if (action.qty <= 0 || action.qty > available) return state;
      const stock = state.stock.map((s) => {
        if (s.id !== action.itemId) return s;
        const next = { ...s };
        if (action.location === "vitrina") next.vitrina -= action.qty;
        else next.bodega -= action.qty;
        next.log = [
          { type: "Merma", text: `-${action.qty} ${s.unit} (${action.reason}) — ${action.location}`, time: new Date() },
          ...s.log,
        ];
        return next;
      });
      const movement = {
        id: `M-${Date.now()}`,
        time: new Date(),
        type: "Merma",
        itemName: current.name,
        text: `-${action.qty} ${current.unit} (${action.reason}) — ${action.location}`,
      };
      return { ...state, stock, movements: [movement, ...state.movements] };
    }

    case "SHOW_TOAST":
      return { ...state, toast: action.message };
    case "HIDE_TOAST":
      return { ...state, toast: null };
    default:
      return state;
  }
}

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    dispatch({ type: "SHOW_TOAST", message });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => dispatch({ type: "HIDE_TOAST" }), 2400);
  }, []);

  const login = useCallback((user, tokens) => {
    localStorage.setItem("user", JSON.stringify(user));
    if (tokens?.access_token) localStorage.setItem("access_token", tokens.access_token);
    if (tokens?.refresh_token) localStorage.setItem("refresh_token", tokens.refresh_token);
    dispatch({ type: "SET_USER", user });
  }, []);

  const logoutLocal = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    dispatch({ type: "LOGOUT" });
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        dispatch({ type: "AUTH_DONE_LOADING" });
        return;
      }
      try {
        const me = await fetchMe();
        dispatch({ type: "SET_USER", user: me });
      } catch {
        logoutLocal();
      }
    }
    restoreSession();
  }, [logoutLocal]);

  useEffect(() => {
    if (!state.user) return;
    async function loadBackendData() {
      try {
        const productsResponse = await fetchProducts();
        dispatch({ type: "SET_PRODUCTS", products: productsResponse.data ?? productsResponse });
      } catch (error) {
        console.error("Error cargando productos desde backend", error);
      }
      if (!permissionsFor(state.user.role).dashboardRead) return;
      try {
        const dashboardResponse = await fetchDashboard();
        dispatch({ type: "SET_DASHBOARD", dashboard: dashboardResponse });
      } catch (error) {
        console.error("Error cargando dashboard desde backend", error);
      }
      try {
        const alertsResponse = await fetchInventoryAlerts();
        dispatch({ type: "SET_ALERTS", alerts: alertsResponse });
      } catch (error) {
        console.error("Error cargando alertas de inventario", error);
      }
    }
    loadBackendData();
  }, [state.user]);

  return (
    <AppStateContext.Provider value={{ ...state, activeOrder: getActiveOrder(state) }}>
      <AppDispatchContext.Provider value={{ dispatch, showToast, login, logoutLocal }}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppProvider");
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error("useAppDispatch must be used within AppProvider");
  return ctx;
}
