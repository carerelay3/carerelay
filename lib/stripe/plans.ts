export type PlanId = "starter" | "family" | "family_plus" | "demo";

export const STRIPE_PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
  family: process.env.STRIPE_FAMILY_PRICE_ID || "price_family",
  family_plus: process.env.STRIPE_FAMILY_PLUS_PRICE_ID || "price_family_plus",
};

export const PLANS = {
  starter: {
    id: "starter" as PlanId,
    name: "Starter",
    priceId: STRIPE_PRICE_IDS.starter,
  },
  family: {
    id: "family" as PlanId,
    name: "Family",
    priceId: STRIPE_PRICE_IDS.family,
  },
  family_plus: {
    id: "family_plus" as PlanId,
    name: "Family Plus",
    priceId: STRIPE_PRICE_IDS.family_plus,
  },
  demo: {
    id: "demo" as PlanId,
    name: "Demo",
    priceId: "",
  }
};