import Footer from "./Footer";
import WebToolbar from "./Toolbar";

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <WebToolbar />
      <main style={{marginTop: "64px"}}>{children}</main>
      <Footer />
    </>
  );
}

