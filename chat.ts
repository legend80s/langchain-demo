// npm install @langchain/anthropic to call the model
import { createAgent, tool } from "langchain"
import * as z from "zod"
import { ChatOpenAI } from "@langchain/openai"

const key = process.env.ARK_API_KEY

console.log("Using API Key:", key)

// https://docs.langchain.com/oss/javascript/integrations/chat/zhipuai
// import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatZhipuAI } from "@langchain/community/chat_models/zhipuai"

import { HumanMessage, type AIMessageChunk } from "@langchain/core/messages"

async function main() {
  // Use glm-4
  const glm4 = new ChatZhipuAI({
    model: "glm-4.5-flash", // Available models:
    temperature: 0.3,
    // streaming: true,

    zhipuAIApiKey: key, // In Node.js defaults to process.env.ZHIPUAI_API_KEY
  })

  const open = new ChatOpenAI({
    apiKey: process.env.ARK_API_KEY,
    model: "doubao-lite-32k-character-250228",
    configuration: {
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
    },
  })
  const msg = "Tell me a joke about computers."
  const model = open
  // const response = await model.invoke([new HumanMessage("hi")])
  // console.log("Response:", response)

  // const model = new ChatDeepSeek({
  // 	apiKey: process.env.DEEPSEEK_API_KEY, // Default value.
  // 	model: "<model_name>",
  // });

  const stream = await model.stream([
    // {
    //   role: "user",
    //   content: "Tell me a joke about computers.",
    // },
    new HumanMessage(msg),
    // new HumanMessage({ content: "Hi" }),
  ])

  // const stream = await model.streamEvents("Hello", { version: "v2" })
  // for await (const event of stream) {
  //   if (event.event === "on_chat_model_start") {
  //     // console.log(`Input: ${event.data.input}`)
  //   }
  //   if (event.event === "on_chat_model_stream") {
  //     console.log(`Token: ${event.data.chunk.text}`)
  //     // event.data.chunk.text && console.log(`Token: ${event.data.chunk.text}`)
  //   }
  //   if (event.event === "on_chat_model_end") {
  //     console.log(`Full message: ${event.data.output.text}`)
  //   }
  // }

  // return ""

  let full: AIMessageChunk | null = null

  for await (const chunk of stream) {
    // console.log("chunk:", chunk)
    full = full ? full.concat(chunk) : chunk
    // full.text && console.log(full.text)
    console.log(full.text)
    // process.stdout.write(full.text + "\r")

    // for (const block of chunk.contentBlocks) {
    //   if (block.type === "reasoning") {
    //     console.log(`Reasoning: ${block.reasoning}`)
    //   } else if (block.type === "tool_call_chunk") {
    //     console.log(`Tool call chunk: ${block}`)
    //   } else if (block.type === "text") {
    //     console.log("text:", block.text)
    //   } else {
    //     // ...
    //     console.error(`Unknown block type: ${block.type}`)
    //   }
    // }
  }
  console.log("\n---\nFinal output:")

  console.log(full?.contentBlocks)

  return "Not implemented"

  // const getWeather = tool(({ city }) => `It's always sunny in ${city}!`, {
  //   name: "get_weather",
  //   description: "Get the weather for a given city",
  //   schema: z.object({
  //     city: z.string(),
  //   }),
  // })

  // const agent = createAgent({
  //   model,
  //   tools: [getWeather],
  // })

  // console.log(
  //   await agent.invoke({
  //     messages: [{ role: "user", content: "What's the weather in Tokyo?" }],
  //   }),
  // )
}

main()
