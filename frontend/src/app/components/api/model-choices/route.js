export const modelChoices = async (task) => {
  const serverUrl = process.env.SERVER_URL;

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  if (!task) {
    throw new Error("Task must be defined");
  }

  try {
    const response = await fetch(`${serverUrl}/model_choices?task=${task}`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch model choices for task ${task}: ${response.statusText}`
      );
    }
    console.info(`Successfully fetched model choices for task ${task}`);
    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching params for task ${task} and param_type ${param_type}:`,
      error
    );
    throw error;
  }
};
