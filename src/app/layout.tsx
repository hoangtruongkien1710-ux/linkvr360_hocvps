import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quản lý tour VR360',
  description: 'Quản trị tour VR360 và chi nhánh',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
