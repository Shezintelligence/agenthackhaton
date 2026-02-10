# Atlas Research Orchestrator

## Core Prompt Template for Multi-Agent Research

This is the battle-tested prompt structure that powered the Pakistan AI Mission and Crypto Regulation briefs.

### Base Template

```
Run a high-level 4-agent national command simulation on [TOPIC].

Mission: [SPECIFIC MISSION STATEMENT]

You must simulate ALL FOUR agents sequentially and then produce a single integrated brief.

Agent roles:

1. Strategic Intelligence Agent
[ROLE-SPECIFIC MANDATE]

2. National/Domain Capability Agent
[ROLE-SPECIFIC MANDATE]

3. Economic & Security Agent
[ROLE-SPECIFIC MANDATE]

4. Red Team & Governance Agent
[ROLE-SPECIFIC MANDATE]

Final output requirements (single integrated brief):
- Clear Decision: GO / GO WITH CONDITIONS / NO-GO
- Top 10 priority actions for the next 90 days
- Recommended [STRUCTURE] org chart (simple, realistic)
- War-room dashboard: 8–10 key KPIs
- Realistic budget envelope (low / medium / high) in USD
- One-page executive summary suitable for [STAKEHOLDER]
- 3-minute verbal briefing script (crisp, non-technical, authoritative language)

Style rules:
- No hype, no buzzwords, no generic statements
- Use specific numbers, ranges, and explicit assumptions
- Prioritize [KEY VALUES]
- Write like a serious command brief to top leadership
- Ground in [CONTEXT-SPECIFIC DATA]

Use web_search to get current data on [RESEARCH AREAS].
```

### Execution Parameters

- **Model**: Claude Opus 4.6 (high reasoning capability)
- **Thinking**: High (enables deep analysis)
- **Timeout**: 600 seconds (10 minutes)
- **Context**: Full access to web_search tool

### Proven Results

**Pakistan AI Mission Brief**:
- Runtime: 5m 43s
- Tokens: 59.2k
- Output: 30KB comprehensive strategic plan
- Decision: GO WITH CONDITIONS
- Quality: Production-ready command brief

**Pakistan Crypto Regulation Brief**:
- Runtime: ~6 minutes  
- Output: Full regulatory framework analysis
- Decision: GO WITH CONDITIONS
- Quality: Minister-ready presentation

## Integration with Solana

### Pre-Execution (On-Chain)
1. Orchestrator polls for new `ResearchRequest` accounts
2. Validates payment and status
3. Updates status to `InProgress`

### Execution (Off-Chain)
4. Spawns 4 agents using sessions_spawn
5. Each agent produces research independently
6. Orchestrator collects outputs

### Consensus (On-Chain)
7. Each agent's output is hashed (SHA-256)
8. Agent votes submitted as `AgentVote` accounts
9. Orchestrator checks for 3/4 consensus

### Finalization (Hybrid)
10. Integrated brief produced
11. Final hash written to `ResearchRequest.result_hash`
12. Full brief delivered off-chain (IPFS/Telegram)
13. Status updated to `Completed`

## Customization for Different Domains

The 4-agent structure is domain-agnostic. Examples:

**DeFi Protocol Analysis**:
- Strategic: Competitive landscape, market positioning
- Capability: Technical architecture, smart contract audit
- Economic: TVL projections, tokenomics scenarios  
- Red Team: Attack vectors, governance risks

**Market Entry Strategy**:
- Strategic: Market dynamics, competitive threats
- Capability: Operational readiness, supply chain
- Economic: Revenue scenarios, cost structure
- Red Team: Regulatory risks, failure modes

**Technology Assessment**:
- Strategic: Technology landscape, vendor comparison
- Capability: Integration requirements, skill gaps
- Economic: Cost-benefit analysis, TCO
- Red Team: Technical risks, lock-in concerns

## Why This Works

1. **Structured Thinking**: Forces comprehensive analysis from multiple angles
2. **Parallel Expertise**: Each agent specializes, avoiding generic output
3. **Actionable**: Always produces specific next steps, not just analysis
4. **Decision-Ready**: Clear GO/NO-GO with conditions
5. **Proven**: Successfully used for real strategic planning

This is the engine that makes Atlas "Most Agentic" — not just calling APIs, but orchestrating genuine multi-agent intelligence work.
