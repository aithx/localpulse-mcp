import { resolveTrade, type TradeProfile } from "./trades.js";

export interface ColdEmailInput {
  trade: string;
  businessName: string;
  city: string;
  ownerName?: string;
  specificInsight?: string;
}

export interface ColdEmailResult {
  subject: string;
  body: string;
  followUpHint: string;
  trade: TradeProfile;
}

export function generateColdEmail(input: ColdEmailInput): ColdEmailResult {
  const trade = resolveTrade(input.trade);
  const greeting = input.ownerName ? `Hi ${input.ownerName},` : "Hi there,";
  const insight =
    input.specificInsight ??
    `I noticed ${input.businessName} has solid reviews in ${input.city}, but ${trade.painHook}.`;

  const subject = `${input.city} ${trade.label} — quick idea on missed calls`;

  const body = `${greeting}

${insight}

${trade.missedCallStat}. Most ${trade.label.toLowerCase()} shops in ${input.city} lose $2k–$8k/mo from calls that never get answered.

We built a simple system: ${trade.valueOffer}. One shop we work with books 8–12 extra jobs/month (avg ticket ${trade.avgTicket}).

Not asking for a meeting — happy to send a 2-min Loom showing exactly how it'd work for ${input.businessName}. Worth a look?

— [Your name]
P.S. If timing's bad, just reply "later" and I'll circle back in 30 days.`;

  return {
    subject,
    body,
    followUpHint:
      "Follow up in 3 days with a one-line bump + link to a personalized audit (Google review count, response time estimate).",
    trade,
  };
}

export interface LeadSignals {
  trade: string;
  googleRating?: number;
  reviewCount?: number;
  hasWebsite?: boolean;
  respondsToReviews?: boolean;
  estimatedEmployees?: number;
  afterHoursCalls?: boolean;
}

export interface LeadScore {
  score: number;
  tier: "hot" | "warm" | "cold";
  reasons: string[];
  recommendedAngle: string;
}

export function scoreLocalLead(signals: LeadSignals): LeadScore {
  const trade = resolveTrade(signals.trade);
  let score = 50;
  const reasons: string[] = [];

  if (signals.googleRating !== undefined) {
    if (signals.googleRating >= 4.0 && signals.googleRating <= 4.6) {
      score += 15;
      reasons.push("Good but improvable rating — likely cares about reputation");
    } else if (signals.googleRating >= 4.7) {
      score += 8;
      reasons.push("Strong rating — pitch efficiency, not reputation rescue");
    } else if (signals.googleRating < 4.0) {
      score -= 10;
      reasons.push("Low rating — may be distracted by ops issues");
    }
  }

  if (signals.reviewCount !== undefined) {
    if (signals.reviewCount >= 20 && signals.reviewCount <= 150) {
      score += 12;
      reasons.push("Active review base — growth-minded owner");
    } else if (signals.reviewCount < 10) {
      score += 5;
      reasons.push("Small review base — may need both outreach + reviews");
    }
  }

  if (signals.hasWebsite === false) {
    score += 10;
    reasons.push("No website — high pain on missed digital leads");
  }

  if (signals.respondsToReviews === false) {
    score += 8;
    reasons.push("Doesn't respond to reviews — automation angle lands");
  }

  if (signals.estimatedEmployees !== undefined) {
    if (signals.estimatedEmployees >= 3 && signals.estimatedEmployees <= 15) {
      score += 10;
      reasons.push("Sweet spot: big enough to miss calls, small enough to decide fast");
    }
  }

  if (signals.afterHoursCalls) {
    score += 15;
    reasons.push(`After-hours volume — ${trade.painHook}`);
  }

  score = Math.max(0, Math.min(100, score));

  const tier = score >= 75 ? "hot" : score >= 55 ? "warm" : "cold";
  const recommendedAngle =
    tier === "hot"
      ? `Lead with missed-call revenue math + offer free ${trade.label.toLowerCase()} call audit`
      : tier === "warm"
        ? `Lead with ${trade.valueOffer} — soft CTA, no hard sell`
        : "Deprioritize — focus on hotter leads in same zip code";

  return { score, tier, reasons, recommendedAngle };
}

export interface EmailSequenceInput {
  trade: string;
  businessName: string;
  city: string;
  ownerName?: string;
}

export interface EmailSequence {
  emails: Array<{ day: number; subject: string; body: string }>;
}

export function buildEmailSequence(input: EmailSequenceInput): EmailSequence {
  const first = generateColdEmail(input);

  const bumpSubject = `Re: ${first.subject}`;
  const bumpBody = input.ownerName
    ? `Hi ${input.ownerName} — bumping this in case it got buried. Still happy to send that 2-min Loom for ${input.businessName}.`
    : `Bumping this — still happy to send a 2-min Loom for ${input.businessName}.`;

  const breakupSubject = `Closing the loop — ${input.businessName}`;
  const breakupBody = `Last note from me. If missed-call booking isn't a priority for ${input.businessName} right now, no worries.

If it ever is, here's what we do: ${first.trade.valueOffer}.

Reply "interested" anytime and I'll send the Loom.`;

  return {
    emails: [
      { day: 0, subject: first.subject, body: first.body },
      { day: 3, subject: bumpSubject, body: bumpBody },
      { day: 7, subject: breakupSubject, body: breakupBody },
    ],
  };
}

export interface ReviewGapInput {
  trade: string;
  businessName: string;
  googleRating: number;
  reviewCount: number;
  competitorAvgRating?: number;
  competitorAvgReviews?: number;
  unansweredReviews?: number;
}

export interface ReviewGapAnalysis {
  gaps: string[];
  outreachAngle: string;
  priorityScore: number;
}

export function analyzeReviewsGap(input: ReviewGapInput): ReviewGapAnalysis {
  const trade = resolveTrade(input.trade);
  const gaps: string[] = [];
  let priorityScore = 40;

  if (input.googleRating < 4.5) {
    gaps.push(`Rating ${input.googleRating} — below the 4.5+ threshold many searchers filter on`);
    priorityScore += 15;
  }

  if (input.reviewCount < 50) {
    gaps.push(`Only ${input.reviewCount} reviews — competitors with 100+ look more established`);
    priorityScore += 10;
  }

  if (input.unansweredReviews && input.unansweredReviews > 0) {
    gaps.push(`${input.unansweredReviews} unanswered reviews — signals slow owner attention`);
    priorityScore += 12;
  }

  if (
    input.competitorAvgRating !== undefined &&
    input.googleRating < input.competitorAvgRating - 0.2
  ) {
    gaps.push(
      `Rating trails local avg (${input.competitorAvgRating}) — reputation gap to close`
    );
    priorityScore += 10;
  }

  if (
    input.competitorAvgReviews !== undefined &&
    input.reviewCount < input.competitorAvgReviews * 0.5
  ) {
    gaps.push("Review volume significantly behind local competitors");
    priorityScore += 8;
  }

  const outreachAngle =
    gaps.length > 0
      ? `Pitch combined missed-call booking + automated review requests for ${input.businessName}. Frame as: "You're losing jobs to shops that answer faster AND look more trusted online."`
      : `Strong online presence — pitch ${trade.valueOffer} purely on revenue capture, not reputation fix.`;

  return {
    gaps,
    outreachAngle,
    priorityScore: Math.min(100, priorityScore),
  };
}
