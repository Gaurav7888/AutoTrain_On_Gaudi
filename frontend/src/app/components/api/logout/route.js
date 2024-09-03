export const logout = async () => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  try {
    const response = await fetch(`${serverUrl}/logout`);
    if (!response.ok) {
      throw new Error(`Failed to logout: ${response.statusText}`);
    }
    console.info("Successfully logged out");
    return await response.json();
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
