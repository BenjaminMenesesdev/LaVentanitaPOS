// ---- Definición central de roles y permisos ----
export const ROLES = { ADMIN: "admin", OPERADOR: "operador", AUDITORIA: "auditoria" };

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Administración",
  [ROLES.OPERADOR]: "Operador",
  [ROLES.AUDITORIA]: "Auditoría",
};

export const NAV_BY_ROLE = {
  [ROLES.ADMIN]: ["pos", "inventario", "dashboard", "usuarios"],
  [ROLES.OPERADOR]: ["pos", "inventario"],
  [ROLES.AUDITORIA]: ["inventario", "dashboard"],
};

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    posEdit: true,
    posVoid: true,
    inventoryRead: true,
    inventoryPurchase: true,
    inventoryTransfer: true,
    inventoryWaste: true,
    inventoryDelete: true,
    dashboardRead: true,
    dashboardFinancials: true,
    manageUsers: true,
    requiresDoubleConfirmOnDelete: true,
  },
  [ROLES.OPERADOR]: {
    posEdit: true,
    posVoid: false,
    inventoryRead: true,
    inventoryPurchase: true,
    inventoryTransfer: false,
    inventoryWaste: false,
    inventoryDelete: false,
    dashboardRead: false,
    dashboardFinancials: false,
    manageUsers: false,
    requiresDoubleConfirmOnDelete: false,
  },
  [ROLES.AUDITORIA]: {
    posEdit: false,
    posVoid: false,
    inventoryRead: true,
    inventoryPurchase: false,
    inventoryTransfer: false,
    inventoryWaste: false,
    inventoryDelete: false,
    dashboardRead: true,
    dashboardFinancials: true,
    manageUsers: false,
    requiresDoubleConfirmOnDelete: false,
  },
};

export function canAccessView(role, view) {
  return (NAV_BY_ROLE[role] || []).includes(view);
}

export function permissionsFor(role) {
  return PERMISSIONS[role] || PERMISSIONS[ROLES.OPERADOR];
}
