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
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="text-4xl">🏋️</div>
          <h1 className="mt-3 text-2xl font-bold text-text-primary">Reps</h1>
          <p className="mt-1 text-sm text-text-secondary">记录每一组</p>
        </div>

        <div className="card">
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

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              className="btn btn-primary w-full"
              disabled={loading}
              type="submit"
            >
              {loading ? "处理中..." : isLogin ? "登录" : "注册"}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-text-secondary">
            {isLogin ? "还没有账号？" : "已有账号？"}
            <button
              className="ml-2 font-semibold text-primary"
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
