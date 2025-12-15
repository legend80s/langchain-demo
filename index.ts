import { ChatOpenAI } from "@langchain/openai"
import { createAgent, HumanMessage, tool } from "langchain"
import * as z from "zod"

async function main() {
  const open = new ChatOpenAI({
    apiKey: process.env.ARK_API_KEY,
    model: "doubao-seed-1-6-lite-251015",
    configuration: {
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      // logLevel: "debug",
    },
  })
  const model = open

  const msg = new HumanMessage("What's the weather in Tokyo?")

  const getWeather = tool(
    ({ city }) => {
      console.log(`[get_weather] called with city=${city}`)

      // return 10 degrees Celsius and sunny in jiaxing
      if (city.toLowerCase() === "jiaxing") {
        return "11 degrees Celsius and rainy."
      }

      return `It's always sunny in ${city}!`
    },

    {
      name: "get_weather",
      description: "Get the weather for a given city",
      schema: z.object({
        city: z.string(),
      }),
    },
  )

  const agent = createAgent({
    model,
    tools: [getWeather],
  })

  const resp = await agent.invoke({
    messages: [msg],
  })
  // console.log("resp:", resp)
  // console.log(
  //   "resp content:",
  //   resp.messages.map((x) => `|${x.content}|`),
  // )
  // console.log(
  //   "resp text:",
  //   resp.messages.map((x) => `|${x.text}|`),
  // )
  console.log("\n---\nFinal output:")
  console.log(
    resp.messages
      .filter((x) => x.type === "ai")
      .map((x) => x.content)
      .join("\n"),
  )

  // let full: AIMessageChunk | null = null

  // for await (const chunk of resp) {
  //   console.log("chunk:", chunk)
  //   // full = full ? full.concat(chunk) : chunk
  //   // full.text && console.log(full.text)
  //   // console.log(full.text)
  //   // process.stdout.write(full.text + "\r")

  //   // for (const block of chunk.contentBlocks) {
  //   //   if (block.type === "reasoning") {
  //   //     console.log(`Reasoning: ${block.reasoning}`)
  //   //   } else if (block.type === "tool_call_chunk") {
  //   //     console.log(`Tool call chunk: ${block}`)
  //   //   } else if (block.type === "text") {
  //   //     console.log("text:", block.text)
  //   //   } else {
  //   //     // ...
  //   //     console.error(`Unknown block type: ${block.type}`)
  //   //   }
  //   // }
  // }
  // console.log("\n---\nFinal output:")

  // console.log(full?.contentBlocks)
}

main()
