import Footer from "./Footer";
import WebToolbar from "./Toolbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <WebToolbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

