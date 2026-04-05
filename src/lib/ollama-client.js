/**
 * OllamaClient - Handles API communication with Ollama (local or cloud)
 * Supports streaming and non-streaming chat completions
 */
export class OllamaClient {
  constructor(baseUrl = 'http://localhost:11434', model = 'translategemma:latest') {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.model = model
    this.abortController = null
  }

  /**
   * Stream chat completions from Ollama
   * @param {Array} messages - Array of { role, content } objects
   * @param {Object} options - Additional options (model override, temperature, etc.)
   * @yields {string} Text chunks as they arrive
   */
  async *streamChat(messages, options = {}) {
    this.abortController = new AbortController()

    console.log(`[OllamaClient] POST ${this.baseUrl}/api/chat`, messages)

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: (options && options.model) || this.model || 'translategemma:latest',
        messages,
        stream: true,
        options: {
          temperature: (options && options.temperature) ?? 0.7,
          ...((options && options.options) || {})
        }
      }),
      signal: this.abortController.signal
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error(`[OllamaClient] Chat API error (${response.status}):`, errText)
      throw new Error(`Ollama API error (${response.status}): ${errText}`)
    }

    console.log('[OllamaClient] Chat stream started successfully')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.message?.content) {
              yield data.message.content
            }
            if (data.done) return
          } catch {
            // Skip unparseable lines
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  /**
   * Non-streaming chat completion
   */
  async chat(messages, options = {}) {
    console.log(`[OllamaClient] POST ${this.baseUrl}/api/chat (non-stream)`, messages)
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: (options && options.model) || this.model || 'translategemma:latest',
        messages,
        stream: false,
        options: {
          temperature: (options && options.temperature) ?? 0.7,
          ...((options && options.options) || {})
        }
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      console.error(`[OllamaClient] Chat API error (${response.status}):`, errText)
      throw new Error(`Ollama API error (${response.status}): ${errText}`)
    }

    const data = await response.json()
    return data.message?.content || ''
  }

  /**
   * List available models from Ollama
   */
  async listModels() {
    console.log(`[OllamaClient] GET ${this.baseUrl}/api/tags`)
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      if (!response.ok) {
        console.error(`[OllamaClient] listModels failed (${response.status})`)
        throw new Error('Failed to fetch models')
      }
      const data = await response.json()
      console.log(`[OllamaClient] Found ${data.models?.length || 0} models`)
      return data.models || []
    } catch (err) {
      console.error('[OllamaClient] listModels fetch error:', err)
      throw err
    }
  }

  /**
   * Check if Ollama server is reachable
   */
  async ping() {
    console.log(`[OllamaClient] Pinging ${this.baseUrl}...`)
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(5000)
      })
      console.log(`[OllamaClient] Ping response: ${response.ok ? 'OK' : 'FAIL'}`)
      return response.ok
    } catch (err) {
      console.warn('[OllamaClient] Ping failed:', err)
      return false
    }
  }

  /**
   * Cancel ongoing stream
   */
  cancelStream() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}
