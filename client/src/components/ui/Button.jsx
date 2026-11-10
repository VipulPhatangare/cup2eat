const styles = {
  gold: 'bg-gold text-deep hover:bg-gold-soft shadow-lg shadow-gold/25',
  forest: 'bg-forest text-cream hover:bg-deep',
  ghost: 'border border-white/30 text-cream hover:bg-white/10',
  outline: 'border border-forest/30 text-forest hover:bg-forest hover:text-cream',
};

export default function Button({ variant = 'gold', className = '', children, ...props }) {
  const Comp = props.href ? 'a' : 'button';
  const extra = Comp === 'button' && !props.type ? { type: 'button' } : {};
  return (
    <Comp
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...extra}
      {...props}
    >
      {children}
    </Comp>
  );
}
