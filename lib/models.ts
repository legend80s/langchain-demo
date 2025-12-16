import { ChatOpenAI } from "@langchain/openai"

export const modelWithFunctionCalling = new ChatOpenAI({
  apiKey: process.env.ARK_API_KEY,
  model: "doubao-seed-1-6-lite-251015",
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    // logLevel: "debug",
  },
  // temperature: 0,
  // timeout: 10,
  // maxTokens: 1000,
})

export const model = new ChatOpenAI({
  apiKey: process.env.ARK_API_KEY,
  model: "doubao-lite-32k-character-250228",
  configuration: {
    baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    // logLevel: "debug",
  },
  // temperature: 0,
  // timeout: 10,
  // maxTokens: 1000,
})
