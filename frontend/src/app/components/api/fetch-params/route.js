export const fetchParams = async (task, param_type) => {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_UI_URL;
  // const serverUrl = "http://127.0.0.1:8080/ui";

  if (!serverUrl) {
    throw new Error("Server URL not defined");
  }

  if (!task || !param_type) {
    throw new Error("Task and param_type must be defined");
  }

  try {
    const response = await fetch(
      `${serverUrl}/params/${task}/${param_type}`
      // `${serverUrl}/version`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch params for task ${task} and param_type ${param_type}: ${response.statusText}`
      );
    }
    console.info(
      `Successfully fetched params for task ${task} and param_type ${param_type}`
    );

    const data = await response.json();

    console.log("response data from /ui/fetch_params: ", data);
    return data;
  } catch (error) {
    console.error(
      `Error fetching params for task ${task} and param_type ${param_type}:`,
      error
    );
    throw error;
  }
};
