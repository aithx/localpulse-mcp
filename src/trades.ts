export type TradeId =
  | "hvac"
  | "plumbing"
  | "electrical"
  | "pest_control"
  | "dental"
  | "auto_repair";

export interface TradeProfile {
  id: TradeId;
  label: string;
  painHook: string;
  valueOffer: string;
  avgTicket: string;
  missedCallStat: string;
}

export const TRADES: Record<TradeId, TradeProfile> = {
  hvac: {
    id: "hvac",
    label: "HVAC",
    painHook: "missed calls during heat waves and cold snaps",
    valueOffer: "AI call-back within 60 seconds + same-day booking",
    avgTicket: "$350–$800",
    missedCallStat: "~62% of after-hours HVAC calls go to voicemail",
  },
  plumbing: {
    id: "plumbing",
    label: "Plumbing",
    painHook: "emergency calls going to competitors who answer first",
    valueOffer: "24/7 AI receptionist that books jobs while you sleep",
    avgTicket: "$200–$600",
    missedCallStat: "~60% of plumbing leads call 2–3 competitors",
  },
  electrical: {
    id: "electrical",
    label: "Electrical",
    painHook: "slow quote follow-up losing panel-upgrade jobs",
    valueOffer: "instant quote scheduling + review request automation",
    avgTicket: "$400–$2,500",
    missedCallStat: "~55% of electrical inquiries never get a callback same day",
  },
  pest_control: {
    id: "pest_control",
    label: "Pest Control",
    painHook: "seasonal demand spikes with no staff to answer phones",
    valueOffer: "seasonal campaign outreach + automated booking",
    avgTicket: "$150–$400",
    missedCallStat: "~58% of pest calls happen outside business hours",
  },
  dental: {
    id: "dental",
    label: "Dental",
    painHook: "new patient calls going to voicemail",
    valueOffer: "new-patient intake + appointment booking automation",
    avgTicket: "$200–$1,200 first visit",
    missedCallStat: "~67% of dental shoppers call multiple offices",
  },
  auto_repair: {
    id: "auto_repair",
    label: "Auto Repair",
    painHook: "shop phones ringing while techs are under hoods",
    valueOffer: "AI dispatcher that captures VIN, symptoms, and books bays",
    avgTicket: "$250–$900",
    missedCallStat: "~50% of auto repair shops miss 3+ calls per day",
  },
};

export function resolveTrade(trade: string): TradeProfile {
  const key = trade.toLowerCase().replace(/\s+/g, "_") as TradeId;
  const profile = TRADES[key];
  if (!profile) {
    throw new Error(
      `Unknown trade "${trade}". Use: ${Object.keys(TRADES).join(", ")}`
    );
  }
  return profile;
}
