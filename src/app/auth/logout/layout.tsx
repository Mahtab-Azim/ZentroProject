import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Logout | Zentro",
  description: "Logout from your account",
}

export default function LogoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}