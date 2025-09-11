import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

import { cn } from "../../lib/utils"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

// Enhanced Area Chart with gradient
export function EnhancedAreaChart({
  data,
  config,
  title,
  description,
  className,
  trend,
  ...props
}: {
  data: Array<Record<string, any>>
  config: ChartConfig
  title?: string
  description?: string
  className?: string
  trend?: {
    value: number
    label: string
  }
  dataKey: string
  gradientId?: string
}) {
  const gradientId = React.useId()
  const primaryKey = Object.keys(config)[0]
  const primaryColor = config[primaryKey]?.color || "#3b82f6"

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && (
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  {trend.value > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : trend.value < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend.value > 0 && "text-emerald-600",
                      trend.value < 0 && "text-red-600",
                      trend.value === 0 && "text-gray-600"
                    )}
                  >
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
          )}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart data={data} {...props}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey={props.dataKey}
              type="natural"
              fill={`url(#${gradientId})`}
              stroke={primaryColor}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Enhanced Bar Chart with better styling
export function EnhancedBarChart({
  data,
  config,
  title,
  description,
  className,
  trend,
  ...props
}: {
  data: Array<Record<string, any>>
  config: ChartConfig
  title?: string
  description?: string
  className?: string
  trend?: {
    value: number
    label: string
  }
  dataKey: string
  layout?: "horizontal" | "vertical"
}) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && (
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  {trend.value > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : trend.value < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend.value > 0 && "text-emerald-600",
                      trend.value < 0 && "text-red-600",
                      trend.value === 0 && "text-gray-600"
                    )}
                  >
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
          )}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={config}>
          <BarChart data={data} layout={props.layout} {...props}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            {props.layout === "horizontal" ? (
              <>
                <XAxis type="number" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} className="text-xs" width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
              </>
            )}
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar
              dataKey={props.dataKey}
              fill="var(--color-primary)"
              radius={props.layout === "horizontal" ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Enhanced Pie Chart with better visual design
export function EnhancedPieChart({
  data,
  config,
  title,
  description,
  className,
  trend,
  ...props
}: {
  data: Array<Record<string, any>>
  config: ChartConfig
  title?: string
  description?: string
  className?: string
  trend?: {
    value: number
    label: string
  }
  dataKey: string
}) {
  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && (
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  {trend.value > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : trend.value < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend.value > 0 && "text-emerald-600",
                      trend.value < 0 && "text-red-600",
                      trend.value === 0 && "text-gray-600"
                    )}
                  >
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
          )}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={config}>
          <PieChart>
            <Pie
              data={data}
              dataKey={props.dataKey}
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60}
              strokeWidth={2}
              stroke="hsl(var(--background))"
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <ChartLegend content={<ChartLegendContent />} className="pt-4" />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Enhanced Line Chart with smooth curves
export function EnhancedLineChart({
  data,
  config,
  title,
  description,
  className,
  trend,
  ...props
}: {
  data: Array<Record<string, any>>
  config: ChartConfig
  title?: string
  description?: string
  className?: string
  trend?: {
    value: number
    label: string
  }
  dataKey: string
}) {
  const primaryKey = Object.keys(config)[0]
  const primaryColor = config[primaryKey]?.color || "#3b82f6"

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader className="pb-2">
          {title && (
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{title}</CardTitle>
              {trend && (
                <div className="flex items-center gap-1 text-sm">
                  {trend.value > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                  ) : trend.value < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : (
                    <Minus className="h-3 w-3 text-gray-500" />
                  )}
                  <span
                    className={cn(
                      "font-medium",
                      trend.value > 0 && "text-emerald-600",
                      trend.value < 0 && "text-red-600",
                      trend.value === 0 && "text-gray-600"
                    )}
                  >
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                  <span className="text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
          )}
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={config}>
          <LineChart data={data} {...props}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey={props.dataKey}
              type="natural"
              stroke={primaryColor}
              strokeWidth={3}
              dot={{
                fill: primaryColor,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 0,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// Metric Card with trend indicator
export function MetricCard({
  title,
  value,
  description,
  trend,
  className,
  icon: Icon,
}: {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
  }
  className?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {trend && (
            <div className="flex items-center gap-1 text-xs">
              {trend.value > 0 ? (
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              ) : trend.value < 0 ? (
                <TrendingDown className="h-3 w-3 text-red-500" />
              ) : (
                <Minus className="h-3 w-3 text-gray-500" />
              )}
              <span
                className={cn(
                  "font-medium",
                  trend.value > 0 && "text-emerald-600",
                  trend.value < 0 && "text-red-600",
                  trend.value === 0 && "text-gray-600"
                )}
              >
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
            </div>
          )}
          {description && (
            <p className={cn("text-xs text-muted-foreground", trend && "ml-2")}>
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}