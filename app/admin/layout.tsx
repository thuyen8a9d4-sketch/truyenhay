import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { DashboardSidebar, type SidebarItem } from "@/components/dashboard/sidebar";

const NAV_ITEMS: SidebarItem[] = [
  { href: "/admin", label: "Tổng quan", icon: "📊" },
  { href: "/admin/authors", label: "Duyệt tác giả", icon: "✅" },
  { href: "/admin/novels", label: "Duyệt truyện", icon: "📖" },
  { href: "/admin/withdrawals", label: "Duyệt rút tiền", icon: "🏦" },
  { href: "/admin/coins", label: "Cộng xu", icon: "🪙" },
  { href: "/admin/income", label: "Doanh thu", icon: "💰" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.is_admin) redirect("/");

  const switchLinks: SidebarItem[] = [{ href: "/", label: "Chế độ độc giả", icon: "📖" }];
  if (profile.is_author) {
    switchLinks.push({ href: "/author", label: "Trang tác giả", icon: "✍️" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg lg:flex-row">
      <DashboardSidebar
        title="Bảng điều khiển quản trị"
        items={NAV_ITEMS}
        switchLinks={switchLinks}
        userName={profile.display_name ?? profile.username}
      />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
