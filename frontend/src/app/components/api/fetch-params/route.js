export const fetchParams = async (task, param_type) => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  if (!task || !param_type) {
    throw new Error("Task and param_type must be defined");
  }

  try {
    const response = await fetch(
      `${serverUrl}/params?task=${task}&param_type=${param_type}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch params for task ${task} and param_type ${param_type}: ${response.statusText}`
      );
    }
    console.info(
      `Successfully fetched params for task ${task} and param_type ${param_type}`
    );
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching params for task ${task} and param_type ${param_type}:`,
      error
    );
    throw error;
  }
};
