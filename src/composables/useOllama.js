import { ref, shallowRef } from 'vue'
import { OllamaClient } from '@/lib/ollama-client'

/**
 * useOllama - Reactive wrapper around OllamaClient for streaming chat
 */
export function useOllama() {
  const client = shallowRef(null)
  const streamingText = ref('')
  const isStreaming = ref(false)
  const error = ref(null)
  const isConnected = ref(false)

  /**
   * Initialize or re-initialize the Ollama client
   */
  function initClient(baseUrl = 'http://localhost:11434', model = 'translategemma:latest') {
    console.log(`[useOllama] Initializing client: ${baseUrl}, model: ${model}`)
    client.value = new OllamaClient(baseUrl, model)
    checkConnection()
  }

  /**
   * Check if Ollama server is reachable
   */
  async function checkConnection() {
    if (!client.value) {
      console.warn('[useOllama] Cannot check connection: client not initialized')
      isConnected.value = false
      return false
    }
    const result = await client.value.ping()
    console.log(`[useOllama] Connection check: ${result ? 'CONNECTED' : 'NOT CONNECTED'}`)
    isConnected.value = result
    return result
  }

  /**
   * Stream a chat response. Returns the full accumulated text.
   * @param {Array} messages - Chat messages array
   * @param {Function} onChunk - Optional callback called with (chunk, fullText) on each chunk
   */
  async function streamChat(messages, onChunk = null) {
    if (!client.value) throw new Error('Ollama client not initialized')

    isStreaming.value = true
    streamingText.value = ''
    error.value = null

    try {
      console.log('[useOllama] Starting streamChat...')
      for await (const chunk of client.value.streamChat(messages)) {
        streamingText.value += chunk
        onChunk?.(chunk, streamingText.value)
      }
      console.log('[useOllama] Stream completed successfully')
      return streamingText.value
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[useOllama] Stream aborted by user')
        return streamingText.value
      }
      console.error('[useOllama] Stream error:', err)
      error.value = err.message
      throw err
    } finally {
      isStreaming.value = false
    }
  }

  /**
   * Cancel an ongoing stream
   */
  function cancelStream() {
    client.value?.cancelStream()
    isStreaming.value = false
  }

  return {
    client,
    streamingText,
    isStreaming,
    error,
    isConnected,
    initClient,
    checkConnection,
    streamChat,
    cancelStream
  }
}
