import { forwardRef } from "react";

/**
 * Reusable Input component with icon support, error messages, and consistent styling.
 *
 * @param {string}          label       - Label text
 * @param {React.ReactNode} icon        - Leading icon (Lucide component instance)
 * @param {React.ReactNode} rightIcon   - Trailing icon/button (e.g., eye toggle)
 * @param {string}          error       - Error message to display
 * @param {string}          hint        - Hint text below input
 * @param {string}          className   - Extra wrapper classes
 * @param {string}          inputClassName - Extra input classes
 * @param {boolean}         textarea    - Render as textarea
 * @param {number}          rows        - Textarea rows
 */
const Input = forwardRef(function Input(
  {
    label,
    icon: Icon,
    rightIcon,
    error,
    hint,
    className = "",
    inputClassName = "",
    textarea = false,
    rows = 4,
    id,
    ...rest
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const baseInputClasses = `
    w-full rounded-xl border
    bg-white dark:bg-white/5
    border-slate-200 dark:border-white/10
    text-slate-900 dark:text-white
    placeholder-slate-400 dark:placeholder-slate-500
    text-sm
    focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500/50
    hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/8
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${error ? "border-red-400 dark:border-red-500/50 focus:ring-red-500/60" : ""}
    ${Icon ? "pl-10" : "px-4"}
    ${rightIcon ? "pr-10" : "pr-4"}
    ${inputClassName}
  `.trim();

  const Component = textarea ? "textarea" : "input";

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        )}
        <Component
          ref={ref}
          id={inputId}
          className={`${baseInputClasses} ${textarea ? "resize-none" : ""} py-3`}
          rows={textarea ? rows : undefined}
          {...rest}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 dark:text-red-400 animate-fade-in">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
