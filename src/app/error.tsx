'use client';
export default function CustomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Algo deu errado!</h2>
      <button type="button" onClick={() => reset()}>
        Tentar novamente
      </button>
      <pre>{error.message}</pre>
      {error.digest && <pre>{error.digest}</pre>}
    </div>
  );
}
