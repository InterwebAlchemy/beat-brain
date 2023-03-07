import { LLMChain } from 'langchain'
import { ChatOpenAI } from 'langchain/chat_models'
import { ZeroShotAgent, AgentExecutor } from 'langchain/agents'

import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate
} from 'langchain/prompts'

import SpotifyTools from '../../tools/spotify'

const BEATBRAIN = `You are BeatBrain, AI Assistant for the Music Genomic Research Initiative.

The goal of BeatBrain is to classify tracks based on multiple attributes, such as genre, tempo, instrumentation, lyrics, and mood, in order to provide accurate recommendations when a user provides an input in the following formats:

1. "{Song} - {Artist}"
2. "Mood: {Mood}"

If given a Song:

1.  Describe the attributes of the track that stand out when classifying it
2.  Provide 5 songs by different {Artist}s available on Spotify that are similar
3. Generate a playlist with the provided Song as the first track and the other 5 tracks

If given a Mood:

1. Provide a playlist of 6 {Song}s by different {Artist}s available on Spotify that embody that mood
2. Describe why each track was selected

When generating a playlist, please provide a short name and description for it.

BeatBrain can also continuously update its algorithm to include new information, such as sentiment analysis, mood descriptions, prevalent themes, etc. when the user provides an input in the following format: "Debug: {INPUT}"`

const tools = SpotifyTools

const prompt = ZeroShotAgent.createPrompt(tools, {
  prefix: BEATBRAIN,
  suffix: `BeatBrain has the personality of a '90s radio DJ.`
})

const chatPrompt = ChatPromptTemplate.fromPromptMessages([
  new SystemMessagePromptTemplate(prompt),
  HumanMessagePromptTemplate.fromTemplate(`{input}

This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
{agent_scratchpad}`)
])

const chat = new ChatOpenAI({
  streaming: true,
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.8,
  maxTokens: 1000,
  callbackManager: {
    handleNewToken(token) {
      console.log(token)
    }
  }
})

const llmChain = new LLMChain({
  prompt: chatPrompt,
  llm: chat
})

const agent = new ZeroShotAgent({
  llmChain,
  allowedTools: tools.map((tool) => tool.name)
})

const executor = AgentExecutor.fromAgentAndTools({ agent, tools })

export default executor

// import { OpenAI } from 'langchain/llms'
// import { PromptTemplate } from 'langchain/prompts'
// import { BufferMemory } from "langchain/memory";
// import { ConversationChain } from "langchain/chains";

// const chat = (): void => {
//   const MOOD = 'Mood: {mood}'
//   const TRACK = '{song} - {artist}'

//   const moodTemplate = new PromptTemplate({
//     template: MOOD,
//     inputVariables: ['mood']
//   })

//   const songTempalte = new PromptTemplate({
//     template: TRACK,
//     inputVariables: ['Song', 'Artist']
//   })

//   const llm = new OpenAI({
//     openAIApiKey: process.env.OPENAI_API_KEY,
//     modelName: 'gpt-3.5-turbo',
//     temperature: 0.8,
//     maxTokens: 1000,
//   })

//   const memory = new BufferMemory();

//   const chain = new ConversationChain({ llm, memory,});

// }

// export default chat
