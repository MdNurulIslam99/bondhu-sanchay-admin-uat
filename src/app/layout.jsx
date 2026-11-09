import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const metadata = {
    title: { default: "Bondhu Sanchay Parishad", template: "%s | Bondhu Sanchay Parishad" },
    description: "A community-based savings and joint investment platform",
};
export const viewport = { width: "device-width", initialScale: 1, themeColor: "#11634c" };
// Set the theme class before hydration to avoid a dark-mode flash
const themeScript = `try{if(localStorage.getItem('bs_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`;
export default function RootLayout({ children }) {
    return (<html lang="en" className={inter.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }}/></head>
      <body className="font-sans"><StoreProvider>{children}</StoreProvider></body>
    </html>);
}
