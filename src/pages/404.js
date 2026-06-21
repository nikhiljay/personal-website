import * as React from "react";

import Layout from "../components/layout";
import Seo from "../components/seo";

const NotFoundPage = () => (
  <Layout>
    <Seo title="404: Not found" />
    <p className="text-[15px] leading-[1.7] text-muted">Page not found.</p>
    <a href="/" className="site-link mt-6 inline-block text-[15px]">
      Go home
    </a>
  </Layout>
);

export default NotFoundPage;
