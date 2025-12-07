import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Answers = {
  farmName: string;
  species: "pig" | "poultry" | "mixed";
  herdSize: string;
  state: string;
  district: string;

  housing: "open" | "semi" | "closed";
  visitors: "none" | "log" | "log_footbath_ppe";
  deadDisposal: "open_pit" | "covered_pit" | "incineration";
  vaccination: "none" | "occasional" | "regular";
  wildBirdContact: "high" | "medium" | "low";
  cleaningFreq: "weekly" | "twice_week" | "daily";

  recentMortality: "no" | "yes";
  mortalityNotes: string;
};

function calculateScores(ans: Answers) {
  let bio = 100;
  let infra = 80;
  let disease = 40; // yahan higher = more risk
  let climate = 60;

  // Housing quality → infra
  if (ans.housing === "open") infra -= 25;
  else if (ans.housing === "semi") infra -= 10;

  // Visitor control → biosecurity
  if (ans.visitors === "none") bio -= 30;
  else if (ans.visitors === "log") bio -= 10;

  // Dead animal disposal → bio + disease
  if (ans.deadDisposal === "open_pit") {
    bio -= 25;
    disease += 25;
  } else if (ans.deadDisposal === "covered_pit") {
    bio -= 10;
    disease += 10;
  }

  // Vaccination / deworming
  if (ans.vaccination === "none") disease += 30;
  else if (ans.vaccination === "occasional") disease += 15;

  // Wild bird / stray contact
  if (ans.wildBirdContact === "high") {
    disease += 20;
    bio -= 15;
  } else if (ans.wildBirdContact === "medium") {
    disease += 10;
  }

  // Cleaning frequency
  if (ans.cleaningFreq === "weekly") {
    disease += 15;
    bio -= 10;
  } else if (ans.cleaningFreq === "twice_week") {
    disease += 5;
  }

  // Recent mortality
  if (ans.recentMortality === "yes") {
    disease += 20;
  }

  // clamp 0–100
  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  bio = clamp(bio);
  infra = clamp(infra);
  disease = clamp(disease);
  climate = clamp(climate);

  // overall: we want 100 = very good
  const diseaseProtection = clamp(100 - disease);
  const overall = Math.round((bio + infra + diseaseProtection + climate) / 4);

  return {
    biosecurity: bio,
    disease,
    infrastructure: infra,
    climate,
    overall,
  };
}

function generateTextSummary(scores: ReturnType<typeof calculateScores>) {
  const bioLabel =
    scores.biosecurity < 50
      ? "weak"
      : scores.biosecurity < 75
      ? "moderate"
      : "strong";

  const diseaseLabel =
    scores.disease > 70
      ? "very high"
      : scores.disease > 50
      ? "high"
      : scores.disease > 30
      ? "moderate"
      : "low";

  return (
    `Overall farm biosecurity score is ${scores.overall}/100.\n` +
    `Current biosecurity is ${bioLabel} (${scores.biosecurity}/100) and disease risk is ${diseaseLabel} (${scores.disease}/100, higher = more risk).\n` +
    `Infrastructure and housing quality score is ${scores.infrastructure}/100, while climate-related risk is ${scores.climate}/100.`
  );
}

function generateRecommendations(scores: ReturnType<typeof calculateScores>, ans: Answers) {
  const recs: string[] = [];

  if (scores.biosecurity < 70) {
    recs.push(
      "- Improve entry control: keep a visitor log book, add footbaths at shed entry, and keep separate boots/clothes for workers."
    );
  }

  if (scores.disease > 60) {
    recs.push(
      "- Discuss a proper vaccination and deworming schedule with your local veterinarian. Avoid buying animals from unknown sources without quarantine."
    );
  }

  if (scores.infrastructure < 60) {
    recs.push(
      "- Upgrade housing: better roofing and flooring, dedicated sick pen, and proper drainage to avoid standing water near sheds."
    );
  }

  if (ans.deadDisposal === "open_pit") {
    recs.push(
      "- Shift from open pit disposal to a covered deep pit or incineration to reduce spread of ASF / AI and smell / scavenger issues."
    );
  }

  if (ans.wildBirdContact === "high") {
    recs.push(
      "- Reduce contact with wild birds and stray animals using netting, fencing, and keeping feed/water inside sheds."
    );
  }

  if (ans.cleaningFreq === "weekly") {
    recs.push(
      "- Increase cleaning frequency. Aim for at least 2–3 times per week with proper disinfectant, and daily removal of wet litter."
    );
  }

  if (scores.overall >= 75 && recs.length === 0) {
    recs.push(
      "- Your current practices are fairly good. Continue regular cleaning, record-keeping, and consult your vet before making major changes."
    );
  }

  return recs.join("\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { farmerId, farmProfileId, answers } = body as {
      farmerId?: string;
      farmProfileId?: string;
      answers: Answers;
    };

    if (!farmerId) {
      return NextResponse.json(
        { error: "Missing farmerId in request body" },
        { status: 400 }
      );
    }

    if (!answers) {
      return NextResponse.json(
        { error: "Missing answers in request body" },
        { status: 400 }
      );
    }

    const scores = calculateScores(answers);
    const summary = generateTextSummary(scores);
    const recommendations = generateRecommendations(scores, answers);

    const { data, error } = await supabaseAdmin
      .from("risk_assessments")
      .insert({
        farmer_id: farmerId,
        farm_profile_id: farmProfileId ?? null,
        form_answers: answers,
        biosecurity_score: scores.biosecurity,
        disease_risk_score: scores.disease,
        infrastructure_score: scores.infrastructure,
        climate_risk_score: scores.climate,
        overall_score: scores.overall,
        summary,
        recommendations,
      })
      .select()
      .single();

    if (error) {
      console.error("risk_assessments insert error:", error);
      return NextResponse.json(
        { error: "Database insert failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        assessmentId: data.id,
        scores,
        summary,
        recommendations,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Risk assess API error:", err);
    return NextResponse.json(
      { error: "Risk assessment failed" },
      { status: 500 }
    );
  }
}
