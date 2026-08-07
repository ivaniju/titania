import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titan",
  description: "Tu entrenador personal. Configura tu vida una vez.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-bg text-text antialiased">
        <div className="mx-auto min-h-dvh w-full max-w-[480px] bg-bg">
          {children}
        </div>
      </body>
    </html>
  );
}
