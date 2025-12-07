/**
 * Agricultural Training Course Content Generation Prompts
 * For Pig and Poultry Farming Training Modules
 * 
 * Original Version - General Agricultural Training
 */

import type {
  SessionPromptParams,
  UnitTitlePromptParams,
  CourseIntroductionPromptParams,
  GlossaryPromptParams,
  ImagePromptParams,
} from "./types";

/**
 * Generate a comprehensive prompt for creating agricultural training session content.
 */
export function generateAgriculturalSessionPrompt(params: SessionPromptParams): string {
  const {
    courseTitle,
    unitNumber,
    unitTitle,
    sessionNumber,
    sessionTopic,
    animalType,
    targetAudience,
    previousSessionTopics = [],
    additionalContext = "",
    language = "English",
  } = params;

  const previousStr = previousSessionTopics.length > 0
    ? previousSessionTopics.map((topic) => `- ${topic}`).join("\n")
    : "None";

  let animalContext = "";
  if (animalType.toLowerCase() === "pig") {
    animalContext = "This content is specifically for pig farming operations.";
  } else if (animalType.toLowerCase() === "poultry") {
    animalContext = "This content is specifically for poultry farming operations.";
  } else {
    animalContext = "This content covers both pig and poultry farming, with clear distinctions where applicable.";
  }

  let audienceContext = "";
  if (targetAudience.toLowerCase() === "beginner") {
    audienceContext = "Write for farmers who are new to this topic. Use simple language, explain all technical terms, and provide step-by-step guidance.";
  } else if (targetAudience.toLowerCase() === "intermediate") {
    audienceContext = "Write for farmers with some experience. Assume basic knowledge but explain advanced concepts clearly.";
  } else if (targetAudience.toLowerCase() === "advanced") {
    audienceContext = "Write for experienced farmers. Focus on advanced techniques, optimization, and best practices.";
  } else {
    audienceContext = `Write for ${targetAudience}. Adjust complexity and depth accordingly.`;
  }

  const prompt = `
You are an expert agricultural training content creator specializing in ${animalType} farming. Create detailed, practical training content for farmers.

${animalContext}
${audienceContext}

COURSE CONTEXT:
- Course Title: ${courseTitle}
- Unit ${unitNumber}: ${unitTitle}
- Session ${sessionNumber}: ${sessionTopic}
- Previous sessions covered:
${previousStr}

${additionalContext ? additionalContext : ""}

CRITICAL CONTENT REQUIREMENTS:
- Focus on PRACTICAL, ACTIONABLE guidance that farmers can implement immediately
- Use clear, straightforward language suitable for field application
- Include real-world examples from actual farming scenarios
- Provide step-by-step instructions where applicable
- Emphasize best practices, common mistakes to avoid, and troubleshooting
- Do NOT repeat content from previous sessions
- Make content immediately applicable to daily farming operations

MARKDOWN FORMATTING REQUIREMENTS:
- Use proper Markdown syntax: # for main headings, ## for sections, ### for subsections
- NEVER use #### or deeper heading levels
- Use blank lines between paragraphs
- Use - for bullet points, 1. for numbered lists
- Tables MUST use GitHub-Flavored Markdown format with header separator (| --- | --- |)
- NEVER output HTML tags like <table>, <tr>, <td>
- Each table row on a new line with cells separated by pipes: | cell | cell |
- Use **bold** for emphasis and *italic* for technical terms
- Insert explicit newline characters between paragraphs

STRICT SESSION STRUCTURE (follow this order):

1. **Session Overview**
   - Brief 2-3 paragraph introduction explaining what farmers will learn
   - Why this topic matters for their farming operations
   - Real-world relevance and impact on farm productivity

2. **Key Concepts & Definitions**
   - Define 5-7 essential terms farmers need to understand
   - Use simple, clear definitions with practical context
   - Format: Term: Definition (with practical example)

3. **Practical Guide: Step-by-Step Instructions**
   - Provide detailed, numbered step-by-step instructions
   - Include timing, quantities, measurements where relevant
   - Add safety considerations and precautions
   - Format as: Step 1, Step 2, etc. with clear actions

4. **Best Practices & Tips**
   - List 8-10 practical tips farmers should follow
   - Include do's and don'ts
   - Provide time-saving or cost-saving recommendations
   - Format as bullet points with brief explanations

5. **Common Problems & Solutions**
   - Create a troubleshooting table with:
     | Problem | Symptoms | Cause | Solution |
   - Include 6-8 common issues farmers face
   - Provide actionable solutions

6. **Equipment & Materials Needed**
   - List required equipment, tools, or materials
   - Include approximate costs if relevant
   - Specify alternatives or budget-friendly options
   - Format as a table or organized list

7. **Real-World Case Studies**
   - Provide 2-3 brief case studies (1-2 paragraphs each)
   - Show successful implementation examples
   - Include lessons learned and key takeaways

8. **Maintenance & Follow-Up**
   - Explain ongoing maintenance requirements
   - Provide a checklist or schedule
   - Include monitoring and evaluation steps

9. **Quick Reference Checklist**
   - Create a practical checklist farmers can use
   - Format as a table with checkboxes: | Task | Status |
   - Include 8-10 essential tasks

10. **Additional Resources & Next Steps**
    - Suggest related topics to explore
    - Recommend further reading or resources
    - Link to next session or related units

CONTENT DEPTH REQUIREMENTS:
- Total content should span 4-5 Microsoft Word pages (A4, 12pt, single spacing)
- Introduction: 2-3 comprehensive paragraphs
- Each major section: 2-3 paragraphs with detailed explanations
- Include practical examples throughout
- Use tables for comparisons, checklists, and troubleshooting
- Ensure content is dense with actionable information

PRACTICAL EMPHASIS:
- Every section should answer: "What should the farmer DO?"
- Include specific measurements, timings, quantities
- Provide visual descriptions for diagrams/illustrations needed
- Reference common farm sizes and scales
- Address cost considerations where relevant

OUTPUT FORMAT:
---
Title: <session_title>
Content:
<session_content_in_markdown>
Image Prompt:
<detailed_description_for_illustration>
---

LENGTH REQUIREMENT:
Ensure the session content is comprehensive (4-5 pages) and immediately actionable for farmers.

LANGUAGE:
Write everything in ${language}. Use clear, professional language suitable for agricultural training.

QUALITY STANDARDS:
- Content must be accurate and based on proven farming practices
- All instructions must be safe and follow agricultural best practices
- Technical terms should be explained in context
- Content should be culturally appropriate for the target region
- Avoid theoretical content; focus on practical application
`;

  return prompt.trim();
}

/**
 * Generate a prompt for creating unit titles.
 */
export function generateUnitTitlePrompt(params: UnitTitlePromptParams): string {
  const {
    courseTitle,
    unitNumber,
    animalType,
    previousUnitTitles = [],
    language = "English",
  } = params;

  const previousStr = previousUnitTitles.length > 0
    ? previousUnitTitles.join(", ")
    : "None";

  const prompt = `
You are an agricultural training curriculum designer.

Generate a creative, descriptive title for Unit ${unitNumber} in a course titled: "${courseTitle}"

Context:
- Animal Type: ${animalType}
- Previous unit titles: ${previousStr}
- This is a practical training course for farmers

Requirements:
- Title should be clear and descriptive
- Should indicate what farmers will learn
- Should be practical and action-oriented
- Do NOT repeat previous titles
- Keep title concise (5-8 words)

Respond ONLY with the unit title, no numbers, no quotes, no additional text.
`;

  return prompt.trim();
}

/**
 * Generate a prompt for creating course introduction/overview.
 */
export function generateCourseIntroductionPrompt(params: CourseIntroductionPromptParams): string {
  const {
    courseTitle,
    animalType,
    targetAudience,
    topicsCovered,
    language = "English",
  } = params;

  const topicsStr = topicsCovered.map((topic) => `- ${topic}`).join("\n");

  const prompt = `
You are an agricultural training content creator.

Create a comprehensive course introduction for: "${courseTitle}"

Context:
- Animal Type: ${animalType}
- Target Audience: ${targetAudience}
- Topics covered in this course:
${topicsStr}

Requirements:
- Write 3-4 paragraphs introducing the course
- Explain the importance and benefits for farmers
- Outline what farmers will learn
- Set expectations for practical, actionable content
- Use engaging, professional language
- Write in ${language}

Output the introduction content only, in Markdown format.
`;

  return prompt.trim();
}

/**
 * Generate a prompt for creating a course glossary.
 */
export function generateGlossaryPrompt(params: GlossaryPromptParams): string {
  const {
    courseTitle,
    animalType,
    topics,
    language = "English",
  } = params;

  const topicsStr = topics.join(", ");

  const prompt = `
You are an agricultural training content creator.

Generate a comprehensive glossary of 20-25 essential terms for a ${animalType} farming course titled: "${courseTitle}"

Topics covered: ${topicsStr}

Requirements:
- Include technical terms, farming practices, equipment names
- Each term should have a clear, practical definition
- Definitions should be farmer-friendly (not overly academic)
- Format: Term: Definition
- Write in ${language}

Output format:
Term 1: Definition
Term 2: Definition
...

Output only the glossary terms and definitions.
`;

  return prompt.trim();
}

/**
 * Generate a detailed image prompt for DALL-E or similar image generation.
 */
export function generateImagePromptTemplate(params: ImagePromptParams): string {
  const {
    sessionTopic,
    animalType,
    contentType = "diagram",
  } = params;

  const styleGuide: Record<string, string> = {
    diagram: "technical diagram with labels, clean lines, educational style",
    photo: "professional agricultural photograph, realistic, high quality",
    illustration: "detailed illustration, clear and educational, suitable for training materials",
    infographic: "informative infographic with clear text labels, organized layout",
  };

  const style = styleGuide[contentType] || "educational illustration";

  const prompt = `
Create a detailed image prompt for generating a ${contentType} related to: "${sessionTopic}" for ${animalType} farming training.

The image should be:
- Educational and clear
- Suitable for training materials
- Professional and accurate
- ${style}
- Include relevant details that help farmers understand the concept

Generate a comprehensive image description that can be used with DALL-E or similar image generation tools.
`;

  return prompt.trim();
}

