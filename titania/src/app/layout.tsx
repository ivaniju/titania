import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titania — Tu entrenador personal",
  description: "Fitness de nivel comercial. Entrena, come bien y compite con tus amigos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
  viewportFit: "cover",
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
