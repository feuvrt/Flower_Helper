import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toast, type ToastMessage } from './Toast';

type LayoutProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut: () => void;
  toasts: ToastMessage[];
};

export const Layout = ({ theme, onToggleTheme, userEmail, onSignOut, toasts }: LayoutProps) => (
  <div className="app-shell">
    <Header theme={theme} onToggleTheme={onToggleTheme} userEmail={userEmail} onSignOut={onSignOut} />
    <main className="main">
      <Outlet />
    </main>
    <Toast messages={toasts} />
  </div>
);
