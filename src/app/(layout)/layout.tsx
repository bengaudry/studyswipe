export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="w-full max-w-screen-lg mx-auto px-6 py-6">{children}</main>
  );
}
