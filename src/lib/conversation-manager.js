/**
 * ConversationManager - Manages chat history and system prompts
 * for Interview Mode and Translation Mode
 */
export class ConversationManager {
  constructor() {
    this.messages = []
    this.mode = 'interview'
  }

  // ---- System Prompts ----

  static INTERVIEW_SYSTEM_PROMPT = `Bạn là "Persona Agent", một chuyên gia thiết lập hồ sơ dịch thuật cá nhân. Nhiệm vụ: dẫn dắt người dùng qua một cuộc phỏng vấn ngắn gọn để tạo Persona dịch thuật.

Cần thu thập 4 thông tin:
1. target_lang – Ngôn ngữ đích (VD: Vietnamese, English, Japanese)
2. domain – Lĩnh vực chuyên môn (VD: Fullstack Web Development, Y khoa, Marketing)
3. style – Phong cách dịch (VD: Technical & Concise, Casual, Academic)
4. config – Kết nối: local Ollama (localhost) hay Cloud API

LUẬT BẮT BUỘC:
1. Chỉ hỏi MỘT câu mỗi lượt. Không bao giờ hỏi nhiều câu cùng lúc.
2. Bắt đầu bằng lời chào thân thiện, sau đó hỏi ngôn ngữ đích.
3. Nếu câu trả lời quá chung chung hoặc mơ hồ, hãy đặt câu hỏi đào sâu. Ví dụ:
   - "Làm về máy tính" → "Máy tính rất rộng. Bạn là lập trình viên, kỹ thuật viên phần cứng, hay tester? Điều này giúp tôi chọn thuật ngữ chuẩn xác nhất."
   - "Dịch bình thường" → "Bạn muốn phong cách học thuật chuyên nghiệp, thân mật kiểu Gen Z, hay cực kỳ ngắn gọn? Mỗi kiểu sẽ cho ra bản dịch rất khác nhau."
4. Giữ giọng văn thân thiện, ngắn gọn, chuyên nghiệp.
5. Khi ĐÃ ĐỦ cả 4 thông tin, tóm tắt Persona cho người dùng xác nhận, rồi kết thúc CHÍNH XÁC bằng:
   [UPDATE_PERSONA: {"name": "tên_gợi_ý", "target_lang": "...", "domain": "...", "style": "...", "config": {"type": "local_hoặc_cloud", "url": "url_nếu_có", "model": "tên_model"}}]

Chuỗi [UPDATE_PERSONA: {...}] PHẢI nằm ở cuối message và JSON phải hợp lệ.`

  static TRANSLATION_SYSTEM_PROMPT(persona) {
    return `Bạn là chuyên gia dịch thuật AI với hồ sơ:
- Tên Persona: ${persona.name}
- Ngôn ngữ đích: ${persona.target_lang}
- Lĩnh vực: ${persona.domain}
- Phong cách: ${persona.style}

LUẬT DỊCH:
1. Tự động nhận diện ngôn ngữ nguồn.
2. Dịch sang ${persona.target_lang} theo đúng phong cách "${persona.style}".
3. Ưu tiên thuật ngữ chuyên ngành "${persona.domain}".
4. Nếu có ngữ cảnh (context) kèm theo, sử dụng để dịch chính xác hơn.
5. Chỉ trả bản dịch, KHÔNG giải thích trừ khi người dùng yêu cầu.
6. Với đoạn code hoặc markup, giữ nguyên code, chỉ dịch phần text/comment.

Nếu người dùng yêu cầu thay đổi persona (VD: "đổi phong cách", "tạo persona mới"), thực hiện và kết thúc bằng:
[UPDATE_PERSONA: {"name": "...", "target_lang": "...", "domain": "...", "style": "...", "config": {"type": "...", "url": "..."}}]`
  }

  // ---- Quick Chips Suggestions ----

  static INTERVIEW_CHIPS = [
    {
      keywords: ['ngôn ngữ', 'language', 'trả về'],
      chips: ['Tiếng Việt', 'English', '日本語', '中文', '한국어']
    },
    {
      keywords: ['lĩnh vực', 'domain', 'làm việc', 'chuyên môn', 'ngành'],
      chips: ['IT / Lập trình', 'Marketing', 'Y khoa', 'Tài chính', 'Nghiên cứu khoa học', 'Chung']
    },
    {
      keywords: ['phong cách', 'style', 'giọng văn', 'cách dịch'],
      chips: ['Học thuật & Chuyên nghiệp', 'Thân mật kiểu Gen Z', 'Cực kỳ ngắn gọn', 'Trang trọng']
    },
    {
      keywords: ['localhost', 'ollama', 'cloud', 'kết nối', 'api', 'server'],
      chips: ['Localhost (Ollama)', 'Cloud API']
    }
  ]

  /**
   * Detect which quick chips to show based on AI's last message
   */
  static detectChips(aiMessage) {
    const lower = aiMessage.toLowerCase()
    for (const group of ConversationManager.INTERVIEW_CHIPS) {
      if (group.keywords.some(kw => lower.includes(kw))) {
        return group.chips
      }
    }
    return []
  }

  /**
   * Build a system prompt for editing an existing persona
   * AI knows current values and only updates what the user wants to change
   */
  static buildEditSystemPrompt(persona) {
    const configInfo = persona.config?.type === 'cloud'
      ? `Cloud API (url: ${persona.config.url || 'chưa có'})`
      : `Local Ollama (${persona.config?.url || 'http://localhost:11434'}, model: ${persona.config?.model || 'translategemma:latest'})`

    return `Bạn là "Persona Agent", chuyên gia chỉnh sửa hồ sơ dịch thuật. Người dùng muốn CHỈNH SỬA một Persona hiện có.

PERSONA HIỆN TẠI:
- Tên: ${persona.name}
- Ngôn ngữ đích: ${persona.target_lang}
- Lĩnh vực: ${persona.domain}
- Phong cách: ${persona.style}
- Kết nối: ${configInfo}

NHIỆM VỤ:
1. Hỏi người dùng muốn thay đổi điều gì (có thể là 1 hoặc nhiều trường).
2. Chỉ hỏi về những trường mà người dùng muốn thay đổi.
3. Giữ nguyên tất cả các trường KHÔNG được đề cập thay đổi.
4. Khi đã đủ thông tin, tóm tắt lại Persona mới và kết thúc CHÍNH XÁC bằng:
   [UPDATE_PERSONA: {"name": "...", "target_lang": "...", "domain": "...", "style": "...", "config": {"type": "local_hoặc_cloud", "url": "url_nếu_có", "model": "tên_model"}}]

LƯU Ý: JSON trong [UPDATE_PERSONA: ...] phải chứa ĐẦY ĐỦ 4 trường (kể cả những trường không thay đổi).
Chuỗi [UPDATE_PERSONA: {...}] PHẢI nằm ở cuối message và JSON phải hợp lệ.`
  }

  // ---- Methods ----

  reset(mode = 'interview', editTarget = null) {
    this.mode = mode
    this.messages = []
    if (mode === 'edit' && editTarget) {
      this.messages.push({
        role: 'system',
        content: ConversationManager.buildEditSystemPrompt(editTarget)
      })
    } else {
      this.messages.push({
        role: 'system',
        content: ConversationManager.INTERVIEW_SYSTEM_PROMPT
      })
    }
  }

  setTranslationMode(persona) {
    this.mode = 'translation'
    this.messages = [{
      role: 'system',
      content: ConversationManager.TRANSLATION_SYSTEM_PROMPT(persona)
    }]
  }

  addMessage(role, content) {
    this.messages.push({ role, content })
  }

  getMessages() {
    return [...this.messages]
  }

  getDisplayMessages() {
    return this.messages.filter(m => m.role !== 'system')
  }

  buildTranslationPrompt(text, context = '') {
    let prompt = `Dịch:\n\n"${text}"`
    if (context && context !== text) {
      prompt += `\n\nNgữ cảnh:\n"${context.substring(0, 500)}"`
    }
    return prompt
  }

  /**
   * Extract [UPDATE_PERSONA: {...}] from AI response
   */
  extractPersonaUpdate(text) {
    const regex = /\[UPDATE_PERSONA:\s*(\{[\s\S]*?\})\]/
    const match = text.match(regex)
    if (!match) return null
    try {
      const data = JSON.parse(match[1])
      // Validate required fields
      if (data.target_lang && data.domain && data.style) {
        return data
      }
      return null
    } catch {
      console.warn('[ConversationManager] Failed to parse persona JSON')
      return null
    }
  }

  /**
   * Remove the [UPDATE_PERSONA: ...] tag from display text
   */
  cleanDisplayText(text) {
    return text.replace(/\[UPDATE_PERSONA:\s*\{[\s\S]*?\}\]/, '').trim()
  }
}
