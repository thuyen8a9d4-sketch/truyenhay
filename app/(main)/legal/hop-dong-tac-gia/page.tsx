import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hợp đồng điện tử dành cho tác giả | VanThu",
};

export default function AuthorContractPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-text">
        Hợp đồng điện tử dành cho tác giả VanThu
      </h1>

      <div className="flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
        <p>
          Bằng việc tick chọn đồng ý và đăng truyện lên nền tảng VanThu, bạn (&quot;Tác giả&quot;)
          xác nhận và cam kết những điều sau:
        </p>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          <li>
            Nội dung đăng tải là do chính bạn sáng tác hoặc bạn có đầy đủ quyền hợp pháp để đăng
            tải, không vi phạm quyền tác giả của bất kỳ bên thứ ba nào.
          </li>
          <li>
            Nội dung không vi phạm pháp luật Việt Nam hiện hành, bao gồm nhưng không giới hạn ở
            các quy định về nội dung bị cấm, thuần phong mỹ tục và an ninh trật tự.
          </li>
          <li>
            Mọi truyện đăng tải sẽ được quản trị viên VanThu xem xét và duyệt trước khi hiển thị
            công khai trên nền tảng.
          </li>
          <li>
            Đối với các chương thu phí bằng xu, bạn đồng ý với tỉ lệ chia doanh thu 60% cho tác
            giả và 40% cho nền tảng, theo quy tắc giá xu hiện hành của VanThu.
          </li>
          <li>
            Bạn chịu trách nhiệm về mọi khiếu nại phát sinh liên quan đến bản quyền hoặc nội dung
            do bạn đăng tải.
          </li>
          <li>
            VanThu có quyền gỡ bỏ nội dung vi phạm hoặc từ chối duyệt truyện mà không cần báo
            trước, và có thể thu hồi quyền tác giả nếu phát hiện vi phạm nghiêm trọng.
          </li>
        </ol>
        <p>
          Thời điểm bạn tick đồng ý được ghi nhận lại trong hệ thống như bằng chứng chấp thuận
          hợp đồng này.
        </p>
      </div>
    </div>
  );
}
