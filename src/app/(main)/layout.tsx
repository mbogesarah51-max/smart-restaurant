import { UserProvider } from "@/context/user-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}
