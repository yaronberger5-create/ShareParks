interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

const sizes = {
  sm: { icon: 'w-7 h-7', text: 'text-base', p: 'text-xs' },
  md: { icon: 'w-10 h-10', text: 'text-xl', p: 'text-sm' },
  lg: { icon: 'w-14 h-14', text: 'text-3xl', p: 'text-lg' },
};

export function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const s = sizes[size];
  const shareColor = variant === 'dark' ? 'text-black' : 'text-white';

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon — Orange circle with white P */}
      <div className={`${s.icon} rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50`}>
        <span className={`${s.p} font-black text-white leading-none`}>P</span>
      </div>
      {/* Text */}
      <span className={`${s.text} font-black leading-none tracking-tight`}>
        <span className={shareColor}>Share</span>
        <span className="text-orange-500">Parks</span>
      </span>
    </div>
  );
}
