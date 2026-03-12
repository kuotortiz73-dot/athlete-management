"use client";

import { createAthlete } from "@/app/actions";
import Link from "next/link";

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  padding: "8px 12px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: "bold",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: "6px",
};

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
}) {
  if (options) {
    return (
      <div>
        <label style={labelStyle}>
          {label} {required && <span style={{ color: "var(--neon)" }}>*</span>}
        </label>
        <select name={name} required={required} defaultValue={defaultValue} style={inputStyle}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div>
      <label style={labelStyle}>
        {label} {required && <span style={{ color: "var(--neon)" }}>*</span>}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "var(--neon)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

export default function NewAthletePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回列表
      </Link>

      <div style={{ borderLeft: "3px solid var(--neon)", paddingLeft: "12px" }}>
        <h1
          className="text-xl font-black tracking-wider uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          添加运动员
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          填写运动员基本信息
        </p>
      </div>

      <form action={createAthlete} className="space-y-6">
        {/* 基础信息 */}
        <section
          className="p-5 space-y-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--neon)" }}
          >
            基础信息
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="姓名" name="name" required placeholder="张三" />
            <Field
              label="性别"
              name="gender"
              required
              options={[
                { value: "male", label: "男" },
                { value: "female", label: "女" },
              ]}
            />
            <Field label="年龄" name="age" type="number" required placeholder="25" />
            <Field label="国籍" name="nationality" defaultValue="中国" placeholder="中国" />
            <Field
              label="状态"
              name="status"
              options={[
                { value: "active", label: "在役" },
                { value: "injured", label: "伤病" },
                { value: "retired", label: "退役" },
              ]}
            />
            <Field label="手机" name="phone" placeholder="13800138000" />
          </div>
        </section>

        {/* 运动信息 */}
        <section
          className="p-5 space-y-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--neon)" }}
          >
            运动信息
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="运动项目" name="sport" required placeholder="举重" />
            <Field label="具体位置/专项" name="position" placeholder="85kg级" />
            <Field label="所属队伍" name="team" placeholder="省队" />
            <Field label="主教练" name="coachName" placeholder="李教练" />
          </div>
        </section>

        {/* 体格信息 */}
        <section
          className="p-5 space-y-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: "var(--neon)" }}
          >
            体格信息
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="身高 (cm)" name="height" type="number" placeholder="180" />
            <Field label="体重 (kg)" name="weight" type="number" placeholder="85" />
          </div>
        </section>

        {/* 备注 */}
        <div>
          <label style={labelStyle}>备注</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="其他信息..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/"
            className="px-6 py-2 text-sm font-bold tracking-wider uppercase"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            取消
          </Link>
          <button
            type="submit"
            className="px-8 py-2 text-sm font-black tracking-wider uppercase"
            style={{ background: "var(--neon)", color: "#0d0d0d" }}
          >
            创建运动员
          </button>
        </div>
      </form>
    </div>
  );
}
