export const help = async (element_id) => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  if (!element_id) {
    throw new Error("Task and param_type must be defined");
  }

  try {
    const response = await fetch(`${serverUrl}/help?element_id=${element_id}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch help text for element_id ${element_id}: ${response.statusText}`
      );
    }
    console.info(`Successfully fetched help text for element_id ${element_id}`);
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching help text for element_id ${element_id}:`,
      error
    );
    throw error;
  }
};
