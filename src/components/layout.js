import * as React from "react";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-bg">
    <main className="mx-auto max-w-[540px] px-6 py-24 sm:py-32">{children}</main>
  </div>
);

export default Layout;
