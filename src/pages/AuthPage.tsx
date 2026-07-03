import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../App';

export const AuthPage = () => {
  const { signIn, signUp, authLoading, user } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (mode: 'sign-in' | 'sign-up') => {
    setError('');
    setMessage('');

    if (!email.trim()) {
      setError('Введите email.');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не короче 6 символов.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'sign-in') {
        await signIn(email.trim(), password);
      } else {
        const info = await signUp(email.trim(), password);
        setMessage(info ?? 'Аккаунт создан. Теперь можно войти.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить действие. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack auth-page">
      <div className="page-title">
        <p className="eyebrow">аккаунт</p>
        <h1>Вход в PlantCare</h1>
        <p>После входа избранное и коллекция будут храниться в Supabase и синхронизироваться с аккаунтом.</p>
      </div>

      <section className="auth-card">
        {user ? (
          <div className="empty-state">
            <div className="empty-state__icon">🌿</div>
            <h2>Вы уже вошли</h2>
            <p>{user.email}</p>
            <Link className="button button--primary" to="/">
              На главную
            </Link>
          </div>
        ) : (
          <form className="form" onSubmit={(event) => event.preventDefault()}>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="student@example.com" />
            </label>
            <label>
              Пароль
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Минимум 6 символов" />
            </label>

            {error && <div className="warning-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <div className="form-actions">
              <button className="button button--primary" type="button" disabled={isSubmitting || authLoading} onClick={() => submit('sign-in')}>
                {isSubmitting ? 'Подождите...' : 'Войти'}
              </button>
              <button className="button button--secondary" type="button" disabled={isSubmitting || authLoading} onClick={() => submit('sign-up')}>
                Зарегистрироваться
              </button>
            </div>

            <p className="helper-text">Если Supabase требует подтверждение почты, после регистрации проверьте email.</p>
          </form>
        )}
      </section>
    </div>
  );
};
