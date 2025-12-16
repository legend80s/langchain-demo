import { createAgent } from "langchain"
import * as z from "zod"
import { modelWithFunctionCalling } from "./lib/models.ts"

const ContactInfo = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
})

const agent = createAgent({
  model: modelWithFunctionCalling,
  responseFormat: ContactInfo,
})

const result = await agent.stream({
  messages: [
    {
      role: "user",
      content:
        "Extract contact info from: John Doe, john@example.com, (555) 123-4567",
    },
  ],
})

for await (const chunk of result) {
  // Each chunk contains the full state at that point
  // const latestMessage = chunk.messages?.messages.at(-1)
  // console.log("Received chunk.messages:", chunk.model_request?.messages)
  const latestMessage = chunk.model_request?.messages.at(-1)
  if (latestMessage?.content) {
    console.log(`Agent: ${latestMessage.content}`)
  } else if (latestMessage?.tool_calls) {
    const toolCallNames = latestMessage.tool_calls.map((tc) => tc.name)
    console.log(`Calling tools: ${toolCallNames.join(", ")}`)
  }

  if (chunk.structuredResponse) {
    console.log("Structured Response:", chunk.structuredResponse)
  }
}

// console.log(result.structuredResponse)
// {
//   name: 'John Doe',
//   email: 'john@example.com',
//   phone: '(555) 123-4567'
// }
