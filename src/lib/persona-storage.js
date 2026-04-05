/**
 * PersonaStorage - CRUD operations for Personas in chrome.storage.local
 */
export class PersonaStorage {
  static DEFAULT_PERSONA = {
    id: 'default',
    name: 'General Translator',
    target_lang: 'Vietnamese',
    domain: 'General',
    style: 'Natural & Clear',
    config: {
      type: 'local',
      url: 'http://localhost:11434',
      model: 'translategemma:latest'
    },
    createdAt: Date.now()
  }

  /**
   * Get all personas and the active persona ID
   */
  async getAll() {
    return new Promise(resolve => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        // Fallback for dev mode
        resolve({
          activePersonaId: PersonaStorage.DEFAULT_PERSONA.id,
          personas: [{ ...PersonaStorage.DEFAULT_PERSONA }]
        })
        return
      }
      chrome.storage.local.get(['activePersonaId', 'personas'], (result) => {
        if (!result.personas || result.personas.length === 0) {
          resolve({
            activePersonaId: PersonaStorage.DEFAULT_PERSONA.id,
            personas: [{ ...PersonaStorage.DEFAULT_PERSONA }]
          })
        } else {
          resolve({
            activePersonaId: result.activePersonaId || result.personas[0].id,
            personas: result.personas
          })
        }
      })
    })
  }

  /**
   * Get the currently active persona
   */
  async getActive() {
    const { activePersonaId, personas } = await this.getAll()
    return personas.find(p => p.id === activePersonaId) || personas[0]
  }

  /**
   * Create or update a persona. Also sets it as active.
   */
  async save(persona) {
    const { personas } = await this.getAll()

    if (!persona.id) {
      persona.id = 'persona_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
      persona.createdAt = Date.now()
    }

    // Ensure config defaults
    persona.config = {
      type: 'local',
      url: 'http://localhost:11434',
      model: 'translategemma:latest',
      ...(persona.config || {})
    }

    const index = personas.findIndex(p => p.id === persona.id)
    if (index >= 0) {
      personas[index] = { ...personas[index], ...persona, updatedAt: Date.now() }
    } else {
      personas.push(persona)
    }

    return new Promise(resolve => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve(persona)
        return
      }
      chrome.storage.local.set(
        { personas, activePersonaId: persona.id },
        () => resolve(persona)
      )
    })
  }

  /**
   * Delete a persona by ID
   */
  async delete(id) {
    const { activePersonaId, personas } = await this.getAll()
    let filtered = personas.filter(p => p.id !== id)

    if (filtered.length === 0) {
      filtered = [{ ...PersonaStorage.DEFAULT_PERSONA }]
    }

    const newActiveId = (activePersonaId === id)
      ? filtered[0].id
      : activePersonaId

    return new Promise(resolve => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve()
        return
      }
      chrome.storage.local.set(
        { personas: filtered, activePersonaId: newActiveId },
        resolve
      )
    })
  }

  /**
   * Switch active persona
   */
  async setActive(id) {
    return new Promise(resolve => {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        resolve()
        return
      }
      chrome.storage.local.set({ activePersonaId: id }, resolve)
    })
  }
}
