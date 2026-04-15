import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button component.
 *
 * @param {"primary"|"ghost"|"danger"|"link"} variant
 * @param {"sm"|"md"|"lg"}                    size
 * @param {boolean}                           loading  - Shows spinner, disables button
 * @param {boolean}                           fullWidth
 * @param {React.ReactNode}                   icon     - Leading icon element
 * @param {string}                            className - Extra classes
 */

const VARIANT = {
  primary:
    "bg-brand-gradient text-white font-semibold shadow-glow-sm hover:shadow-glow hover:scale-[1.02] focus:ring-brand-500 active:scale-[0.98] disabled:hover:scale-100 disabled:hover:shadow-none",
  ghost:
    "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:text-slate-900 dark:hover:text-white focus:ring-brand-500/40 active:scale-[0.98]",
  danger:
    "bg-red-500 dark:bg-red-600/80 text-white font-semibold hover:bg-red-600 dark:hover:bg-red-600 hover:scale-[1.02] focus:ring-red-500 active:scale-[0.98]",
  link:
    "bg-transparent text-brand-500 dark:text-brand-400 font-medium hover:text-brand-600 dark:hover:text-brand-300 underline-offset-4 hover:underline p-0",
};

const SIZE = {
  sm: "px-3.5 py-2 text-xs rounded-lg gap-1.5",
  md: "px-5 py-3 text-sm rounded-xl gap-2",
  lg: "px-6 py-3.5 text-base rounded-xl gap-2.5",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    icon,
    className = "",
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-0
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT[variant] ?? VARIANT.primary}
        ${variant !== "link" ? SIZE[size] ?? SIZE.md : ""}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.trim()}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className={`animate-spin ${size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
          {children}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
});

export default Button;
