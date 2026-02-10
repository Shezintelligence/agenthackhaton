# Atlas Architecture

## Core Components

### 1. Research Orchestrator
Main coordinator that:
- Accepts research requests (via API or on-chain)
- Spawns 4 specialist agents with specific mandates
- Collects their outputs
- Facilitates voting/consensus
- Produces final integrated brief

### 2. Specialist Agents (4 roles)

**Strategic Intelligence Agent**
- Maps landscape & competitive dynamics
- Identifies risks and opportunities
- Provides geopolitical/strategic context

**National/Domain Capability Agent**
- Assesses current state capabilities
- Identifies gaps and dependencies
- Evaluates institutional readiness

**Economic & Security Agent**
- Quantifies economic scenarios (conservative/base/aggressive)
- Calculates ROI projections
- Addresses security concerns with mitigation

**Red Team & Governance Agent**
- Attacks the plan for failure modes
- Identifies political/technical/reputational risks
- Proposes governance structure & controls

### 3. Solana Integration

**Research Request Program** (Anchor)
```rust
pub struct ResearchRequest {
    pub requester: Pubkey,
    pub topic: String,
    pub paid_amount: u64,
    pub status: RequestStatus, // Pending, InProgress, Completed
    pub result_hash: [u8; 32],
    pub created_at: i64,
}

pub struct AgentVote {
    pub agent_id: u8,
    pub request_id: Pubkey,
    pub vote: Vote, // Approve, Reject, RequestChanges
    pub reasoning_hash: [u8; 32],
}
```

**Governance Flow**:
1. User creates request + pays SOL/USDC
2. Orchestrator picks up new requests
3. Spawns 4 agents, each writes findings to local state
4. Each agent submits vote on-chain with hash of their research
5. If 3/4 approve → integrate & publish
6. Result hash written to request account

### 4. Off-Chain Components

**Research Engine**
- Web search (Brave API)
- Web scraping (for specific data)
- Data synthesis and analysis
- Brief generation (markdown format)

**Delivery Layer**
- IPFS for full reports (optional)
- Direct delivery via messaging (Telegram, etc.)
- On-chain hash for verification

## Data Flow

```
[User] 
  ↓ (Submit request + payment)
[Solana: ResearchRequest created]
  ↓ (Orchestrator polls for new requests)
[Orchestrator]
  ↓ (Spawn agents with topic)
[4 Specialist Agents] (parallel execution)
  ↓ (Each produces research + submits vote hash)
[Solana: 4 AgentVote accounts created]
  ↓ (Orchestrator checks votes)
[Orchestrator] (if consensus: integrate)
  ↓ (Produce final brief)
[Result hash → Solana]
[Full brief → IPFS / direct delivery]
```

## Why This Design Wins

1. **True Decentralization**: Not just "calling Solana APIs"—actual governance logic on-chain
2. **Verifiable**: Every agent decision is hashed and signed
3. **Composable**: Other protocols can trigger Atlas research
4. **Scalable**: Can handle multiple concurrent requests
5. **Autonomous**: No human intervention required

## Simplifications for 48-Hour Build

- Use devnet only (no mainnet deployment pressure)
- Simple payment: fixed SOL amount, no token complexity
- IPFS optional: can deliver via existing channels (Telegram)
- Focus on demo quality over production hardening
