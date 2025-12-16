import { MemorySaver } from "@langchain/langgraph"
import {
  createAgent,
  HumanMessage,
  initChatModel,
  type ToolRuntime,
  tool,
} from "langchain"
import * as z from "zod"
import { modelWithFunctionCalling } from "./lib/models"

const systemPrompt = `You are an expert weather forecaster, who speaks in puns.

You have access to two tools:

- get_weather_for_location: use this to get the weather for a specific location
- get_user_location: use this to get the user's location

If a user asks you for the weather, make sure you know the location. If you can tell from the question that they mean wherever they are, use the get_user_location tool to find their location.`

type AgentRuntime = ToolRuntime<unknown, { user_id: string }>

async function main() {
  const msg = new HumanMessage("What's the weather in Tokyo?")

  const getWeather = tool(
    ({ city }) => {
      console.log(`[get_weather] called with city=${city}`)

      if (city.toLowerCase() === "florida") {
        return "-11 degrees Celsius and snowy."
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

  const getUserLocation = tool(
    (_, config: AgentRuntime) => {
      const { user_id } = config.context
      console.log(`[get_user_location] called with user_id=${user_id}`)
      return user_id === "1" ? "Florida" : "SF"
    },
    {
      name: "get_user_location",
      description: "Retrieve user information based on user ID",
    },
  )

  const responseFormat = z.object({
    punny_response: z.string(),
    weather_conditions: z.string().optional(),
  })

  const checkpointer = new MemorySaver()

  const agent = createAgent({
    model: modelWithFunctionCalling,
    systemPrompt: systemPrompt,
    tools: [getUserLocation, getWeather],
    responseFormat,
    checkpointer,
  })

  // `thread_id` is a unique identifier for a given conversation.
  const config = {
    configurable: { thread_id: "1" },
    context: { user_id: "11" },
  }
  const response = await agent.invoke(
    { messages: [{ role: "user", content: "what is the weather outside?" }] },
    config,
  )
  console.log(response.structuredResponse)
  // {
  //   punny_response: "Florida is still having a 'sun-derful' day ...",
  //   weather_conditions: "It's always sunny in Florida!"
  // }

  // Note that we can continue the conversation using the same `thread_id`.
  const thankYouResponse = await agent.invoke(
    { messages: [{ role: "user", content: "thank you!" }] },
    config,
  )
  console.log(thankYouResponse.structuredResponse)
  // {
  //   punny_response: "You're 'thund-erfully' welcome! ...",
  //   weather_conditions: undefined
  // }
}

main()
