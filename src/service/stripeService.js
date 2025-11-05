import api from "./api";
const STRIPE_API = "/stripe";

const createCheckout = (payload) => api.post(`${STRIPE_API}/create-checkout`, payload);
const getBookingBySession = (sessionId) => api.get(`${STRIPE_API}/by-session/${sessionId}`);
const getSessionIdFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("session_id") || params.get("sessionId") || null;
};

const StripeService = {
  createCheckout,
  getBookingBySession,
  getSessionIdFromUrl,
};

export default StripeService;
