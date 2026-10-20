export interface PricingInput {
  totalSqFt: number;
  mulchType: string;
  depth: number;
  pricePerYard: number;
}

export function calculateYardsNeeded(sqFt: number, depthInches: number): number {
  const cubicFeet = sqFt * (depthInches / 12);
  const yards = cubicFeet / 27;
  return Math.ceil(yards * 10) / 10;
}

export function calculatePriceRange(yards: number, pricePerYard: number) {
  const base = yards * pricePerYard;
  const deliveryFee = yards <= 5 ? 75 : yards <= 10 ? 50 : 0;
  const low = Math.round(base + deliveryFee);
  const high = Math.round(base * 1.15 + deliveryFee);
  return { low, high, yards, deliveryFee };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const MULCH_TYPES: Record<string, { label: string; description: string; color: string }> = {
  hardwood: {
    label: "Premium Hardwood",
    description: "Our most popular choice. Natural brown color that enriches soil as it breaks down.",
    color: "#5C4033",
  },
  "pine-bark": {
    label: "Pine Bark",
    description: "Lightweight, excellent drainage. Great for slopes and garden beds.",
    color: "#8B4513",
  },
  "red-dyed": {
    label: "Red-Dyed Mulch",
    description: "Bold color that lasts all season. Color-safe for walkways and driveways.",
    color: "#8B2500",
  },
  "black-dyed": {
    label: "Black-Dyed Mulch",
    description: "Striking contrast against green landscaping. Modern, clean look.",
    color: "#2C2C2C",
  },
  playground: {
    label: "Playground Certified",
    description: "ASTM-rated for fall height safety. Perfect for play areas and schools.",
    color: "#D2B48C",
  },
  soil: {
    label: "Premium Soil Blend",
    description: "Rich topsoil and compost blend for new beds and green roof installs.",
    color: "#3E2723",
  },
};

export const DEPTH_OPTIONS = [
  { value: 2, label: '2"', description: "Refresh existing beds" },
  { value: 3, label: '3"', description: "Standard application (recommended)" },
  { value: 4, label: '4"', description: "New beds or heavy weed suppression" },
];
