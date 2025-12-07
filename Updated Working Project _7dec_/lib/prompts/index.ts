/**
 * Training Content Generation Prompts
 * 
 * Export all prompt generation functions
 */

// Original version
export {
  generateAgriculturalSessionPrompt,
  generateUnitTitlePrompt,
  generateCourseIntroductionPrompt,
  generateGlossaryPrompt,
  generateImagePromptTemplate,
} from "./prompts";

// Biosecurity-enhanced version
export {
  generateAgriculturalSessionPrompt as generateBiosecuritySessionPrompt,
  generateUnitTitlePrompt as generateBiosecurityUnitTitlePrompt,
  generateCourseIntroductionPrompt as generateBiosecurityCourseIntroductionPrompt,
  generateGlossaryPrompt as generateBiosecurityGlossaryPrompt,
  generateImagePromptTemplate as generateBiosecurityImagePromptTemplate,
} from "./prompts-biosecurity";

// Types
export type * from "./types";

