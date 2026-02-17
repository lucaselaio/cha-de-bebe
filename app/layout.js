import "./globals.css";
import { Fredoka, Quicksand } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata = {
  title: "Chá de Bebê de Gêmeos",
  description: "Lista de sugestões de presentes para chá de bebê.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${quicksand.variable} ${fredoka.variable}`}>{children}</body>
    </html>
  );
}
