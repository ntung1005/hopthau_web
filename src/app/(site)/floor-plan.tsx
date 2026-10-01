/** Mặt bằng căn 2PN vẽ nét (minh hoạ, không phải bản vẽ thật): dùng khi chưa có ảnh. */
export function FloorPlan({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 220" role="img" aria-label="Minh hoạ mặt bằng căn hộ 2 phòng ngủ">
      <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round">
        <rect x="6" y="6" width="308" height="208" rx="4" />
        <path d="M6 116h96M102 6v84M102 116v98M196 6v120M196 150v64M102 150h94M250 126h64" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".55">
        <path d="M102 90a26 26 0 0 1 26 26M196 126a24 24 0 0 0-24 24" />
        <rect x="22" y="22" width="56" height="40" rx="4" />
        <rect x="120" y="170" width="60" height="28" rx="6" />
        <rect x="214" y="22" width="84" height="54" rx="4" />
        <path d="M214 176h84M214 188h84" />
        <circle cx="282" cy="150" r="8" />
      </g>
      <g fill="currentColor" fontSize="12" fontWeight="600" fontFamily="inherit">
        <text x="24" y="92">Phòng ngủ 1</text>
        <text x="124" y="60">Khách + bếp</text>
        <text x="216" y="104">Phòng ngủ 2</text>
        <text x="24" y="170">Ban công</text>
        <text x="258" y="200">WC</text>
      </g>
    </svg>
  );
}
