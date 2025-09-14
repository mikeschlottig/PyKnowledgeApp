import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Settings as SettingsIcon, Save, RefreshCw, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import BrutalistButton from "../components/BrutalistButton";

export default function Settings() {
  const [settings, setSettings] = useState({
    ai_model: "gpt-4",
    processing_batch_size: 10,
    search_results_limit: 50,
    auto_tag_generation: true,
    semantic_search_enabled: true,
    summary_generation: true,
    content_filtering: true,
    processing_timeout: 300,
    max_file_size: 50,
    notification_email: "",
    backup_frequency: "daily",
    data_retention_days: 365
  });

  const [saving, setSaving] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [user, setUser] = useState(null);
  const [systemStats, setSystemStats] = useState({
    uptime: "99.9%",
    storage_used: "2.3 GB",
    total_storage: "100 GB",
    api_calls_today: 1247,
    processing_queue_size: 3
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      // Load user-specific settings if they exist
      if (currentUser.settings) {
        setSettings(prev => ({ ...prev, ...currentUser.settings }));
      }
      
      if (currentUser.email) {
        setSettings(prev => ({ ...prev, notification_email: currentUser.email }));
      }
    } catch (error) {
      console.error("Error loading user settings:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData({ settings });
      
      // Show success feedback
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      ai_model: "gpt-4",
      processing_batch_size: 10,
      search_results_limit: 50,
      auto_tag_generation: true,
      semantic_search_enabled: true,
      summary_generation: true,
      content_filtering: true,
      processing_timeout: 300,
      max_file_size: 50,
      notification_email: user?.email || "",
      backup_frequency: "daily",
      data_retention_days: 365
    });
    setResetConfirm(false);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          SYSTEM SETTINGS
        </h1>
        <div className="bg-blue-500 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-white uppercase tracking-wider">
            CONFIGURE YOUR PLATFORM
          </p>
        </div>
      </div>

      {/* System Status */}
      <BrutalistCard color="green">
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          SYSTEM STATUS
        </h3>
        
        <div className="grid md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="font-black text-2xl text-black mb-1">{systemStats.uptime}</p>
            <p className="font-bold text-xs text-black uppercase">UPTIME</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl text-black mb-1">{systemStats.storage_used}</p>
            <p className="font-bold text-xs text-black uppercase">STORAGE</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl text-black mb-1">{systemStats.api_calls_today}</p>
            <p className="font-bold text-xs text-black uppercase">API CALLS</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl text-black mb-1">{systemStats.processing_queue_size}</p>
            <p className="font-bold text-xs text-black uppercase">IN QUEUE</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-black mx-auto mb-1" />
            <p className="font-bold text-xs text-black uppercase">HEALTHY</p>
          </div>
        </div>
      </BrutalistCard>

      {/* AI & Processing Settings */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          AI & PROCESSING CONFIGURATION
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block font-black text-sm uppercase mb-2">AI MODEL</label>
            <select
              value={settings.ai_model}
              onChange={(e) => handleSettingChange('ai_model', e.target.value)}
              className="brutalist-input w-full py-3 text-black font-black uppercase"
            >
              <option value="gpt-4">GPT-4 (RECOMMENDED)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 TURBO (FASTER)</option>
              <option value="claude-3">CLAUDE 3 (ALTERNATIVE)</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-sm uppercase mb-2">PROCESSING BATCH SIZE</label>
            <input
              type="number"
              min="1"
              max="50"
              value={settings.processing_batch_size}
              onChange={(e) => handleSettingChange('processing_batch_size', parseInt(e.target.value))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>

          <div>
            <label className="block font-black text-sm uppercase mb-2">SEARCH RESULTS LIMIT</label>
            <input
              type="number"
              min="10"
              max="200"
              value={settings.search_results_limit}
              onChange={(e) => handleSettingChange('search_results_limit', parseInt(e.target.value))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>

          <div>
            <label className="block font-black text-sm uppercase mb-2">PROCESSING TIMEOUT (SECONDS)</label>
            <input
              type="number"
              min="60"
              max="600"
              value={settings.processing_timeout}
              onChange={(e) => handleSettingChange('processing_timeout', parseInt(e.target.value))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>
        </div>
      </BrutalistCard>

      {/* Feature Toggles */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          FEATURE SETTINGS
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { key: 'auto_tag_generation', label: 'AUTO TAG GENERATION', description: 'Automatically generate tags for uploaded content' },
            { key: 'semantic_search_enabled', label: 'SEMANTIC SEARCH', description: 'Enable AI-powered semantic search capabilities' },
            { key: 'summary_generation', label: 'SUMMARY GENERATION', description: 'Generate AI summaries for all content' },
            { key: 'content_filtering', label: 'CONTENT FILTERING', description: 'Filter inappropriate or irrelevant content' }
          ].map((feature) => (
            <div
              key={feature.key}
              className={`
                border-4 border-black p-4 cursor-pointer transition-all duration-200
                ${settings[feature.key] ? 'bg-green-100' : 'bg-gray-100'}
              `}
              onClick={() => handleSettingChange(feature.key, !settings[feature.key])}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-black text-sm uppercase">{feature.label}</p>
                <div className={`
                  w-12 h-6 border-2 border-black relative
                  ${settings[feature.key] ? 'bg-green-500' : 'bg-gray-400'}
                `}>
                  <div className={`
                    w-4 h-4 bg-white border-2 border-black absolute top-0 transition-all duration-200
                    ${settings[feature.key] ? 'right-0' : 'left-0'}
                  `} />
                </div>
              </div>
              <p className="font-bold text-xs text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </BrutalistCard>

      {/* Storage & Data Settings */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          STORAGE & DATA MANAGEMENT
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block font-black text-sm uppercase mb-2">MAX FILE SIZE (MB)</label>
            <input
              type="number"
              min="1"
              max="500"
              value={settings.max_file_size}
              onChange={(e) => handleSettingChange('max_file_size', parseInt(e.target.value))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>

          <div>
            <label className="block font-black text-sm uppercase mb-2">BACKUP FREQUENCY</label>
            <select
              value={settings.backup_frequency}
              onChange={(e) => handleSettingChange('backup_frequency', e.target.value)}
              className="brutalist-input w-full py-3 text-black font-black uppercase"
            >
              <option value="hourly">HOURLY</option>
              <option value="daily">DAILY</option>
              <option value="weekly">WEEKLY</option>
              <option value="monthly">MONTHLY</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-sm uppercase mb-2">DATA RETENTION (DAYS)</label>
            <input
              type="number"
              min="30"
              max="3650"
              value={settings.data_retention_days}
              onChange={(e) => handleSettingChange('data_retention_days', parseInt(e.target.value))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>
        </div>
      </BrutalistCard>

      {/* Notifications */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          NOTIFICATIONS
        </h3>
        
        <div>
          <label className="block font-black text-sm uppercase mb-2">NOTIFICATION EMAIL</label>
          <input
            type="email"
            value={settings.notification_email}
            onChange={(e) => handleSettingChange('notification_email', e.target.value)}
            className="brutalist-input w-full py-3 text-black font-black"
            placeholder="YOUR@EMAIL.COM"
          />
        </div>
      </BrutalistCard>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <BrutalistButton
            onClick={saveSettings}
            disabled={saving}
            variant="success"
            size="large"
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                SAVING...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                SAVE SETTINGS
              </>
            )}
          </BrutalistButton>
        </div>

        <div className="flex gap-4">
          {resetConfirm ? (
            <div className="flex gap-2">
              <BrutalistButton
                onClick={resetToDefaults}
                variant="danger"
                size="small"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                CONFIRM RESET
              </BrutalistButton>
              <BrutalistButton
                onClick={() => setResetConfirm(false)}
                variant="outline"
                size="small"
              >
                CANCEL
              </BrutalistButton>
            </div>
          ) : (
            <BrutalistButton
              onClick={() => setResetConfirm(true)}
              variant="outline"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              RESET TO DEFAULTS
            </BrutalistButton>
          )}
        </div>
      </div>

      {/* Warning */}
      <BrutalistCard color="yellow">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="w-6 h-6 text-black mt-1" />
          <div>
            <p className="font-black text-sm text-black uppercase mb-2">
              CONFIGURATION WARNING
            </p>
            <p className="font-bold text-sm text-black">
              Changes to AI model and processing settings may affect system performance. 
              Higher batch sizes and shorter timeouts may cause processing failures. 
              Test changes with small datasets first.
            </p>
          </div>
        </div>
      </BrutalistCard>
    </div>
  );
}