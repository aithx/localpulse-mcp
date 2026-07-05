# LocalPulse MCP

MCP server for **value-first cold outreach** to local service businesses (HVAC, plumbing, electrical, pest control, dental, auto repair).

Part of the [[money-maker]] validation sprint — Archetype B automated via MCP distribution.

## Quick start

```bash
npm install
npm run build
npm test
npm start   # stdio MCP server
```

### Cursor / Claude Desktop config

```json
{
  "mcpServers": {
    "localpulse": {
      "command": "node",
      "args": ["/Users/aith/Desktop/Projects/outreach-mcp/dist/index.js"]
    }
  }
}
```

## Tools

| Tool | Purpose |
|------|---------|
| `generate_cold_email` | Single personalized cold email |
| `score_local_lead` | 0–100 priority score from observable signals |
| `build_email_sequence` | 3-email drip (day 0, 3, 7) |
| `analyze_reviews_gap` | Review vs competitor gaps + outreach angle |
| `list_trades` | Supported trades with pain hooks |

## Validation sprint

See vault: `2-projects/localpulse-mcp.md`

**Kill criteria (day 14):** fewer than 5 waitlist signups AND fewer than 3 cold-reply signals → pivot or kill.

**Go criteria:** 20+ waitlist OR 5+ positive cold replies → build paid tier + Apollo/HubSpot integration.

## License

MIT
