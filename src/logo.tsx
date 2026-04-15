export default function Logo() {
  return (
    <img
      src="/logo.png"
      alt="because"
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        display: 'block',
        flexShrink: 0,
        boxShadow: '0 4px 16px rgba(219,39,119,0.3)',
      }}
    />
  );
}
