import React, { useState,useEffect } from "react";
import { Lock, EyeOff, Eye } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../shared/auth/useAuth";
import FormInput from "../../../shared/components/form/FormInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login,isAuthed } = useAuth();

  type LocationState = {
    from?: {
      pathname: string;
    };
  };
  const from = (location.state as LocationState)?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthed) {
      navigate(from, { replace: true });
    }
  }, [isAuthed, from, navigate]);

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const token = await login(email, password);
      if (token) {
        navigate("/", { replace: true });
      }
      console.log("login", login);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เข้าสู่ระบบไม่สำเร็จ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-3 rounded-4xl shadow-lg shadow-blue-200">
            <Lock className="text-white" size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          เข้าสู่ระบบ
        </h2>
        <p className="text-center text-slate-500 mb-8 text-sm">
          เพื่อเริ่มใช้งาน
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormInput
            label="ชื่อผู้ใช้งาน"
            type="text"
            placeholder="ระบุชื่อผู้ใช้งาน"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <FormInput
              label="รหัสผ่าน"
              type={showPassword ? "text" : "password"}
              placeholder="ระบุรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
              isFormValid && !loading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>
      </div>
    </div>
  );
}
