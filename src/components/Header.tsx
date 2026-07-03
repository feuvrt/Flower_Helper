import { NavLink } from 'react-router-dom';

type HeaderProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export const Header = ({ theme, onToggleTheme }: HeaderProps) => (
  <header className="header">
    <NavLink className="brand" to="/">
      <span className="brand__mark">🌿</span>
      <span>PlantCare</span>
    </NavLink>
    <nav className="nav" aria-label="Основная навигация">
      <NavLink to="/">Главная</NavLink>
      <NavLink to="/catalog">Справочник</NavLink>
      <NavLink to="/favorites">Избранное</NavLink>
      <NavLink to="/collection">Моя коллекция</NavLink>
    </nav>
    <button className="theme-toggle" type="button" onClick={onToggleTheme}>
      {theme === 'dark' ? '☀️ Светлая' : '🌙 Тёмная'}
    </button>
  </header>
);
