#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  analyzeReviewsGap,
  buildEmailSequence,
  generateColdEmail,
  scoreLocalLead,
} from "./outreach.js";
import { TRADES } from "./trades.js";

const VERSION = "0.1.0";

const server = new McpServer(
  {
    name: "localpulse-mcp",
    version: VERSION,
  },
  {
    instructions: `LocalPulse MCP helps agencies and solo founders run value-first cold outreach to local service businesses (HVAC, plumbing, electrical, pest control, dental, auto repair).

Use generate_cold_email for a single personalized email. Use score_local_lead before outreach to prioritize. Use build_email_sequence for a 3-touch drip. Use analyze_reviews_gap to find reputation + revenue angles.

Available trades: ${Object.keys(TRADES).join(", ")}`,
  }
);

server.tool(
  "generate_cold_email",
  "Generate a value-first cold email for a local service business. No API keys required.",
  {
    trade: z
      .string()
      .describe("Trade niche: hvac, plumbing, electrical, pest_control, dental, auto_repair"),
    business_name: z.string().describe("Target business name"),
    city: z.string().describe("City or metro area"),
    owner_name: z.string().optional().describe("Owner or manager first name if known"),
    specific_insight: z
      .string()
      .optional()
      .describe("Custom opening line (e.g. from Google Maps research)"),
  },
  async ({ trade, business_name, city, owner_name, specific_insight }) => {
    const result = generateColdEmail({
      trade,
      businessName: business_name,
      city,
      ownerName: owner_name,
      specificInsight: specific_insight,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "score_local_lead",
  "Score a local business lead 0–100 for outreach priority based on observable signals.",
  {
    trade: z.string().describe("Trade niche"),
    google_rating: z.number().min(1).max(5).optional(),
    review_count: z.number().int().min(0).optional(),
    has_website: z.boolean().optional(),
    responds_to_reviews: z.boolean().optional(),
    estimated_employees: z.number().int().min(1).optional(),
    after_hours_calls: z.boolean().optional(),
  },
  async (signals) => {
    const result = scoreLocalLead({
      trade: signals.trade,
      googleRating: signals.google_rating,
      reviewCount: signals.review_count,
      hasWebsite: signals.has_website,
      respondsToReviews: signals.responds_to_reviews,
      estimatedEmployees: signals.estimated_employees,
      afterHoursCalls: signals.after_hours_calls,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "build_email_sequence",
  "Build a 3-email outreach sequence (day 0, 3, 7) for a local business.",
  {
    trade: z.string(),
    business_name: z.string(),
    city: z.string(),
    owner_name: z.string().optional(),
  },
  async (input) => {
    const result = buildEmailSequence({
      trade: input.trade,
      businessName: input.business_name,
      city: input.city,
      ownerName: input.owner_name,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "analyze_reviews_gap",
  "Analyze Google review gaps vs competitors and suggest an outreach angle.",
  {
    trade: z.string(),
    business_name: z.string(),
    google_rating: z.number().min(1).max(5),
    review_count: z.number().int().min(0),
    competitor_avg_rating: z.number().min(1).max(5).optional(),
    competitor_avg_reviews: z.number().int().min(0).optional(),
    unanswered_reviews: z.number().int().min(0).optional(),
  },
  async (input) => {
    const result = analyzeReviewsGap({
      trade: input.trade,
      businessName: input.business_name,
      googleRating: input.google_rating,
      reviewCount: input.review_count,
      competitorAvgRating: input.competitor_avg_rating,
      competitorAvgReviews: input.competitor_avg_reviews,
      unansweredReviews: input.unanswered_reviews,
    });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "list_trades",
  "List supported local service trades with pain hooks and value offers.",
  {},
  async () => {
    return {
      content: [{ type: "text", text: JSON.stringify(TRADES, null, 2) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`localpulse-mcp v${VERSION} running on stdio`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
