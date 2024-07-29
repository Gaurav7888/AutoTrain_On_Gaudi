export const stopTraining = async () => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  try {
    const response = await fetch(`${serverUrl}/stop_training`);
    if (!response.ok) {
      throw new Error(`Failed to stop training: ${response.statusText}`);
    }
    console.info(`Successfully stopped training`);
    return await response.json();
  } catch (error) {
    console.error(`Error trying to stop training:`, error);
    throw error;
  }
};
