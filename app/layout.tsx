import type {Metadata} from "next";import "./globals.css";
export const metadata:Metadata={title:"YMA Inventory",description:"Kitchen and maintenance inventory, vendors, stock, and orders.",other:{"codex-preview":"development"},icons:{icon:"/favicon.svg"}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
