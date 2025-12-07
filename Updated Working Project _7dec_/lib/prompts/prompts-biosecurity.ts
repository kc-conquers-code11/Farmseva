/**
 * Agricultural Training Course Content Generation Prompts - BIOSECURITY ENHANCED
 * For Pig and Poultry Farming Training Modules with Biosecurity Focus
 * 
 * Enhanced version with biosecurity, disease prevention, and regulatory compliance features.
 */

import type {
  BiosecuritySessionPromptParams,
  BiosecurityUnitTitlePromptParams,
  BiosecurityCourseIntroductionPromptParams,
  BiosecurityGlossaryPromptParams,
  BiosecurityImagePromptParams,
} from "./types";

/**
 * Generate a comprehensive prompt for creating agricultural training session content
 * with biosecurity focus and enhanced features.
 */
export function generateAgriculturalSessionPrompt(params: BiosecuritySessionPromptParams): string {
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
    diseaseFocus = [],
    regulatoryFramework,
    riskLevel,
    localConditions,
    isBiosecurityFocused = true,
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
    audienceContext = "Write for farmers who are new to this topic. Use simple language, explain all technical terms, and provide step-by-step guidance. Emphasize basic biosecurity principles and why they matter.";
  } else if (targetAudience.toLowerCase() === "intermediate") {
    audienceContext = "Write for farmers with some experience. Assume basic knowledge but explain advanced concepts clearly. Include intermediate biosecurity protocols and risk management.";
  } else if (targetAudience.toLowerCase() === "advanced") {
    audienceContext = "Write for experienced farmers. Focus on advanced techniques, optimization, best practices, and complex biosecurity systems.";
  } else {
    audienceContext = `Write for ${targetAudience}. Adjust complexity and depth accordingly.`;
  }

  // Biosecurity-specific context
  let biosecurityContext = "";
  if (isBiosecurityFocused) {
    biosecurityContext = `
BIOSECURITY FOCUS REQUIREMENTS:
- All content must emphasize disease prevention, containment, and biosecurity protocols
- Include specific biosecurity measures: quarantine procedures, sanitization protocols, access control, equipment disinfection
- Address disease-specific risks and prevention strategies
- Reference regulatory compliance considerations where relevant
- Emphasize farm-level biosecurity barriers and containment
- Include zoonotic disease prevention measures
- Address waste management and vector control
- Emphasize the economic impact of disease outbreaks and prevention benefits
`;

    if (diseaseFocus && diseaseFocus.length > 0) {
      const diseasesStr = diseaseFocus.join(", ");
      biosecurityContext += `\n- Specifically address prevention and control measures for: ${diseasesStr}\n`;
    }

    if (regulatoryFramework) {
      biosecurityContext += `\n- Align content with: ${regulatoryFramework}\n`;
    }

    if (riskLevel) {
      biosecurityContext += `\n- Content should address ${riskLevel.toUpperCase()} risk level scenarios\n`;
    }

    if (localConditions) {
      biosecurityContext += `\n- Consider local epidemiological conditions: ${localConditions}\n`;
    }
  }

  // Mobile optimization context
  const mobileContext = `
MOBILE-FIRST OPTIMIZATION:
- Use shorter paragraphs (2-3 sentences maximum for better mobile readability)
- Prefer bullet points and lists over long prose
- Use concise, scannable content structure
- Ensure tables are mobile-friendly (not too wide)
- Place quick reference information at the top
- Use clear section breaks for easy navigation
`;

  // Cost-effectiveness context
  const costContext = `
COST-EFFECTIVENESS & RESOURCE CONSTRAINTS:
- Provide budget tiers: Low-cost options, Medium-budget solutions, High-investment approaches
- Include DIY alternatives where applicable
- Specify cost-effective materials and methods
- Address resource-constrained farmer scenarios
- Include cost-benefit analysis examples
- Suggest alternatives for expensive equipment
`;

  const prompt = `
You are an expert agricultural training content creator specializing in ${animalType} farming with deep expertise in biosecurity and disease prevention. Create detailed, practical training content for farmers.

${animalContext}
${audienceContext}

${isBiosecurityFocused ? biosecurityContext : ""}

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
- Prioritize disease prevention and biosecurity in all recommendations

${mobileContext}

${costContext}

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
- For RTL languages (Arabic, etc.), note that content will be displayed right-to-left

STRICT SESSION STRUCTURE (follow this order):

1. **Session Overview**
   - Brief 2-3 paragraph introduction explaining what farmers will learn
   - Why this topic matters for their farming operations and biosecurity
   - Real-world relevance and impact on farm productivity and disease prevention
   - Economic implications of implementing (or not implementing) these practices

2. **Key Concepts & Definitions**
   - Define 5-7 essential terms farmers need to understand
   - Include biosecurity-specific terminology (quarantine, sanitization, vector, fomite, etc.)
   - Use simple, clear definitions with practical context
   - Format: Term: Definition (with practical example)
   - For multilingual content, include English technical terms in brackets when needed

3. **Risk Assessment & Context**
   - Assess risk levels (High/Medium/Low) for different scenarios
   - Identify risk factors specific to the topic
   - Link risks to local epidemiological conditions if provided
   - Provide risk mitigation strategies
   - Include a simple risk assessment checklist or table
   - Format: | Risk Factor | Risk Level | Mitigation Strategy |

4. **Practical Guide: Step-by-Step Instructions**
   - Provide detailed, numbered step-by-step instructions
   - Include timing, quantities, measurements where relevant
   - Add safety considerations, biosecurity precautions, and disease prevention measures
   - Specify sanitization steps where applicable
   - Format as: Step 1, Step 2, etc. with clear actions
   - Include "Before" and "After" procedures for biosecurity protocols

5. **Best Practices & Tips (Biosecurity-Focused)**
   - List 8-10 practical tips farmers should follow
   - Emphasize biosecurity best practices
   - Include do's and don'ts with disease prevention focus
   - Provide time-saving or cost-saving recommendations
   - Include regulatory compliance tips if applicable
   - Format as bullet points with brief explanations
   - Highlight critical biosecurity measures that cannot be skipped

6. **Common Problems & Solutions (Disease Prevention Focus)**
   - Create a troubleshooting table with:
     | Problem | Symptoms/Indicators | Cause | Solution | Prevention |
   - Include 6-8 common issues farmers face
   - Focus on biosecurity breaches, disease risks, and prevention failures
   - Provide actionable solutions with biosecurity emphasis
   - Include early warning signs of disease or biosecurity failures

7. **Equipment & Materials Needed**
   - List required equipment, tools, or materials
   - Include approximate costs if relevant
   - Specify alternatives or budget-friendly options
   - Provide biosecurity-specific equipment (disinfectants, protective gear, etc.)
   - Format as a table: | Item | Purpose | Cost Range | Budget Alternative |
   - Include maintenance requirements for biosecurity equipment

8. **Regulatory Compliance & Documentation**
   - Explain relevant regulatory requirements (if regulatory_framework provided)
   - Provide compliance checklists
   - Include documentation requirements
   - Reference disease-free compartment standards if applicable
   - Format as: | Requirement | Action Needed | Documentation |
   - Explain consequences of non-compliance

9. **Real-World Case Studies**
   - Provide 3-5 brief case studies (1-2 paragraphs each)
   - Include both success stories and failure cases (what went wrong and why)
   - Show successful biosecurity implementation examples
   - Include smallholder-specific examples
   - Include lessons learned and key takeaways
   - Highlight cost-effective solutions that worked
   - Show regional/local examples if local_conditions provided

10. **Maintenance & Follow-Up (Monitoring & Evaluation)**
    - Explain ongoing maintenance requirements
    - Provide a checklist or schedule for regular biosecurity checks
    - Include monitoring and evaluation steps
    - Specify frequency of checks (daily, weekly, monthly)
    - Include self-assessment questions
    - Provide improvement indicators
    - Format: | Task | Frequency | Check Method | Action if Failed |

11. **Quick Reference Checklist**
    - Create a practical checklist farmers can use daily/weekly
    - Format as a table with checkboxes: | Task | Status | Priority |
    - Include 10-12 essential tasks
    - Prioritize critical biosecurity measures
    - Make it scannable and mobile-friendly

12. **Additional Resources & Next Steps**
    - Suggest related topics to explore
    - Recommend further reading or resources
    - Link to next session or related units
    - Provide contact information for veterinary support or extension services
    - Include emergency contact procedures for disease outbreaks

CONTENT DEPTH REQUIREMENTS:
- Total content should span 4-5 Microsoft Word pages (A4, 12pt, single spacing)
- Introduction: 2-3 comprehensive paragraphs
- Each major section: 2-3 paragraphs with detailed explanations (keep paragraphs short for mobile)
- Include practical examples throughout
- Use tables for comparisons, checklists, and troubleshooting
- Ensure content is dense with actionable information
- Balance detail with readability (especially for mobile users)

PRACTICAL EMPHASIS:
- Every section should answer: "What should the farmer DO?"
- Include specific measurements, timings, quantities
- Provide visual descriptions for diagrams/illustrations needed
- Reference common farm sizes and scales
- Address cost considerations where relevant
- Emphasize immediate actionability

BIOSECURITY EMPHASIS:
- Every recommendation should consider disease prevention impact
- Link practices to specific disease risks when disease_focus provided
- Emphasize the "why" behind biosecurity measures (economic and health impact)
- Include outbreak prevention and early detection measures
- Address zoonotic disease risks where applicable

OUTPUT FORMAT:
---
Title: <session_title>
Content:
<session_content_in_markdown>
Image Prompt:
<detailed_description_for_illustration>
Self-Assessment Questions:
<3-5 questions farmers can use to evaluate their understanding>
---

LENGTH REQUIREMENT:
Ensure the session content is comprehensive (4-5 pages) and immediately actionable for farmers.

LANGUAGE:
Write everything in ${language}. Use clear, professional language suitable for agricultural training.
- For multilingual content, ensure technical terms are clearly explained
- Use culturally appropriate examples and references
- Consider regional farming practices and constraints

QUALITY STANDARDS:
- Content must be accurate and based on proven farming practices and biosecurity protocols
- All instructions must be safe and follow agricultural best practices
- Technical terms should be explained in context
- Content should be culturally appropriate for the target region
- Avoid theoretical content; focus on practical application
- Ensure biosecurity recommendations are evidence-based
- Include references to scientific/regulatory sources where appropriate
`;

  return prompt.trim();
}

/**
 * Generate a prompt for creating unit titles with biosecurity focus.
 */
export function generateUnitTitlePrompt(params: BiosecurityUnitTitlePromptParams): string {
  const {
    courseTitle,
    unitNumber,
    animalType,
    previousUnitTitles = [],
    language = "English",
    isBiosecurityFocused = true,
  } = params;

  const previousStr = previousUnitTitles.length > 0
    ? previousUnitTitles.join(", ")
    : "None";

  const biosecurityNote = isBiosecurityFocused
    ? "Focus on biosecurity, disease prevention, and practical farm management."
    : "";

  const prompt = `
You are an agricultural training curriculum designer specializing in biosecurity and disease prevention.

Generate a creative, descriptive title for Unit ${unitNumber} in a course titled: "${courseTitle}"

Context:
- Animal Type: ${animalType}
- Previous unit titles: ${previousStr}
- This is a practical training course for farmers
${biosecurityNote}

Requirements:
- Title should be clear and descriptive
- Should indicate what farmers will learn
- Should be practical and action-oriented
- Should reflect biosecurity/disease prevention focus if applicable
- Do NOT repeat previous titles
- Keep title concise (5-8 words)

Respond ONLY with the unit title, no numbers, no quotes, no additional text.
`;

  return prompt.trim();
}

/**
 * Generate a prompt for creating course introduction/overview with biosecurity focus.
 */
export function generateCourseIntroductionPrompt(params: BiosecurityCourseIntroductionPromptParams): string {
  const {
    courseTitle,
    animalType,
    targetAudience,
    topicsCovered,
    language = "English",
    isBiosecurityFocused = true,
    diseaseFocus = [],
  } = params;

  const topicsStr = topicsCovered.map((topic) => `- ${topic}`).join("\n");

  let biosecurityNote = "";
  if (isBiosecurityFocused) {
    biosecurityNote = `
- Emphasize the importance of biosecurity and disease prevention
- Highlight the economic impact of disease outbreaks
- Explain how this course helps prevent diseases like Avian Influenza and African Swine Fever
`;
    if (diseaseFocus && diseaseFocus.length > 0) {
      const diseasesStr = diseaseFocus.join(", ");
      biosecurityNote += `- Specifically mention prevention of: ${diseasesStr}\n`;
    }
  }

  const prompt = `
You are an agricultural training content creator specializing in biosecurity and disease prevention.

Create a comprehensive course introduction for: "${courseTitle}"

Context:
- Animal Type: ${animalType}
- Target Audience: ${targetAudience}
- Topics covered in this course:
${topicsStr}
${biosecurityNote}

Requirements:
- Write 3-4 paragraphs introducing the course
- Explain the importance and benefits for farmers, especially regarding disease prevention
- Outline what farmers will learn
- Set expectations for practical, actionable content
- Emphasize biosecurity and risk management
- Use engaging, professional language
- Write in ${language}

Output the introduction content only, in Markdown format.
`;

  return prompt.trim();
}

/**
 * Generate a prompt for creating a course glossary with biosecurity terms.
 */
export function generateGlossaryPrompt(params: BiosecurityGlossaryPromptParams): string {
  const {
    courseTitle,
    animalType,
    topics,
    language = "English",
    isBiosecurityFocused = true,
  } = params;

  const topicsStr = topics.join(", ");

  const biosecurityNote = isBiosecurityFocused
    ? "Include biosecurity-specific terms (quarantine, sanitization, vector, fomite, compartment, etc.)"
    : "";

  const prompt = `
You are an agricultural training content creator specializing in biosecurity.

Generate a comprehensive glossary of 25-30 essential terms for a ${animalType} farming course titled: "${courseTitle}"

Topics covered: ${topicsStr}
${biosecurityNote}

Requirements:
- Include technical terms, farming practices, equipment names
- Include biosecurity and disease prevention terminology
- Each term should have a clear, practical definition
- Definitions should be farmer-friendly (not overly academic)
- Format: Term: Definition
- Write in ${language}
- For multilingual content, include English technical terms in brackets when first introduced

Output format:
Term 1: Definition
Term 2: Definition
...

Output only the glossary terms and definitions.
`;

  return prompt.trim();
}

/**
 * Generate a detailed image prompt for DALL-E or similar image generation with biosecurity focus.
 */
export function generateImagePromptTemplate(params: BiosecurityImagePromptParams): string {
  const {
    sessionTopic,
    animalType,
    contentType = "diagram",
    isBiosecurityFocused = true,
  } = params;

  const styleGuide: Record<string, string> = {
    diagram: "technical diagram with labels, clean lines, educational style, showing biosecurity protocols",
    photo: "professional agricultural photograph, realistic, high quality, demonstrating biosecurity practices",
    illustration: "detailed illustration, clear and educational, suitable for training materials, biosecurity-focused",
    infographic: "informative infographic with clear text labels, organized layout, showing biosecurity measures",
  };

  const style = styleGuide[contentType] || "educational illustration";

  const biosecurityNote = isBiosecurityFocused
    ? "Include biosecurity elements such as barriers, sanitization stations, quarantine areas, protective equipment, or disease prevention measures."
    : "";

  const prompt = `
Create a detailed image prompt for generating a ${contentType} related to: "${sessionTopic}" for ${animalType} farming training.

The image should be:
- Educational and clear
- Suitable for training materials
- Professional and accurate
- ${style}
- Include relevant details that help farmers understand the concept
${biosecurityNote}
- Mobile-friendly (readable on small screens if text is included)

Generate a comprehensive image description that can be used with DALL-E or similar image generation tools.
`;

  return prompt.trim();
}

