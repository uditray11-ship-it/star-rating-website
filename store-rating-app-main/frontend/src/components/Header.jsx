export default function Header({ user, onLogout }) {
  return <header><div><h2>Store Rating App</h2><span>{user.name} ({user.role})</span></div><button onClick={onLogout}>Logout</button></header>;
}
