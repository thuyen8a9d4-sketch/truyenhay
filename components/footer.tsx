export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-text-muted">
        <p className="font-semibold text-text">TruyệnHay</p>
        <p className="mt-1">
          Nền tảng đọc & đăng tiểu thuyết miễn phí do cộng đồng đóng góp nội dung.
        </p>
        <p className="mt-4">
          © {new Date().getFullYear()} TruyệnHay. Mã nguồn mở, phi lợi nhuận.
        </p>
      </div>
    </footer>
  );
}
