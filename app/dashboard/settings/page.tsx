'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { User, Lock, Palette, Globe } from "lucide-react"
import { useTheme } from "next-themes"

interface UserSettings {
  name: string;
  email: string;
  mbtiType: string;
  decisionStyle: string;
  primaryBias: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr';
}

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
]

const DECISION_STYLES = [
  'Analytical',
  'Intuitive',
  'Balanced',
  'Cautious',
  'Impulsive'
]

const COGNITIVE_BIASES = [
  'Confirmation Bias',
  'Anchoring Bias',
  'Availability Heuristic',
  'Overconfidence Bias',
  'Hindsight Bias',
  'Loss Aversion',
  'Status Quo Bias'
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const { setTheme, theme: currentTheme } = useTheme()
  const [settings, setSettings] = useState<UserSettings>({
    name: '',
    email: '',
    mbtiType: '',
    decisionStyle: '',
    primaryBias: '',
    theme: 'system',
    language: 'en'
  })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await fetch('/api/settings/account')
        if (!response.ok) {
          throw new Error('Failed to fetch user settings')
        }
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          name: data.name || '',
          email: data.email || '',
          mbtiType: data.mbtiType || '',
          decisionStyle: data.decisionStyle || '',
          primaryBias: data.primaryBias || '',
          theme: data.theme || 'system',
          language: data.language || 'en'
        }))
      } catch (error) {
        console.error('Error fetching user settings:', error)
        toast.error('Failed to load user settings')
      }
    }

    if (session?.user) {
      fetchUserSettings()
    }
  }, [session])

  const handleAccountUpdate = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/account', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: settings.name,
          mbtiType: settings.mbtiType,
          decisionStyle: settings.decisionStyle,
          primaryBias: settings.primaryBias
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update account settings')
      }

      toast.success('Account settings updated successfully')
    } catch (error) {
      console.error('Error updating account settings:', error)
      toast.error('Failed to update account settings')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password')
      }

      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update theme')
      }

      // Update the theme immediately using next-themes
      setTheme(theme)
      setSettings(prev => ({ ...prev, theme }))
      toast.success('Theme updated successfully')
    } catch (error) {
      console.error('Error updating theme:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update theme')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLanguageChange = async (language: 'en' | 'es' | 'fr') => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/language', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language }),
      })

      if (!response.ok) {
        throw new Error('Failed to update language')
      }

      setSettings(prev => ({ ...prev, language }))
      toast.success('Language updated successfully')
    } catch (error) {
      console.error('Error updating language:', error)
      toast.error('Failed to update language')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Update your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={settings.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mbti">MBTI Type</Label>
              <Select
                value={settings.mbtiType}
                onValueChange={(value) => setSettings(prev => ({ ...prev, mbtiType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select MBTI type" />
                </SelectTrigger>
                <SelectContent>
                  {MBTI_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decisionStyle">Decision Style</Label>
              <Select
                value={settings.decisionStyle}
                onValueChange={(value) => setSettings(prev => ({ ...prev, decisionStyle: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select decision style" />
                </SelectTrigger>
                <SelectContent>
                  {DECISION_STYLES.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryBias">Primary Cognitive Bias</Label>
              <Select
                value={settings.primaryBias}
                onValueChange={(value) => setSettings(prev => ({ ...prev, primaryBias: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select primary bias" />
                </SelectTrigger>
                <SelectContent>
                  {COGNITIVE_BIASES.map(bias => (
                    <SelectItem key={bias} value={bias}>{bias}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAccountUpdate} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Settings
            </CardTitle>
            <CardDescription>
              Change your account password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={isLoading}>
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Customize your application theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={currentTheme || settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => handleThemeChange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Language Settings
            </CardTitle>
            <CardDescription>
              Choose your preferred language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value: 'en' | 'es' | 'fr') => handleLanguageChange(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 