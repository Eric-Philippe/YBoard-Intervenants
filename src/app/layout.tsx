import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import { TRPCReactProvider } from "~/trpc/react";
import { AuthProvider } from "~/contexts/AuthContext";
import { ModalProvider } from "~/contexts/ModalContext";
import { AppLayout } from "~/components";

export const metadata: Metadata = {
  title: "YBoard - Intervenants Ynov",
  description: "Application de gestion des intervenants Ynov",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <MantineProvider>
          <Notifications />
          <TRPCReactProvider>
            <AuthProvider>
              <ModalProvider>
                <AppLayout>{children}</AppLayout>
              </ModalProvider>
            </AuthProvider>
          </TRPCReactProvider>
        </MantineProvider>
      </body>
    </html>
  );
}
