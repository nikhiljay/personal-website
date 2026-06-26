export default function KaviNycTripLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="preconnect"
        href="https://basemaps.cartocdn.com"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
