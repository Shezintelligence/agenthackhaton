# Atlas Research Coordinator Program (Anchor/Solana)

## Program Overview

This Solana program manages research requests, agent votes, and consensus for the Atlas Intelligence Network.

## Account Structures

```rust
use anchor_lang::prelude::*;

declare_id!("At1asxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"); // To be deployed

#[program]
pub mod research_coordinator {
    use super::*;

    pub fn create_request(
        ctx: Context<CreateRequest>,
        topic: String,
        payment_amount: u64,
    ) -> Result<()> {
        let request = &mut ctx.accounts.request;
        request.requester = ctx.accounts.requester.key();
        request.topic = topic;
        request.paid_amount = payment_amount;
        request.status = RequestStatus::Pending;
        request.created_at = Clock::get()?.unix_timestamp;
        request.agent_votes = 0;
        request.result_hash = [0; 32];
        
        // Transfer payment to program treasury
        let transfer_ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.requester.key(),
            &ctx.accounts.treasury.key(),
            payment_amount,
        );
        
        anchor_lang::solana_program::program::invoke(
            &transfer_ix,
            &[
                ctx.accounts.requester.to_account_info(),
                ctx.accounts.treasury.to_account_info(),
            ],
        )?;
        
        Ok(())
    }

    pub fn start_research(
        ctx: Context<StartResearch>,
    ) -> Result<()> {
        let request = &mut ctx.accounts.request;
        require!(
            request.status == RequestStatus::Pending,
            ErrorCode::InvalidStatus
        );
        request.status = RequestStatus::InProgress;
        Ok(())
    }

    pub fn submit_agent_vote(
        ctx: Context<SubmitAgentVote>,
        agent_id: u8,
        vote: Vote,
        reasoning_hash: [u8; 32],
    ) -> Result<()> {
        let request = &mut ctx.accounts.request;
        require!(
            request.status == RequestStatus::InProgress,
            ErrorCode::InvalidStatus
        );
        
        let agent_vote = &mut ctx.accounts.agent_vote;
        agent_vote.request = request.key();
        agent_vote.agent_id = agent_id;
        agent_vote.vote = vote;
        agent_vote.reasoning_hash = reasoning_hash;
        agent_vote.timestamp = Clock::get()?.unix_timestamp;
        
        request.agent_votes += 1;
        
        Ok(())
    }

    pub fn finalize_request(
        ctx: Context<FinalizeRequest>,
        result_hash: [u8; 32],
    ) -> Result<()> {
        let request = &mut ctx.accounts.request;
        require!(
            request.status == RequestStatus::InProgress,
            ErrorCode::InvalidStatus
        );
        require!(
            request.agent_votes >= 3, // At least 3/4 consensus
            ErrorCode::InsufficientVotes
        );
        
        request.result_hash = result_hash;
        request.status = RequestStatus::Completed;
        request.completed_at = Clock::get()?.unix_timestamp;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateRequest<'info> {
    #[account(
        init,
        payer = requester,
        space = 8 + ResearchRequest::INIT_SPACE
    )]
    pub request: Account<'info, ResearchRequest>,
    
    #[account(mut)]
    pub requester: Signer<'info>,
    
    /// CHECK: Treasury PDA
    #[account(mut)]
    pub treasury: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartResearch<'info> {
    #[account(mut)]
    pub request: Account<'info, ResearchRequest>,
    
    /// CHECK: Orchestrator authority (could add PDA check)
    pub orchestrator: Signer<'info>,
}

#[derive(Accounts)]
pub struct SubmitAgentVote<'info> {
    #[account(
        init,
        payer = orchestrator,
        space = 8 + AgentVote::INIT_SPACE
    )]
    pub agent_vote: Account<'info, AgentVote>,
    
    #[account(mut)]
    pub request: Account<'info, ResearchRequest>,
    
    #[account(mut)]
    pub orchestrator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FinalizeRequest<'info> {
    #[account(mut)]
    pub request: Account<'info, ResearchRequest>,
    
    /// CHECK: Orchestrator authority
    pub orchestrator: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ResearchRequest {
    pub requester: Pubkey,           // 32
    #[max_len(200)]
    pub topic: String,               // 4 + 200
    pub paid_amount: u64,            // 8
    pub status: RequestStatus,       // 1
    pub result_hash: [u8; 32],      // 32
    pub created_at: i64,            // 8
    pub completed_at: i64,          // 8
    pub agent_votes: u8,            // 1
}

#[account]
#[derive(InitSpace)]
pub struct AgentVote {
    pub request: Pubkey,             // 32
    pub agent_id: u8,                // 1
    pub vote: Vote,                  // 1
    pub reasoning_hash: [u8; 32],    // 32
    pub timestamp: i64,              // 8
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum RequestStatus {
    Pending,
    InProgress,
    Completed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum Vote {
    Approve,
    Reject,
    RequestChanges,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid request status for this operation")]
    InvalidStatus,
    #[msg("Insufficient agent votes for finalization")]
    InsufficientVotes,
}
```

## Program Flow

### 1. User Creates Request
```typescript
await program.methods
  .createRequest(
    "Pakistan AI regulation framework",
    new BN(1_000_000) // 0.001 SOL payment
  )
  .accounts({
    request: requestPda,
    requester: user.publicKey,
    treasury: treasuryPda,
    systemProgram: SystemProgram.programId,
  })
  .signers([user])
  .rpc();
```

### 2. Orchestrator Starts Research
```typescript
await program.methods
  .startResearch()
  .accounts({
    request: requestPda,
    orchestrator: orchestrator.publicKey,
  })
  .signers([orchestrator])
  .rpc();
```

### 3. Each Agent Submits Vote
```typescript
for (let agentId = 0; agentId < 4; agentId++) {
  const reasoningHash = await hashAgentOutput(agentOutputs[agentId]);
  
  await program.methods
    .submitAgentVote(
      agentId,
      { approve: {} },
      Array.from(reasoningHash)
    )
    .accounts({
      agentVote: agentVotePda,
      request: requestPda,
      orchestrator: orchestrator.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .signers([orchestrator])
    .rpc();
}
```

### 4. Orchestrator Finalizes
```typescript
const finalHash = await hashFinalBrief(integratedBrief);

await program.methods
  .finalizeRequest(Array.from(finalHash))
  .accounts({
    request: requestPda,
    orchestrator: orchestrator.publicKey,
  })
  .signers([orchestrator])
  .rpc();
```

## Deployment Strategy

### For Hackathon (Devnet)
1. Deploy program to devnet
2. Airdrop SOL to orchestrator wallet
3. Create treasury PDA
4. Run 3 demo requests end-to-end
5. Publish program ID and transaction signatures

### Program Addresses
- **Program ID**: `At1as...` (to be deployed)
- **Treasury PDA**: Derived from program + seed `"treasury"`
- **Request PDAs**: Derived from requester + request_id
- **Vote PDAs**: Derived from request + agent_id

## Verification

All transactions are verifiable on Solana Explorer:
- Request creation → payment proof
- Agent votes → reasoning hash commitment
- Finalization → result hash
- Full audit trail from request to delivery

## Why This Design Is "Most Agentic"

1. **On-Chain Governance**: Agent votes are first-class blockchain citizens
2. **Verifiable**: Every decision is hashed and signed
3. **Autonomous**: Program enforces consensus rules without human override
4. **Composable**: Other protocols can trigger research programmatically
5. **Trustless**: No centralized arbiter—Solana enforces the rules

This isn't "AI agent that calls Solana APIs." This is **AI agents coordinating VIA Solana as a trust layer.**
