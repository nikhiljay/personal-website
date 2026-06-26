import "./kavi.css";

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
      <link
        rel="preload"
        href="/fonts/sohne-subset-0.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
