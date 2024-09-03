export const accelerators = async () => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  try {
    const response = await fetch(`${serverUrl}/accelerators`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch no. of available accelerators: ${response.statusText}`
      );
    }
    console.info(`Successfully fetched no. of available accelerators`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching no. of available accelerators:`, error);
    throw error;
  }
};
