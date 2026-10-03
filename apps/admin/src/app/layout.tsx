import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAZOALA Inventory",
  description: "MAZOALA Inventory & Delivery Management System"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className="min-h-screen bg-slate-50 antialiased">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold tracking-tight text-slate-900">MAZOALA</span>
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                Inventory v1.0
              </span>
            </div>
            <nav className="flex space-x-6 text-sm font-medium text-slate-600">
              <a href="#catalog" className="hover:text-emerald-600">Каталог</a>
              <a href="#inventory" className="hover:text-emerald-600">Үлдэгдэл</a>
              <a href="#receiving" className="hover:text-emerald-600">Орлого</a>
              <a href="#orders" className="hover:text-emerald-600">Захиалга</a>
              <a href="#reports" className="hover:text-emerald-600">Тайлан</a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
