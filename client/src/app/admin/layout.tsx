// app/admin/layout.tsx
import "../globals.css";

export const metadata = {
  title: "Admin - Sebeta Mart",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body bg-gray-100">
        {children}
      </body>
    </html>
  );
}
