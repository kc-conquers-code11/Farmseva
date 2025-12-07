"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Card from "./Card";
import type {
  SessionPromptParams,
  BiosecuritySessionPromptParams,
} from "@/lib/prompts/types";

type ContentVersion = "original" | "biosecurity";

interface GeneratedContent {
  title: string;
  content: string;
  imagePrompt: string | null;
  selfAssessmentQuestions: string | null;
  rawResponse: string;
  metadata: {
    model: string;
    usage: any;
    version: string;
    promptType: string;
  };
}

export default function ContentGenerator() {
  const [version, setVersion] = useState<ContentVersion>("biosecurity");
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form state - Original version
  const [formData, setFormData] = useState<SessionPromptParams>({
    courseTitle: "",
    unitNumber: 1,
    unitTitle: "",
    sessionNumber: 1,
    sessionTopic: "",
    animalType: "poultry",
    targetAudience: "beginner",
    previousSessionTopics: [],
    additionalContext: "",
    language: "English",
  });

  // Biosecurity-specific form state
  const [biosecurityData, setBiosecurityData] = useState({
    diseaseFocus: [] as string[],
    regulatoryFramework: "",
    riskLevel: "medium" as "high" | "medium" | "low" | null,
    localConditions: "",
    isBiosecurityFocused: true,
  });

  // New topic input for previous sessions
  const [newTopic, setNewTopic] = useState("");
  const [newDisease, setNewDisease] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const requestBody = version === "biosecurity"
        ? {
            version: "biosecurity",
            promptType: "session",
            ...formData,
            ...biosecurityData,
          } as BiosecuritySessionPromptParams & { version: string; promptType: string }
        : {
            version: "original",
            promptType: "session",
            ...formData,
          } as SessionPromptParams & { version: string; promptType: string };

      const response = await fetch("/api/training/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Failed to generate content");
      }

      const data = await response.json();
      setGeneratedContent(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while generating content");
      console.error("Content generation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const addPreviousTopic = () => {
    if (newTopic.trim()) {
      setFormData({
        ...formData,
        previousSessionTopics: [...(formData.previousSessionTopics || []), newTopic.trim()],
      });
      setNewTopic("");
    }
  };

  const removePreviousTopic = (index: number) => {
    const topics = [...(formData.previousSessionTopics || [])];
    topics.splice(index, 1);
    setFormData({ ...formData, previousSessionTopics: topics });
  };

  const addDisease = () => {
    if (newDisease.trim()) {
      setBiosecurityData({
        ...biosecurityData,
        diseaseFocus: [...biosecurityData.diseaseFocus, newDisease.trim()],
      });
      setNewDisease("");
    }
  };

  const removeDisease = (index: number) => {
    const diseases = [...biosecurityData.diseaseFocus];
    diseases.splice(index, 1);
    setBiosecurityData({ ...biosecurityData, diseaseFocus: diseases });
  };

  const handleDownload = (format: "markdown" | "txt" = "markdown") => {
    if (!generatedContent) return;

    const content = `# ${generatedContent.title}\n\n${generatedContent.content}${
      generatedContent.selfAssessmentQuestions
        ? `\n\n## Self-Assessment Questions\n\n${generatedContent.selfAssessmentQuestions}`
        : ""
    }`;

    const blob = new Blob([content], {
      type: format === "markdown" ? "text/markdown" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${generatedContent.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${format === "markdown" ? "md" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Version Toggle */}
      <Card className="border-none shadow-sm ring-1 ring-neutral-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
              <Icon icon="mdi:book-edit" className="w-5 h-5 text-green-600" />
              Content Generation Mode
            </h3>
            <p className="text-sm text-neutral-500 mt-1">
              Choose between original or biosecurity-enhanced content generation
            </p>
          </div>
          <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
            <button
              onClick={() => setVersion("original")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                version === "original"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Original
            </button>
            <button
              onClick={() => setVersion("biosecurity")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                version === "biosecurity"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
            >
              Biosecurity
            </button>
          </div>
        </div>
      </Card>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm ring-1 ring-neutral-100">
          <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <Icon icon="mdi:form-select" className="w-5 h-5 text-blue-600" />
            Course Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.courseTitle}
                onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., Modern Poultry Farming Techniques"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Animal Type *
              </label>
              <select
                required
                value={formData.animalType}
                onChange={(e) => setFormData({ ...formData, animalType: e.target.value as any })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="poultry">Poultry</option>
                <option value="pig">Pig</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Unit Number *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: parseInt(e.target.value) })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Unit Title *
              </label>
              <input
                type="text"
                required
                value={formData.unitTitle}
                onChange={(e) => setFormData({ ...formData, unitTitle: e.target.value })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., Poultry Housing and Environment"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Session Number *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.sessionNumber}
                onChange={(e) => setFormData({ ...formData, sessionNumber: parseInt(e.target.value) })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Session Topic *
              </label>
              <input
                type="text"
                required
                value={formData.sessionTopic}
                onChange={(e) => setFormData({ ...formData, sessionTopic: e.target.value })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="e.g., Designing Efficient Poultry Housing"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Target Audience *
              </label>
              <select
                required
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-700 mb-2">
                Language *
              </label>
              <input
                type="text"
                required
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="English"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Additional Context
            </label>
            <textarea
              value={formData.additionalContext}
              onChange={(e) => setFormData({ ...formData, additionalContext: e.target.value })}
              rows={3}
              className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              placeholder="e.g., Focus on small to medium scale operations (100-1000 birds). Consider cost-effective solutions..."
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-bold text-neutral-700 mb-2">
              Previous Session Topics
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addPreviousTopic())}
                className="flex-1 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Add previous topic..."
              />
              <button
                type="button"
                onClick={addPreviousTopic}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                Add
              </button>
            </div>
            {formData.previousSessionTopics && formData.previousSessionTopics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.previousSessionTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-lg text-sm"
                  >
                    {topic}
                    <button
                      type="button"
                      onClick={() => removePreviousTopic(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Icon icon="mdi:close" className="w-4 h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Biosecurity-Specific Fields */}
        {version === "biosecurity" && (
          <Card className="border-none shadow-sm ring-1 ring-neutral-100">
            <h3 className="text-lg font-bold text-neutral-800 mb-6 flex items-center gap-2">
              <Icon icon="mdi:shield-check" className="w-5 h-5 text-orange-600" />
              Biosecurity Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  Disease Focus
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDisease}
                    onChange={(e) => setNewDisease(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addDisease())}
                    className="flex-1 border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g., Avian Influenza"
                  />
                  <button
                    type="button"
                    onClick={addDisease}
                    className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                {biosecurityData.diseaseFocus.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {biosecurityData.diseaseFocus.map((disease, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-200"
                      >
                        {disease}
                        <button
                          type="button"
                          onClick={() => removeDisease(index)}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <Icon icon="mdi:close" className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  Regulatory Framework
                </label>
                <input
                  type="text"
                  value={biosecurityData.regulatoryFramework}
                  onChange={(e) =>
                    setBiosecurityData({ ...biosecurityData, regulatoryFramework: e.target.value })
                  }
                  className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., OIE Standards, National Guidelines"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  Risk Level
                </label>
                <select
                  value={biosecurityData.riskLevel || "medium"}
                  onChange={(e) =>
                    setBiosecurityData({
                      ...biosecurityData,
                      riskLevel: e.target.value as "high" | "medium" | "low" | null,
                    })
                  }
                  className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">
                  Local Conditions
                </label>
                <input
                  type="text"
                  value={biosecurityData.localConditions}
                  onChange={(e) =>
                    setBiosecurityData({ ...biosecurityData, localConditions: e.target.value })
                  }
                  className="w-full border border-neutral-200 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  placeholder="e.g., Tropical climate, high bird density"
                />
              </div>
            </div>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="mdi:loading" className="w-5 h-5 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Icon icon="mdi:auto-fix" className="w-5 h-5" />
                Generate Content
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
        >
          <div className="flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="w-5 h-5" />
            <span className="font-medium">Error: {error}</span>
          </div>
        </motion.div>
      )}

      {/* Generated Content Display */}
      {generatedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-none shadow-lg ring-1 ring-neutral-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
                <Icon icon="mdi:file-document-check" className="w-6 h-6 text-green-600" />
                Generated Content
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Icon icon="mdi:robot" className="w-4 h-4" />
                  {generatedContent.metadata.model}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload("markdown")}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Icon icon="mdi:download" className="w-4 h-4" />
                    Download MD
                  </button>
                  <button
                    onClick={() => handleDownload("txt")}
                    className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 transition-colors flex items-center gap-2 text-sm font-medium"
                  >
                    <Icon icon="mdi:download" className="w-4 h-4" />
                    Download TXT
                  </button>
                </div>
              </div>
            </div>

            <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-neutral-700 prose-strong:text-neutral-900 prose-ul:list-disc prose-ol:list-decimal prose-li:my-2 prose-table:border-collapse prose-th:border prose-th:border-neutral-300 prose-th:bg-neutral-50 prose-th:p-2 prose-th:font-bold prose-td:border prose-td:border-neutral-300 prose-td:p-2">
              <h1 className="text-3xl font-bold text-neutral-900 mb-6">
                {generatedContent.title}
              </h1>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-content"
              >
                {generatedContent.content}
              </ReactMarkdown>
            </div>

            {/* Image Prompt - Commented out for now */}
            {/* {generatedContent.imagePrompt && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:image" className="w-5 h-5" />
                  Image Prompt
                </h4>
                <p className="text-blue-800 text-sm">{generatedContent.imagePrompt}</p>
              </div>
            )} */}

            {generatedContent.selfAssessmentQuestions && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <Icon icon="mdi:help-circle" className="w-5 h-5" />
                  Self-Assessment Questions
                </h4>
                <div className="prose prose-sm max-w-none prose-p:text-purple-800">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedContent.selfAssessmentQuestions}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </div>
  );
}

