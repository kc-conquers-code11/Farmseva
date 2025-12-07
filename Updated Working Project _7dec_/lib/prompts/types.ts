/**
 * Type definitions for Training Content Generation Prompts
 */

export type AnimalType = "pig" | "poultry" | "both";
export type TargetAudience = "beginner" | "intermediate" | "advanced" | string;
export type ContentType = "diagram" | "photo" | "illustration" | "infographic";
export type RiskLevel = "high" | "medium" | "low" | null;

export interface SessionPromptParams {
  courseTitle: string;
  unitNumber: number;
  unitTitle: string;
  sessionNumber: number;
  sessionTopic: string;
  animalType: AnimalType;
  targetAudience: TargetAudience;
  previousSessionTopics?: string[];
  additionalContext?: string;
  language?: string;
}

export interface BiosecuritySessionPromptParams extends SessionPromptParams {
  diseaseFocus?: string[];
  regulatoryFramework?: string;
  riskLevel?: RiskLevel;
  localConditions?: string;
  isBiosecurityFocused?: boolean;
}

export interface UnitTitlePromptParams {
  courseTitle: string;
  unitNumber: number;
  animalType: AnimalType;
  previousUnitTitles?: string[];
  language?: string;
}

export interface BiosecurityUnitTitlePromptParams extends UnitTitlePromptParams {
  isBiosecurityFocused?: boolean;
}

export interface CourseIntroductionPromptParams {
  courseTitle: string;
  animalType: AnimalType;
  targetAudience: TargetAudience;
  topicsCovered: string[];
  language?: string;
}

export interface BiosecurityCourseIntroductionPromptParams extends CourseIntroductionPromptParams {
  isBiosecurityFocused?: boolean;
  diseaseFocus?: string[];
}

export interface GlossaryPromptParams {
  courseTitle: string;
  animalType: AnimalType;
  topics: string[];
  language?: string;
}

export interface BiosecurityGlossaryPromptParams extends GlossaryPromptParams {
  isBiosecurityFocused?: boolean;
}

export interface ImagePromptParams {
  sessionTopic: string;
  animalType: AnimalType;
  contentType?: ContentType;
}

export interface BiosecurityImagePromptParams extends ImagePromptParams {
  isBiosecurityFocused?: boolean;
}

