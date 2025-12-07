import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  generateAgriculturalSessionPrompt,
  generateBiosecuritySessionPrompt,
} from "@/lib/prompts";
import type {
  SessionPromptParams,
  BiosecuritySessionPromptParams,
} from "@/lib/prompts/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds for AI generation

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/training/generate
 * Generate training content using AI
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      version = "biosecurity", // "original" or "biosecurity"
      promptType = "session", // "session", "unit_title", "introduction", "glossary", "image"
      ...params
    } = body;

    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    let prompt = "";

    // Generate prompt based on type and version
    if (promptType === "session") {
      if (version === "biosecurity") {
        prompt = generateBiosecuritySessionPrompt(
          params as BiosecuritySessionPromptParams
        );
      } else {
        prompt = generateAgriculturalSessionPrompt(
          params as SessionPromptParams
        );
      }
    } else {
      // For other prompt types, you can extend this
      return NextResponse.json(
        { error: `Prompt type "${promptType}" not yet implemented` },
        { status: 400 }
      );
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini", // Use gpt-4o-mini for cost efficiency, or gpt-4o for better quality
      messages: [
        {
          role: "system",
          content:
            "You are an expert agricultural training content creator specializing in pig and poultry farming. Generate comprehensive, practical training content for farmers.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: "No content generated from AI" },
        { status: 500 }
      );
    }

    // Parse the response (assuming it follows the format: ---\nTitle: ...\nContent: ...\n---)
    const titleMatch = generatedContent.match(/Title:\s*(.+?)(?:\n|$)/i);
    const contentMatch = generatedContent.match(/Content:\s*([\s\S]+?)(?:\nImage Prompt:|$)/i);
    // const imagePromptMatch = generatedContent.match(/Image Prompt:\s*([\s\S]+?)(?:\nSelf-Assessment Questions:|$)/i);
    const questionsMatch = generatedContent.match(/Self-Assessment Questions:\s*([\s\S]+?)(?:\n---|$)/i);

    const result = {
      title: titleMatch ? titleMatch[1].trim() : "Untitled Session",
      content: contentMatch ? contentMatch[1].trim() : generatedContent,
      imagePrompt: null, // Commented out: imagePromptMatch ? imagePromptMatch[1].trim() : null,
      selfAssessmentQuestions: questionsMatch ? questionsMatch[1].trim() : null,
      rawResponse: generatedContent,
      metadata: {
        model: completion.model,
        usage: completion.usage,
        version,
        promptType,
      },
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Training content generation error:", error);

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        {
          error: "AI service error",
          message: error.message,
          code: error.code,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to generate training content",
        message: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

