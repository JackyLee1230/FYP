import WebToolbar from './Toolbar'

type LayoutProps = {
    children: React.ReactNode;
}
 
export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <WebToolbar />
      <main>{children}</main>
    </>
  )
}