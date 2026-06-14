import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

/**
 * Prototype state for the first-time entity onboarding wizard (the CSL Admin
 * persona) plus the platform notifications it raises. Shared at the app root
 * so the wizard and the Group Console notification bell read the same store,
 * and so wizard progress survives navigating out to the Flow Builder and back.
 */

export type BotTone = "friendly" | "formal" | "neutral"

export interface OnboardingEscalationRule {
  id: string
  intentCategory: string
  team: string
  isDefault: boolean
}

export interface OnboardingData {
  botName: string
  tone: BotTone
  channels: { whatsapp: boolean; web: boolean; mobile: boolean }
  kbDocs: string[]
  escalationRules: OnboardingEscalationRule[]
  templateFlowStarted: boolean
  submitted: boolean
}

export interface PlatformNotification {
  id: string
  title: string
  body: string
  timestamp: string
  read: boolean
}

interface OnboardingContextValue {
  data: OnboardingData
  setBotName: (name: string) => void
  setTone: (tone: BotTone) => void
  toggleChannel: (key: keyof OnboardingData["channels"]) => void
  addKbDocs: (names: string[]) => void
  addEscalationRule: (intentCategory: string, team: string) => void
  removeEscalationRule: (id: string) => void
  markTemplateFlowStarted: () => void
  submit: () => void
  notifications: PlatformNotification[]
  markNotificationsRead: () => void
}

const INITIAL_DATA: OnboardingData = {
  botName: "",
  tone: "friendly",
  channels: { whatsapp: false, web: false, mobile: false },
  kbDocs: [],
  // A default fallback route is pre-suggested so the entity starts with a
  // working safety net (CLAUDE.md §7.10).
  escalationRules: [
    {
      id: "csl-default",
      intentCategory: "Default (unmatched intents)",
      team: "Customer Support Team",
      isDefault: true,
    },
  ],
  templateFlowStarted: false,
  submitted: false,
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [notifications, setNotifications] = useState<PlatformNotification[]>([])

  const setBotName = useCallback(
    (botName: string) => setData((d) => ({ ...d, botName })),
    []
  )
  const setTone = useCallback(
    (tone: BotTone) => setData((d) => ({ ...d, tone })),
    []
  )
  const toggleChannel = useCallback(
    (key: keyof OnboardingData["channels"]) =>
      setData((d) => ({
        ...d,
        channels: { ...d.channels, [key]: !d.channels[key] },
      })),
    []
  )
  const addKbDocs = useCallback(
    (names: string[]) =>
      setData((d) => ({ ...d, kbDocs: [...d.kbDocs, ...names] })),
    []
  )
  const addEscalationRule = useCallback(
    (intentCategory: string, team: string) =>
      setData((d) => ({
        ...d,
        escalationRules: [
          ...d.escalationRules.filter((r) => !r.isDefault),
          {
            id: `csl-esc-${Date.now()}`,
            intentCategory,
            team,
            isDefault: false,
          },
          ...d.escalationRules.filter((r) => r.isDefault),
        ],
      })),
    []
  )
  const removeEscalationRule = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        escalationRules: d.escalationRules.filter((r) => r.id !== id),
      })),
    []
  )
  const markTemplateFlowStarted = useCallback(
    () => setData((d) => ({ ...d, templateFlowStarted: true })),
    []
  )

  const submit = useCallback(() => {
    setData((d) => ({ ...d, submitted: true }))
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "New onboarding request",
        body: "CSL Stockbrokers has submitted its onboarding setup for platform review.",
        timestamp: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ])
  }, [])

  const markNotificationsRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))),
    []
  )

  const value = useMemo<OnboardingContextValue>(
    () => ({
      data,
      setBotName,
      setTone,
      toggleChannel,
      addKbDocs,
      addEscalationRule,
      removeEscalationRule,
      markTemplateFlowStarted,
      submit,
      notifications,
      markNotificationsRead,
    }),
    [
      data,
      setBotName,
      setTone,
      toggleChannel,
      addKbDocs,
      addEscalationRule,
      removeEscalationRule,
      markTemplateFlowStarted,
      submit,
      notifications,
      markNotificationsRead,
    ]
  )

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext)
  if (!ctx)
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  return ctx
}
