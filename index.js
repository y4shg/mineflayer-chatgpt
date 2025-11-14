const mineflayer = require('mineflayer')
const dotenv = require('dotenv')
const axios = require('axios')
dotenv.config()

const openaiApiKey = process.env.OPENAI_API_KEY
const openaiApiUrl = 'https://api.naga.ac/v1/chat/completions'

const bot = mineflayer.createBot({
  host: process.env.MINECRAFT_SERVER_HOST,
  port: parseInt(process.env.MINECRAFT_SERVER_PORT),
  username: process.env.MINECRAFT_USERNAME,
  auth: process.env.MINECRAFT_AUTH,
  version: process.env.MINECRAFT_VERSION,
})

bot.on('kicked', console.log)

bot.on('spawn', () => {
  console.log('Chatbot spawned')
  
  // Disable all movement and actions - bot will ONLY chat
  bot.clearControlStates()
})

// Prevent any movement commands
bot.on('move', () => {
  bot.clearControlStates()
})

bot.on('chat', async (username, message) => {
  if (username === bot.username) return

  console.log(`${username}: ${message}`)

  // Check if message starts with !gpt
  if (!message.startsWith('!gpt ')) return

  // Extract the actual message after !gpt
  const actualMessage = message.slice(5).trim()
  
  // Skip if there's no message after !gpt
  if (!actualMessage) return

  try {
    // No history - each message is independent
    const messages = [
      {
        role: 'system',
        content:
          'You are an AI assistant that chats with players in a Minecraft world. You are a helpful conversational assistant. You do not have access to game information, player positions, inventory, or world data. Simply have friendly conversations with players.',
      },
      {
        role: 'user',
        content: actualMessage
      }
    ]

    const response = await axios.post(
      openaiApiUrl,
      {
        model: 'chatgpt-4o-latest:free',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    )

    const chatReply = response.data.choices[0].message.content.trim()
    console.log(`Chatbot: ${chatReply}`)

    bot.chat(chatReply)
  } catch (error) {
    console.error('Error getting response from OpenAI API:', error)
  }
})
