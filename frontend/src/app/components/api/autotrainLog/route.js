export const logs = async () => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  try {
    const response = await fetch(`${serverUrl}/logs`);
    if (!response.ok) {
      throw new Error(`Failed to retrieve logs: ${response.statusText}`);
    }
    console.info("Successfully fetched logs");
    return await response.json();
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
};
