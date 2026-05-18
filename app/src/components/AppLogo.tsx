import logoUrl from '../assets/images/logo.png';

interface AppLogoProps {
  size?: number;
  className?: string;
}

/**
 * 冷知识星球 Logo
 */
export function AppLogo({ size = 80, className }: AppLogoProps) {
  return (
    <img
      src={logoUrl}
      alt="冷知识星球"
      width={size}
      height={size}
      className={className}
    />
  );
}
