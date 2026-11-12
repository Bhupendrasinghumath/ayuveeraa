import blackLogo from "../assets/logos/black.png";
import whiteLogo from "../assets/logos/white.png";

export default function BrandWordmark({ color = "dark", className = "", alt = "Ayuveera" }) {
  const src = color === "light" ? whiteLogo : blackLogo;

  return <img src={src} alt={alt} className={`object-cover object-center ${className}`} />;
}
