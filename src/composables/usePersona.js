import { ref, computed } from 'vue'
import { PersonaStorage } from '@/lib/persona-storage'

/**
 * usePersona - Reactive persona management
 */
export function usePersona() {
  const storage = new PersonaStorage()
  const personas = ref([])
  const activePersonaId = ref('')

  const activePersona = computed(() => {
    return personas.value.find(p => p.id === activePersonaId.value) || personas.value[0] || null
  })

  /**
   * Load all personas from storage
   */
  async function loadPersonas() {
    const data = await storage.getAll()
    personas.value = data.personas
    activePersonaId.value = data.activePersonaId
    return data
  }

  /**
   * Switch to a different persona
   */
  async function switchPersona(id) {
    await storage.setActive(id)
    activePersonaId.value = id
  }

  /**
   * Save (create or update) a persona
   */
  async function savePersona(personaData) {
    const saved = await storage.save(personaData)
    await loadPersonas()
    return saved
  }

  /**
   * Delete a persona
   */
  async function deletePersona(id) {
    await storage.delete(id)
    await loadPersonas()
  }

  return {
    personas,
    activePersonaId,
    activePersona,
    loadPersonas,
    switchPersona,
    savePersona,
    deletePersona
  }
}
