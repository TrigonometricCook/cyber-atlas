import Navbar from "@/src/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100"> {/* static Tailwind class */}
        <Navbar /> {/* client component */}
        <main>{children}</main>
      </body>
    </html>
  );
}
