import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-bold tracking-tight rounded-lg transition duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-3.5 py-2 text-xs gap-2",
    lg: "px-4.5 py-2.5 text-sm gap-2.5"
  };

  const variantStyles = {
    primary: "bg-genesis-gold hover:bg-genesis-goldHover text-genesis-black shadow-subtle focus-visible:ring-genesis-gold active:scale-[0.98]",
    secondary: "bg-white hover:bg-zinc-50 text-genesis-black border border-genesis-border shadow-subtle focus-visible:ring-zinc-400 active:scale-[0.98]",
    dark: "bg-genesis-black hover:bg-zinc-800 text-white shadow-subtle focus-visible:ring-zinc-600 active:scale-[0.98]",
    outline: "bg-transparent hover:bg-zinc-100 text-zinc-700 border border-zinc-300 focus-visible:ring-zinc-400 active:scale-[0.98]",
    ghost: "bg-transparent hover:bg-zinc-100 text-zinc-700 focus-visible:ring-zinc-400 active:scale-[0.98]",
    danger: "bg-genesis-error hover:bg-red-700 text-white shadow-subtle focus-visible:ring-red-500 active:scale-[0.98]"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
