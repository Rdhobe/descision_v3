"use server"

import { getSupabaseServer } from "./supabase/server"
import type { Database } from "./supabase/database.types"

type Scenario = Database["public"]["Tables"]["scenarios"]["Insert"]
type ScenarioOption = Database["public"]["Tables"]["scenario_options"]["Insert"]

const scenarios: Scenario[] = [
  {
    title: "Career Change Decision",
    description: "You've been offered a new job with better pay but longer hours. Your current job is stable but has limited growth opportunities.",
    context: "You have a family to support and value work-life balance.",
    category: "Career",
    difficulty: 3,
    xp_reward: 50,
  },
  {
    title: "Investment Opportunity",
    description: "A friend offers you a chance to invest in their startup. It's risky but could be very profitable.",
    context: "You have some savings but need to be careful with your money.",
    category: "Finance",
    difficulty: 4,
    xp_reward: 75,
  },
]

const scenarioOptions: Record<string, ScenarioOption[]> = {
  "Career Change Decision": [
    {
      scenario_id: "", // Will be set after scenario creation
      title: "Accept New Job",
      description: "Take the new position for better pay and growth potential.",
      pros: ["Higher salary", "Career advancement", "New challenges"],
      cons: ["Longer hours", "Less time with family", "More stress"],
      rationality_score: 8,
      empathy_score: 5,
      clarity_score: 7,
      decisiveness_score: 6,
    },
    {
      scenario_id: "", // Will be set after scenario creation
      title: "Stay in Current Job",
      description: "Maintain current position for stability and work-life balance.",
      pros: ["Stable income", "Good work-life balance", "Familiar environment"],
      cons: ["Limited growth", "Lower salary", "Potential stagnation"],
      rationality_score: 6,
      empathy_score: 8,
      clarity_score: 7,
      decisiveness_score: 5,
    },
  ],
  "Investment Opportunity": [
    {
      scenario_id: "", // Will be set after scenario creation
      title: "Invest in Startup",
      description: "Take the risk and invest in your friend's startup.",
      pros: ["High potential returns", "Support friend's dream", "Early investor benefits"],
      cons: ["High risk", "Possible loss of investment", "Strained friendship if it fails"],
      rationality_score: 5,
      empathy_score: 7,
      clarity_score: 6,
      decisiveness_score: 8,
    },
    {
      scenario_id: "", // Will be set after scenario creation
      title: "Decline Investment",
      description: "Pass on the opportunity and keep your savings safe.",
      pros: ["Financial security", "No risk of loss", "Preserved friendship"],
      cons: ["Missed opportunity", "Potential regret", "Friend might be disappointed"],
      rationality_score: 8,
      empathy_score: 6,
      clarity_score: 7,
      decisiveness_score: 5,
    },
  ],
}

export async function seedScenarios() {
  const supabase = await getSupabaseServer()

  try {
    // Clear existing data
    await supabase.from("scenario_options").delete()
    await supabase.from("scenarios").delete()

    // Insert scenarios
    for (const scenario of scenarios) {
      const { data: insertedScenario, error: scenarioError } = await supabase
        .from("scenarios")
        .insert(scenario)
        .select()
        .single()

      if (scenarioError) {
        console.error("Error inserting scenario:", scenarioError)
        continue
      }

      // Insert options for this scenario
      const options = scenarioOptions[scenario.title]
      if (options && insertedScenario) {
        for (const option of options) {
          const { error: optionError } = await supabase
            .from("scenario_options")
            .insert({
              ...option,
              scenario_id: insertedScenario.id,
            })

          if (optionError) {
            console.error("Error inserting option:", optionError)
          }
        }
      }
    }

    console.log("Scenarios seeded successfully")
  } catch (error) {
    console.error("Error seeding scenarios:", error)
    throw error
  }
}
