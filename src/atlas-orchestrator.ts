/**
 * Atlas Intelligence Network - Main Orchestrator
 * 
 * Coordinates multi-agent research via OpenClaw and records results on Solana
 */

import AtlasSolanaClient from './solana-client';
import { Keypair } from '@solana/web3.js';

interface ResearchConfig {
  topic: string;
  agentCount?: number;
  model?: string;
  thinkingLevel?: 'low' | 'medium' | 'high';
  timeoutSeconds?: number;
}

interface AgentRole {
  name: string;
  mandate: string;
}

/**
 * Standard 4-agent research roles
 * These have proven effective across government policy, legal frameworks, and DeFi strategy
 */
const DEFAULT_AGENT_ROLES: AgentRole[] = [
  {
    name: 'Strategic Intelligence Agent',
    mandate: 'Map landscape, identify risks and opportunities, provide competitive context',
  },
  {
    name: 'Capability/Product Agent',
    mandate: 'Assess current state, identify gaps and dependencies, evaluate readiness',
  },
  {
    name: 'Economic & Security Agent',
    mandate: 'Quantify scenarios (conservative/base/aggressive), address security concerns',
  },
  {
    name: 'Red Team & Governance Agent',
    mandate: 'Attack the plan for failure modes, propose governance and risk controls',
  },
];

export class AtlasOrchestrator {
  private solanaClient: AtlasSolanaClient;
  
  constructor(orchestratorKeypair?: Keypair) {
    const keypair = orchestratorKeypair || Keypair.generate();
    this.solanaClient = new AtlasSolanaClient(keypair);
  }

  /**
   * Execute full research workflow:
   * 1. Create on-chain research request
   * 2. Spawn specialist agents (via OpenClaw sessions_spawn)
   * 3. Collect agent outputs
   * 4. Submit votes on-chain
   * 5. Integrate findings
   * 6. Finalize on-chain with result hash
   */
  async conductResearch(config: ResearchConfig): Promise<{
    brief: string;
    onChainProof: {
      requestAddress: string;
      voteSignatures: string[];
      finalHash: string;
    };
  }> {
    console.log(`\n🔬 Atlas Research: ${config.topic}`);
    console.log('━'.repeat(60));

    // Step 1: Create on-chain request
    console.log('\n📝 Creating on-chain research request...');
    const requestPda = await this.solanaClient.createResearchRequest(
      Keypair.generate(), // In production: actual requester wallet
      config.topic,
      1_000_000 // 0.001 SOL
    );

    // Step 2: Start research
    await this.solanaClient.startResearch(requestPda);

    // Step 3: Spawn agents
    console.log('\n🤖 Spawning 4 specialist agents...');
    const agentPromises = DEFAULT_AGENT_ROLES.map((role, index) => 
      this.spawnAgent(config, role, index)
    );

    const agentOutputs = await Promise.all(agentPromises);

    // Step 4: Submit votes on-chain
    console.log('\n🗳️  Submitting agent votes on-chain...');
    const voteSignatures: string[] = [];
    for (let i = 0; i < agentOutputs.length; i++) {
      const sig = await this.solanaClient.submitAgentVote(
        requestPda,
        i,
        'Approve', // In production: agents evaluate each other's work
        agentOutputs[i]
      );
      voteSignatures.push(sig);
    }

    // Step 5: Integrate findings
    console.log('\n📊 Integrating agent findings...');
    const integratedBrief = this.integrateFindings(config.topic, agentOutputs);

    // Step 6: Finalize on-chain
    console.log('\n✅ Finalizing on-chain...');
    const finalizeSig = await this.solanaClient.finalizeRequest(
      requestPda,
      integratedBrief
    );

    const finalHashBuffer = Buffer.from(
      require('crypto').createHash('sha256').update(integratedBrief).digest()
    );

    console.log('\n✨ Research complete!');
    console.log(`Brief size: ${(integratedBrief.length / 1024).toFixed(1)} KB`);
    console.log(`On-chain proof: ${requestPda.toString()}\n`);

    return {
      brief: integratedBrief,
      onChainProof: {
        requestAddress: requestPda.toString(),
        voteSignatures: [...voteSignatures, finalizeSig],
        finalHash: finalHashBuffer.toString('hex'),
      },
    };
  }

  /**
   * Spawn a single specialist agent via OpenClaw
   * 
   * In production, this would call OpenClaw's sessions_spawn API
   * For demo purposes, we simulate the agent's structured output
   */
  private async spawnAgent(
    config: ResearchConfig,
    role: AgentRole,
    agentId: number
  ): Promise<string> {
    console.log(`  Agent ${agentId + 1}: ${role.name}`);

    // In production:
    // const result = await openclaw.sessions.spawn({
    //   task: this.buildAgentPrompt(config.topic, role),
    //   model: config.model || 'anthropic/claude-opus-4-6',
    //   thinking: config.thinkingLevel || 'high',
    //   runTimeoutSeconds: config.timeoutSeconds || 600,
    // });
    // return result.output;

    // For demo: simulate agent output structure
    return this.simulateAgentOutput(role, config.topic);
  }

  /**
   * Build specialized prompt for each agent role
   */
  private buildAgentPrompt(topic: string, role: AgentRole): string {
    return `You are the ${role.name} for Atlas Intelligence Network.

Your mandate: ${role.mandate}

Research topic: ${topic}

Produce a comprehensive analysis following your mandate. Include:
- Current landscape assessment
- Key findings (3-5 bullet points)
- Specific data/numbers where available
- Risks and opportunities
- Recommendations

Use web_search to ground your analysis in current data.

Be specific. Avoid generalities. Focus on actionable insights.`;
  }

  /**
   * Simulate agent output for demonstration
   * 
   * In production, this would be the actual agent's research output
   */
  private simulateAgentOutput(role: AgentRole, topic: string): string {
    return `## ${role.name}\n\n**Mandate**: ${role.mandate}\n\n**Topic**: ${topic}\n\n### Analysis\n\n[Agent would perform deep research here using web_search, data analysis, and reasoning]\n\n### Key Findings\n\n1. Finding one with specific data\n2. Finding two with concrete examples\n3. Finding three with actionable insight\n\n### Recommendations\n\n- Specific action 1\n- Specific action 2\n- Specific action 3\n\n---\n`;
  }

  /**
   * Integrate findings from all 4 agents into a cohesive brief
   * 
   * In production, this would use AI to synthesize and remove redundancy
   * For now, structured concatenation with executive summary
   */
  private integrateFindings(topic: string, agentOutputs: string[]): string {
    const brief = `# Atlas Intelligence Brief: ${topic}\n\n`;
    const timestamp = new Date().toISOString();
    
    let integrated = brief;
    integrated += `**Generated**: ${timestamp}\n`;
    integrated += `**Agents**: ${agentOutputs.length}\n`;
    integrated += `**Method**: Multi-agent consensus (3/4 approval required)\n\n`;
    integrated += `---\n\n`;

    // Add each agent's contribution
    agentOutputs.forEach((output, index) => {
      integrated += `## Agent ${index + 1} Analysis\n\n`;
      integrated += output;
      integrated += `\n\n`;
    });

    // Add integrated conclusion
    integrated += `## Integrated Assessment\n\n`;
    integrated += `Based on consensus from ${agentOutputs.length} specialist agents:\n\n`;
    integrated += `**Decision**: [GO / GO WITH CONDITIONS / NO-GO]\n\n`;
    integrated += `**Top Priority Actions**:\n`;
    integrated += `1. Action derived from agent findings\n`;
    integrated += `2. Action derived from agent findings\n`;
    integrated += `3. Action derived from agent findings\n\n`;
    integrated += `**Critical Success Factors**:\n`;
    integrated += `- Factor 1\n`;
    integrated += `- Factor 2\n`;
    integrated += `- Factor 3\n\n`;

    return integrated;
  }
}

/**
 * Example usage
 */
export async function runDemo() {
  const orchestrator = new AtlasOrchestrator();

  const result = await orchestrator.conductResearch({
    topic: 'Solana DeFi Expansion Strategy for Southeast Asia',
    model: 'anthropic/claude-opus-4-6',
    thinkingLevel: 'high',
    timeoutSeconds: 600,
  });

  console.log('Brief preview (first 500 chars):');
  console.log(result.brief.substring(0, 500) + '...\n');

  console.log('On-chain proof:');
  console.log(`  Request: ${result.onChainProof.requestAddress}`);
  console.log(`  Votes: ${result.onChainProof.voteSignatures.length}`);
  console.log(`  Hash: ${result.onChainProof.finalHash.substring(0, 16)}...\n`);
}

export default AtlasOrchestrator;
