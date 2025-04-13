"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

type Profile = {
  rationality_score: number
  empathy_score: number
  clarity_score: number
  decisiveness_score: number
} | null

type UserStatsProps = {
  profile: Profile
}

export function UserStats({ profile }: UserStatsProps) {
  const data = [
    {
      name: "Rationality",
      value: profile?.rationality_score || 50,
    },
    {
      name: "Empathy",
      value: profile?.empathy_score || 50,
    },
    {
      name: "Clarity",
      value: profile?.clarity_score || 50,
    },
    {
      name: "Decisiveness",
      value: profile?.decisiveness_score || 50,
    },
  ]

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, 100]}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].name}</span>
                        <span className="font-bold text-muted-foreground">{payload[0].value}</span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium">Bias Awareness</div>
          <div className="text-2xl font-bold">72%</div>
          <div className="text-xs text-muted-foreground">+5% from last month</div>
        </div>
        <div className="border rounded-lg p-3">
          <div className="text-sm font-medium">Consistency</div>
          <div className="text-2xl font-bold">68%</div>
          <div className="text-xs text-muted-foreground">+2% from last month</div>
        </div>
      </div>
    </div>
  )
}
