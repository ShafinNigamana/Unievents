import { forwardRef } from "react";

/**
 * Reusable Card component — standardized glassmorphism container.
 *
 * Variants:
 * - "glass"   : Default glass card with blur + gradient border
 * - "solid"   : Opaque surface card
 * - "outlined": Transparent with visible border
 *
 * @param {string}  variant   - "glass" | "solid" | "outlined"
 * @param {boolean} hoverable - Adds hover lift + glow effect
 * @param {boolean} clickable - Adds cursor-pointer
 * @param {string}  className - Additional classes
 * @param {string}  padding   - Override padding (default: "p-5 sm:p-6")
 */
const VARIANT_CLASSES = {
  glass:
    "bg-white/70 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/10 backdrop-blur-xl shadow-sm dark:shadow-card",
  solid:
    "bg-white dark:bg-surface-800 border border-slate-200 dark:border-white/10 shadow-sm",
  outlined:
    "bg-transparent border border-slate-200 dark:border-white/10",
};

const Card = forwardRef(function Card(
  {
    children,
    variant = "glass",
    hoverable = false,
    clickable = false,
    className = "",
    padding = "p-5 sm:p-6",
    ...rest
  },
  ref
) {
  const base = "rounded-2xl transition-all duration-300";
  const variantCls = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.glass;
  const hoverCls = hoverable
    ? "hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-glow-sm hover:border-brand-500/30 dark:hover:border-brand-500/30"
    : "";
  const cursorCls = clickable ? "cursor-pointer" : "";

  return (
    <div
      ref={ref}
      className={`${base} ${variantCls} ${hoverCls} ${cursorCls} ${padding} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
});

export default Card;

// Sub-components for structured content
export function CardHeader({ children, className = "" }) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return (
    <div className={`flex-1 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "" }) {
  return (
    <div className={`mt-4 pt-4 border-t border-slate-100 dark:border-white/8 ${className}`}>
      {children}
    </div>
  );
}
