import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/500.css";
import "./globals.css";
import "./personal.css";

export const metadata = { title: "TrueLabel | Evidence behind the label", description: "Live product-label evidence checks powered by Clocked." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return <html lang="en"><body>{children}</body></html>;
}
