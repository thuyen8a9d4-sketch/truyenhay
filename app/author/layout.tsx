import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { DashboardSidebar, type SidebarItem } from "@/components/dashboard/sidebar";

const NAV_ITEMS: SidebarItem[] = [
  { href: "/author", label: "Tổng quan", icon: "📊" },
  { href: "/author/works", label: "Truyện của tôi", icon: "📚" },
  { href: "/author/new", label: "Đăng truyện mới", icon: "✏️" },
  { href: "/author/income", label: "Thu nhập", icon: "💰" },
  { href: "/author/withdraw", label: "Rút tiền", icon: "🏦" },
  { href: "/notifications", label: "Thông báo", icon: "🔔" },
];

export default async function AuthorLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_author) redirect("/author/apply");

  const switchLinks: SidebarItem[] = [{ href: "/", label: "Chế độ độc giả", icon: "📖" }];
  if (profile.is_admin) {
    switchLinks.push({ href: "/admin", label: "Trang quản trị", icon: "🛡️" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      <DashboardSidebar
        title="Bảng điều khiển tác giả"
        items={NAV_ITEMS}
        switchLinks={switchLinks}
        userName={profile.display_name ?? profile.username}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
