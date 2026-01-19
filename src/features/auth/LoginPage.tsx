// import React, { useState } from "react";
// import { Lock, EyeOff, Eye } from "lucide-react";
// import { useNavigate } from "react-router";

// interface LoginProps {
//   onLoginSuccess: () => void;
// }
// export default function Login({ onLoginSuccess }: LoginProps) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();

//   const isFormValid = email.trim() !== "" && password.trim() !== "";

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     if (email === "admin@apauto.com" && password === "1234") {
//       localStorage.setItem("isAuthenticated", "true");
//       localStorage.setItem("userEmail", email);
//       onLoginSuccess();
//       navigate("/");
//     } else {
//       setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
//       <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-slate-200">
//         <div className="flex justify-center mb-6">
//           <div className="bg-blue-600 p-3 rounded-4xl shadow-lg shadow-blue-200">
//             <Lock className="text-white" size={32} />
//           </div>
//         </div>

//         <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
//           เข้าสู่ระบบ
//         </h2>
//         <p className="text-center text-slate-500 mb-8 text-sm">
//           เพื่อเริ่มใช้งาน
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <FormInput
//             label="ชื่อผู้ใช้งาน"
//             type="email"
//             placeholder="ระบุชื่อผู้ใช้งาน"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <div className="relative">
//             <FormInput
//               label="รหัสผ่าน"
//               type={showPassword ? "text" : "password"}
//               placeholder="ระบุรหัสผ่าน"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-9.5 text-slate-400 hover:text-slate-600 transition-colors"
//             >
//               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//             </button>
//           </div>

//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-xs text-center font-medium animate-shake">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={!isFormValid}
//             className={`w-full font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
//               isFormValid
//                 ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95"
//                 : "bg-slate-200 text-slate-400 cursor-not-allowed"
//             }`}
//           >
//             เข้าสู่ระบบ
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }
