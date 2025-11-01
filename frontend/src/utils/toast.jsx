import { toast } from "react-toastify";

export const notifySuccess = (msg, opts = {}) => toast.success(String(msg), opts);
export const notifyError   = (msg, opts = {}) => toast.error(String(msg), opts);
export const notifyInfo    = (msg, opts = {}) => toast.info(String(msg), opts);
export const notifyWarn    = (msg, opts = {}) => toast.warn(String(msg), opts);

// optional small helper to show objects nicely
export const notifyPretty = (obj, level = "info", opts = {}) => {
  const text = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  if (level === "error") return notifyError(text, opts);
  if (level === "warn")  return notifyWarn(text, opts);
  if (level === "success") return notifySuccess(text, opts);
  return notifyInfo(text, opts);
};
