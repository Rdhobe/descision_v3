import { Badge } from "@/components/ui/badge"
import { Check, X, AlertTriangle } from "lucide-react"

type Decision = {
  id: string
  created_at: string
  total_score: number | null
  scenarios: {
    title: string
    category: string
  }
  scenario_options: {
    title: string
  }
}

type RecentDecisionsProps = {
  decisions: Decision[]
}

export function RecentDecisions({ decisions }: RecentDecisionsProps) {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        You haven't completed any scenarios yet. Try one from the suggestions!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {decisions.map((decision) => (
        <div key={decision.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-1.5 ${
                (decision.total_score || 0) >= 75
                  ? "bg-green-100 text-green-600"
                  : (decision.total_score || 0) >= 60
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
              }`}
            >
              {(decision.total_score || 0) >= 75 ? (
                <Check className="h-4 w-4" />
              ) : (decision.total_score || 0) >= 60 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </div>
            <div>
              <div className="font-medium">{decision.scenarios.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {decision.scenarios.category}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(decision.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">Score</div>
            <div
              className={`text-sm ${
                (decision.total_score || 0) >= 75
                  ? "text-green-600"
                  : (decision.total_score || 0) >= 60
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {decision.total_score || 0}/100
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
