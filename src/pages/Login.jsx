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
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo & branding */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-text-primary">
            <svg className="h-8 w-8 text-bg-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2Z" />
              <path d="M13.5 6.5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2Z" />
              <path d="M4 10.5h16" />
              <path d="M6 10.5v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7" />
              <path d="M4 10.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h2.5" />
              <path d="M20 10.5a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-2.5" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-text-primary">
            Reps
          </h1>
          <p className="mt-1 text-sm text-text-tertiary">
            记录每一组，见证每一步
          </p>
        </div>

        {/* Login card */}
        <div className="card !p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                邮箱
              </label>
              <input
                required
                className="input"
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                密码
              </label>
              <input
                required
                className="input"
                minLength={6}
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-danger/10 px-3 py-2.5 text-sm text-danger">
                {error}
              </div>
            )}

            <button
              className="btn btn-primary w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loading-spinner !h-4 !w-4 !border-zinc-500 !border-t-white" />
                  处理中...
                </span>
              ) : isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-text-tertiary">
            {isLogin ? "还没有账号？" : "已有账号？"}
            <button
              className="ml-1 font-semibold text-text-primary hover:underline transition-colors"
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
