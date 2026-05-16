export const MOCK_ACCOUNTS = [
  {
    username: "user",
    password: "user",
    role: "user",
    name: "Sitara Şopper",
    premium: true,
    tier: "Gold",
  },
  { username: "admin", password: "admin", role: "admin", name: "Murad Manager" },
];

export function login(username, password) {
  const u = MOCK_ACCOUNTS.find(
    (a) => a.username === username.trim().toLowerCase() && a.password === password
  );
  if (!u) throw new Error("Invalid username or password");
  return u;
}
