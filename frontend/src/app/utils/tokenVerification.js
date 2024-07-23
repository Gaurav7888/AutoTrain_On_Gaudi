export async function verifyToken(token) {
  const url = process.env.SERVER_URL; // Replace with your actual verification endpoint

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    throw new Error("Token verification failed");
  }

  const data = await response.json();
  if (!data.valid) {
    throw new Error("Invalid or expired token");
  }

  return data;
}
