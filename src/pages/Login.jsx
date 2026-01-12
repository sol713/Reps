import { useState } from "react";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const action = isLogin ? signIn : signUp;
    const { error: authError } = await action(email, password);

    if (authError) {
      setError(authError.message);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-3xl">🏋️</div>
          <h1 className="mt-2 text-2xl font-semibold">Reps</h1>
          <p className="mt-1 text-sm text-app-muted">记录每一组</p>
        </div>

        <div className="rounded-card border border-app-divider bg-app-card p-5 shadow-sm neo-surface-soft">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 rounded-input border border-app-divider bg-white px-3 py-2 neo-inset">
              <span className="text-xs text-app-muted">邮箱</span>
              <input
                required
                className="bg-transparent text-sm font-semibold outline-none"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="flex flex-col gap-2 rounded-input border border-app-divider bg-white px-3 py-2 neo-inset">
              <span className="text-xs text-app-muted">密码</span>
              <input
                required
                className="bg-transparent text-sm font-semibold outline-none"
                minLength={6}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              className="w-full rounded-button bg-app-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "处理中..." : isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-app-muted">
            {isLogin ? "还没有账号？" : "已有账号？"}
            <button
              className="ml-2 text-xs font-semibold text-app-primary"
              type="button"
              onClick={() => setIsLogin((prev) => !prev)}
            >
              {isLogin ? "注册" : "登录"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
