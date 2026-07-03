import { NavLink } from 'react-router-dom';
import appIcon from '../assets/app_icon.png';

type HeaderProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  userEmail?: string;
  onSignOut: () => void;
};

export const Header = ({ theme, onToggleTheme, userEmail, onSignOut }: HeaderProps) => (
  <header className="header">
    <NavLink className="brand" to="/">
      <span className="brand__mark">
        <img src={appIcon} alt="" aria-hidden="true" />
      </span>
      <span>PlantCare</span>
    </NavLink>
    <nav className="nav" aria-label="Основная навигация">
      <NavLink to="/">Главная</NavLink>
      <NavLink to="/catalog">Справочник</NavLink>
      <NavLink to="/recommendations">Подбор</NavLink>
      <NavLink to="/identify">Распознавание</NavLink>
      <NavLink to="/favorites">Избранное</NavLink>
      <NavLink to="/collection">Моя коллекция</NavLink>
    </nav>
    <div className="auth-header">
      {userEmail ? (
        <>
          <span className="auth-header__email">{userEmail}</span>
          <button className="button button--secondary button--small" type="button" onClick={onSignOut}>
            Выйти
          </button>
        </>
      ) : (
        <NavLink className="button button--secondary button--small" to="/auth">
          Войти
        </NavLink>
      )}
    </div>
    <button className="theme-toggle" type="button" onClick={onToggleTheme} aria-label="Переключить тему" title="Переключить тему">
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  </header>
);
