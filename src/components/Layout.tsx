import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Toast, type ToastMessage } from './Toast';

type LayoutProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  toasts: ToastMessage[];
};

export const Layout = ({ theme, onToggleTheme, toasts }: LayoutProps) => (
  <div className="app-shell">
    <Header theme={theme} onToggleTheme={onToggleTheme} />
    <main className="main">
      <Outlet />
    </main>
    <Toast messages={toasts} />
  </div>
);
