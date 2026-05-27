import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Lock, Bell, Server, Database, Wifi, Shield,
  Save, RefreshCw, Eye, EyeOff, CheckCircle2, AlertTriangle,
  Moon, Sun, Monitor, Zap, Globe, Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type SettingsTab = 'profile' | 'security' | 'notifications' | 'system' | 'integrations';

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'system', label: 'System', icon: <Server className="w-4 h-4" /> },
  { id: 'integrations', label: 'Integrations', icon: <Globe className="w-4 h-4" /> },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${checked ? 'bg-primary' : 'bg-secondary'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    fullName: user?.fullName ?? '',
    email: user?.email ?? '',
  });

  // Security form state
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification toggles
  const [notifications, setNotifications] = useState({
    lowStockAlerts: true,
    orderUpdates: true,
    robotFaults: true,
    systemEvents: false,
    emailDigest: false,
    mqttEvents: true,
  });

  // System settings
  const [system, setSystem] = useState({
    theme: 'dark' as 'dark' | 'light' | 'auto',
    refreshInterval: '15',
    autoLogout: '60',
    compactMode: false,
    animationsEnabled: true,
    debugMode: false,
  });

  // Integration settings
  const [integrations, setIntegrations] = useState({
    mqttBroker: 'broker.hivemq.com',
    mqttPort: '8884',
    mqttTopic: 'warehouse/#',
    apiBaseUrl: '/api/v1',
    wsEndpoint: '/ws/warehouse',
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate API call
    setSaving(false);
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  const handlePasswordChange = async () => {
    if (security.newPassword !== security.confirmPassword) {
      toast({ title: 'Password mismatch', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    if (security.newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'Password must be at least 8 characters.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your preferences and system configuration</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar Nav */}
        <nav className="flex sm:flex-col gap-1 sm:w-48 flex-shrink-0">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.15 }}
          className="flex-1 min-w-0"
        >
          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="stat-card space-y-6">
              <div>
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" /> Profile Information
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Update your personal details</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                  {(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.fullName || user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block ${
                    user?.role === 'admin' ? 'bg-destructive/10 text-destructive' :
                    user?.role === 'operator' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input
                    value={profile.fullName}
                    onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Your full name"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</Label>
                  <Input value={user?.username ?? ''} disabled className="bg-secondary/30 border-border opacity-60 cursor-not-allowed" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="bg-secondary/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</Label>
                  <Input value={user?.role ?? ''} disabled className="bg-secondary/30 border-border opacity-60 cursor-not-allowed capitalize" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={logout} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="stat-card space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary" /> Change Password
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Use a strong password with at least 8 characters</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={security.currentPassword}
                        onChange={e => setSecurity(s => ({ ...s, currentPassword: e.target.value }))}
                        className="bg-secondary/50 border-border pr-9"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">New Password</Label>
                    <Input
                      type="password"
                      value={security.newPassword}
                      onChange={e => setSecurity(s => ({ ...s, newPassword: e.target.value }))}
                      className="bg-secondary/50 border-border"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={security.confirmPassword}
                      onChange={e => setSecurity(s => ({ ...s, confirmPassword: e.target.value }))}
                      className={`bg-secondary/50 border-border ${security.confirmPassword && security.newPassword !== security.confirmPassword ? 'border-destructive' : ''}`}
                      placeholder="••••••••"
                    />
                    {security.confirmPassword && security.newPassword !== security.confirmPassword && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Passwords do not match
                      </p>
                    )}
                    {security.confirmPassword && security.newPassword === security.confirmPassword && security.newPassword.length >= 8 && (
                      <p className="text-xs text-slot-empty flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>
                </div>

                <Button onClick={handlePasswordChange} disabled={saving} size="sm" className="gap-2">
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>

              <div className="stat-card space-y-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Session & Access
                </h2>
                <SettingRow label="JWT Token" description="Used for all API requests — stored in localStorage">
                  <span className="text-xs font-mono text-primary bg-primary/5 px-2 py-1 rounded border border-primary/20">Active</span>
                </SettingRow>
                <SettingRow label="Auto Logout" description={`Session expires after ${system.autoLogout} minutes of inactivity`}>
                  <select
                    value={system.autoLogout}
                    onChange={e => setSystem(s => ({ ...s, autoLogout: e.target.value }))}
                    className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground"
                  >
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="120">2 hours</option>
                    <option value="0">Never</option>
                  </select>
                </SettingRow>
              </div>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeTab === 'notifications' && (
            <div className="stat-card space-y-1">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" /> Notification Preferences
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Control which events trigger notifications</p>
              </div>

              <SettingRow label="Low Stock Alerts" description="Notify when item quantity falls below minimum threshold">
                <Toggle checked={notifications.lowStockAlerts} onChange={v => setNotifications(n => ({ ...n, lowStockAlerts: v }))} />
              </SettingRow>
              <SettingRow label="Order Status Updates" description="Receive alerts on order state changes">
                <Toggle checked={notifications.orderUpdates} onChange={v => setNotifications(n => ({ ...n, orderUpdates: v }))} />
              </SettingRow>
              <SettingRow label="Robot Fault Alerts" description="Immediate alerts for AGV/AMR navigation errors">
                <Toggle checked={notifications.robotFaults} onChange={v => setNotifications(n => ({ ...n, robotFaults: v }))} />
              </SettingRow>
              <SettingRow label="System Events" description="Background task completions, sync events">
                <Toggle checked={notifications.systemEvents} onChange={v => setNotifications(n => ({ ...n, systemEvents: v }))} />
              </SettingRow>
              <SettingRow label="Email Digest" description="Daily summary report sent to your email">
                <Toggle checked={notifications.emailDigest} onChange={v => setNotifications(n => ({ ...n, emailDigest: v }))} />
              </SettingRow>
              <SettingRow label="MQTT Real-time Events" description="Live event badges from warehouse MQTT stream">
                <Toggle checked={notifications.mqttEvents} onChange={v => setNotifications(n => ({ ...n, mqttEvents: v }))} />
              </SettingRow>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          )}

          {/* ── SYSTEM ── */}
          {activeTab === 'system' && (
            <div className="stat-card space-y-1">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Server className="w-4 h-4 text-primary" /> System Preferences
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Adjust UI behavior and data refresh settings</p>
              </div>

              <SettingRow label="Theme" description="Choose your preferred color scheme">
                <div className="flex gap-1">
                  {([['dark', <Moon key="dark" className="w-3.5 h-3.5" />], ['light', <Sun key="light" className="w-3.5 h-3.5" />], ['auto', <Monitor key="auto" className="w-3.5 h-3.5" />]] as const).map(([id, icon]) => (
                    <button
                      key={id}
                      onClick={() => setSystem(s => ({ ...s, theme: id }))}
                      className={`p-1.5 rounded ${system.theme === id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </SettingRow>

              <SettingRow label="Data Refresh Interval" description="How often the dashboard auto-refreshes">
                <select
                  value={system.refreshInterval}
                  onChange={e => setSystem(s => ({ ...s, refreshInterval: e.target.value }))}
                  className="text-xs bg-secondary border border-border rounded px-2 py-1 text-foreground"
                >
                  <option value="5">5 seconds</option>
                  <option value="15">15 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                </select>
              </SettingRow>

              <SettingRow label="Compact Mode" description="Reduce spacing for denser information display">
                <Toggle checked={system.compactMode} onChange={v => setSystem(s => ({ ...s, compactMode: v }))} />
              </SettingRow>

              <SettingRow label="UI Animations" description="Enable smooth transitions and motion effects">
                <Toggle checked={system.animationsEnabled} onChange={v => setSystem(s => ({ ...s, animationsEnabled: v }))} />
              </SettingRow>

              <SettingRow label="Debug Mode" description="Show API response details and request logs">
                <Toggle checked={system.debugMode} onChange={v => setSystem(s => ({ ...s, debugMode: v }))} />
              </SettingRow>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? 'Saving...' : 'Save System Settings'}
                </Button>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {activeTab === 'integrations' && (
            <div className="space-y-4">
              <div className="stat-card space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-primary" /> MQTT Broker
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Real-time event streaming configuration</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Broker Host</Label>
                    <Input value={integrations.mqttBroker} onChange={e => setIntegrations(i => ({ ...i, mqttBroker: e.target.value }))} className="bg-secondary/50 border-border font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Port (WSS)</Label>
                    <Input value={integrations.mqttPort} onChange={e => setIntegrations(i => ({ ...i, mqttPort: e.target.value }))} className="bg-secondary/50 border-border font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs text-muted-foreground">Subscribe Topic</Label>
                    <Input value={integrations.mqttTopic} onChange={e => setIntegrations(i => ({ ...i, mqttTopic: e.target.value }))} className="bg-secondary/50 border-border font-mono text-sm" />
                  </div>
                </div>
              </div>

              <div className="stat-card space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" /> Backend API
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">FastAPI base configuration</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">API Base URL</Label>
                    <Input value={integrations.apiBaseUrl} onChange={e => setIntegrations(i => ({ ...i, apiBaseUrl: e.target.value }))} className="bg-secondary/50 border-border font-mono text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">WebSocket Endpoint</Label>
                    <Input value={integrations.wsEndpoint} onChange={e => setIntegrations(i => ({ ...i, wsEndpoint: e.target.value }))} className="bg-secondary/50 border-border font-mono text-sm" />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 rounded-lg px-3 py-2">
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span>Changes to API endpoints require a page refresh to take effect.</span>
                </div>
              </div>

              <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Saving...' : 'Save Integration Settings'}
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
