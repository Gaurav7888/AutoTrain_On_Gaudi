export const isModelTraining = async () => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  try {
    const response = await fetch(`${serverUrl}/is_model_training`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch no. of running jobs: ${response.statusText}`
      );
    }
    console.info(`Successfully fetched no. of running jobs`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching no. of running jobs:`, error);
    throw error;
  }
};
