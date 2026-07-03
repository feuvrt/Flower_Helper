export type ToastMessage = {
  id: string;
  text: string;
  type?: 'success' | 'warning' | 'info';
};

type ToastProps = {
  messages: ToastMessage[];
};

export const Toast = ({ messages }: ToastProps) => (
  <div className="toast-list" aria-live="polite">
    {messages.map((message) => (
      <div className={`toast toast--${message.type ?? 'info'}`} key={message.id}>
        {message.text}
      </div>
    ))}
  </div>
);
