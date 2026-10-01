import { login } from '../actions';

const ERRORS: Record<string, string> = {
  invalid_credentials: 'Sai số điện thoại hoặc mật khẩu',
  not_admin: 'Tài khoản này không có quyền admin',
  session: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
  too_many_attempts: 'Thử quá nhiều lần, đợi vài phút',
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <div className="login">
      <form action={login} className="panel">
        <h1>Hợp Thầu Admin</h1>
        <p className="muted">Đăng nhập bằng tài khoản có vai trò admin (cấp bằng <code>npm run make-admin</code> trong hopthau_be).</p>
        {e && <p className="error" role="alert">{ERRORS[e] ?? 'Không đăng nhập được'}</p>}
        <label>Số điện thoại<input name="phone" required inputMode="tel" autoComplete="tel" /></label>
        <label>Mật khẩu<input name="password" type="password" required autoComplete="current-password" /></label>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}
