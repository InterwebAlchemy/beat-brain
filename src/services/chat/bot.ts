import { LLMChain } from 'langchain'
import { ChatOpenAI } from 'langchain/chat_models'

import { ZeroShotAgent, AgentExecutor } from 'langchain/agents'

import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} from 'langchain/prompts'

import SpotifyTools from '../../tools/spotify'

import {
  BEATBRAIN_PREFIX,
  BEATBRAIN_SUFFIX,
  BEATBRAIN_MODES,
  BEATBRAIN_TOOLS
} from './prompts/system'

const tools = SpotifyTools

const agentPrompt = ZeroShotAgent.createPrompt(tools, {
  prefix: `${BEATBRAIN_PREFIX}\n${BEATBRAIN_MODES}\n${BEATBRAIN_TOOLS}`,
  suffix: `${BEATBRAIN_SUFFIX}`,
  inputVariables: ['input', 'agent_scratchpad']
})

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  new SystemMessagePromptTemplate(agentPrompt),
  HumanMessagePromptTemplate.fromTemplate(`{mode}: {input}

This was your previous work, but I haven't seen any of it! I only see what you return as the final answer:
{agent_scratchpad}`)
])

const chat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.75,
  maxTokens: 2000
})

const chain = new LLMChain({
  prompt: chatPrompt,
  llm: chat
})

const agent = new ZeroShotAgent({
  llmChain: chain,
  allowedTools: tools.map((tool) => tool.name)
})

export const bot = AgentExecutor.fromAgentAndTools({
  agent,
  tools,
  returnIntermediateSteps: true,
  maxIterations: 5,
  earlyStoppingMethod: 'generate'
})
