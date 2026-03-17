import { useState } from "react";
import Modal from "../components/Modal.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { useSettings } from "../hooks/useSettings.jsx";
import { useTheme } from "../hooks/useTheme.jsx";
import { insforge } from "../lib/insforge.js";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-tab-bar pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">设置</h1>
        <p className="text-sm text-text-secondary">个性化你的训练体验</p>
      </header>

      <section className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          账户
        </h2>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">邮箱</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
            <button
              className="text-sm font-medium text-danger"
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
            >
              退出登录
            </button>
          </div>
        </div>
      </section>

      <section className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          外观
        </h2>
        <div className="card space-y-4">
          <SettingRow label="主题">
            <div className="flex gap-2">
              {[
                { value: "system", label: "跟随系统" },
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`chip ${theme === option.value ? "chip-selected" : ""}`}
                  type="button"
                  onClick={() => setTheme(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </section>

      <section className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          训练偏好
        </h2>
        <div className="card space-y-4">
          <SettingRow label="重量单位">
            <div className="flex gap-2">
              {[
                { value: "kg", label: "公斤 (kg)" },
                { value: "lb", label: "磅 (lb)" }
              ].map((option) => (
                <button
                  key={option.value}
                  className={`chip ${settings.weightUnit === option.value ? "chip-selected" : ""}`}
                  type="button"
                  onClick={() => updateSetting("weightUnit", option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="默认休息时间">
            <select
              className="input w-32"
              value={settings.defaultRestDuration}
              onChange={(e) => updateSetting("defaultRestDuration", Number(e.target.value))}
            >
              <option value={30}>30 秒</option>
              <option value={45}>45 秒</option>
              <option value={60}>60 秒</option>
              <option value={90}>90 秒</option>
              <option value={120}>2 分钟</option>
              <option value={180}>3 分钟</option>
            </select>
          </SettingRow>

          <SettingRow label="重量递增单位">
            <select
              className="input w-32"
              value={settings.weightIncrement}
              onChange={(e) => updateSetting("weightIncrement", Number(e.target.value))}
            >
              <option value={1}>1 kg</option>
              <option value={1.25}>1.25 kg</option>
              <option value={2.5}>2.5 kg</option>
              <option value={5}>5 kg</option>
            </select>
          </SettingRow>

          <SettingRow label="默认次数">
            <select
              className="input w-24"
              value={settings.defaultReps}
              onChange={(e) => updateSetting("defaultReps", Number(e.target.value))}
            >
              {[5, 6, 8, 10, 12, 15].map((reps) => (
                <option key={reps} value={reps}>
                  {reps} 次
                </option>
              ))}
            </select>
          </SettingRow>
        </div>
      </section>

      <section className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          反馈
        </h2>
        <div className="card space-y-4">
          <SettingRow label="触觉反馈">
            <Toggle
              enabled={settings.hapticEnabled}
              onChange={(v) => updateSetting("hapticEnabled", v)}
            />
          </SettingRow>

          <SettingRow label="记录后自动开始计时">
            <Toggle
              enabled={settings.autoStartTimer}
              onChange={(v) => updateSetting("autoStartTimer", v)}
            />
          </SettingRow>

          <SettingRow label="PR 提醒">
            <Toggle
              enabled={settings.showPRNotification}
              onChange={(v) => updateSetting("showPRNotification", v)}
            />
          </SettingRow>
        </div>
      </section>

      <section className="mb-6 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          数据
        </h2>
        <div className="card">
          <button
            className="w-full text-left text-danger"
            type="button"
            onClick={() => setShowResetConfirm(true)}
          >
            重置所有设置
          </button>
        </div>
      </section>

      <footer className="pb-8 text-center text-xs text-text-tertiary">
        <p>Reps v1.0.0</p>
        <p className="mt-1">Made with 💪 for lifters</p>
      </footer>

      <Modal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-text-primary">确认退出登录？</p>
          <div className="flex gap-3">
            <button
              className="btn btn-secondary flex-1"
              type="button"
              onClick={() => setShowLogoutConfirm(false)}
            >
              取消
            </button>
            <button className="btn btn-danger flex-1" type="button" onClick={handleLogout}>
              退出
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
        <div className="space-y-4 text-center">
          <p className="text-lg font-semibold text-text-primary">重置所有设置？</p>
          <p className="text-sm text-text-secondary">这将恢复所有设置为默认值</p>
          <div className="flex gap-3">
            <button
              className="btn btn-secondary flex-1"
              type="button"
              onClick={() => setShowResetConfirm(false)}
            >
              取消
            </button>
            <button
              className="btn btn-danger flex-1"
              type="button"
              onClick={() => {
                resetSettings();
                setShowResetConfirm(false);
              }}
            >
              重置
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-text-primary">{label}</span>
      {children}
    </div>
  );
}

function Toggle({ enabled, onChange }) {
  return (
    <button
      className={`relative h-8 w-14 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-bg-tertiary"
      }`}
      type="button"
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          enabled ? "left-7" : "left-1"
        }`}
      />
    </button>
  );
}
