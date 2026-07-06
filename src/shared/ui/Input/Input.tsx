import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useTranslation } from "react-i18next";
import { cx } from "../cx";
import "./Input.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ invalid, className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cx("input", invalid && "input--invalid", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
);
Input.displayName = "Input";

/** Password input with a show/hide reveal toggle. */
export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type">>(
  ({ className, ...rest }, ref) => {
    const { t } = useTranslation("common");
    const [show, setShow] = useState(false);
    return (
      <div className="pw-field">
        <Input
          ref={ref}
          type={show ? "text" : "password"}
          className={cx("pw-field__input", className)}
          {...rest}
        />
        <button
          type="button"
          className="pw-field__toggle"
          aria-label={show ? t("hidePassword") : t("showPassword")}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          {show ? (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
              strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ invalid, className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cx("input", invalid && "input--invalid", className)}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  )
);
Textarea.displayName = "Textarea";

/** Label + control wrapper with hint / error slots. Wires up a11y ids. */
export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <span className="field__error" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  );
}
