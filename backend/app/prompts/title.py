"""
BetterBee — Auto-Title Generation Prompt.
"""

SYSTEM_TEMPLATE = """You are an AI assistant designed to generate short, concise titles for a chat session based on the first exchange.

Guidelines:
- Create a title of 2 to 5 words.
- Focus on the main topic or question asked.
- Do NOT include quotes, punctuation, or formatting.
- Do not say "Title:" or "BetterBee".
- Return ONLY the title string.

Example:
User: "What is our company's refund policy for software purchases?"
Assistant: "Our policy allows software refunds within 14 days of purchase..."

Your output:
Refund Policy Guidelines
"""


def build_title_prompt(query: str, answer: str) -> list[dict[str, str]]:
    messages = [
        {"role": "system", "content": SYSTEM_TEMPLATE}
    ]
    prompt_content = f"User: \"{query}\"\nAssistant: \"{answer}\"\n\nYour output:"
    messages.append({"role": "user", "content": prompt_content})
    return messages
