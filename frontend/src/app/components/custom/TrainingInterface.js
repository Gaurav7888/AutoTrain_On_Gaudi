import React, { useState, useEffect } from "react";

const TrainingInterface = () => {
  const [isModelTraining, setIsModelTraining] = useState(false);
  const [showJsonParameters, setShowJsonParameters] = useState(false);
  const [baseModelCustom, setBaseModelCustom] = useState(false);
  const [datasetSource, setDatasetSource] = useState("local");

  useEffect(() => {
    // Fetch initial data
    fetchAccelerators();
    fetchTrainingStatus();
    fetchBaseModels();
  }, []);

  const fetchAccelerators = () => {
    // Implement fetching accelerators
  };

  const fetchTrainingStatus = () => {
    // Implement fetching training status
  };

  const fetchBaseModels = () => {
    // Implement fetching base models
  };

  const handleStartTraining = () => {
    setIsModelTraining(true);
  };

  const handleStopTraining = () => {
    setIsModelTraining(false);
  };

  return (
    <div className="p-4 sm:ml-64">
      <div className="columns-2 mb-2">
        <div>
          <p
            className="text-sm text-gray-700 font-bold text-left"
            id="num_accelerators"
          >
            Accelerators: Fetching...
          </p>
          <p
            className="text-sm text-gray-700 font-bold text-left"
            id="is_model_training"
          >
            Fetching training status...
          </p>
        </div>
        <div className="flex items-end justify-end">
          {!isModelTraining ? (
            <button
              type="button"
              onClick={handleStartTraining}
              className="px-2 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
            >
              Start Training
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStopTraining}
              className="px-2 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-700"
            >
              Stop Training
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="items-center justify-center h-24">
              <div className="w-full px-4">
                <p className="text-xl text-gray-800 mb-2 mt-2">Project Name</p>
                <input
                  type="text"
                  name="project_name"
                  id="project_name"
                  className="mt-1 block w-full border border-gray-300 px-3 py-2 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="items-center justify-center h-24">
              <div className="w-full px-4">
                <p className="text-xl text-gray-800 mb-2 mt-2">Base Model</p>
                <div className="flex items-center">
                  {baseModelCustom ? (
                    <input
                      type="text"
                      id="base_model_input"
                      className="mt-1 block w-full border py-2 px-3 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  ) : (
                    <select
                      name="base_model"
                      id="base_model"
                      className="mt-1 block w-full border py-2 px-3 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {/* Add options here */}
                    </select>
                  )}
                  <div className="flex items-center ps-4 rounded">
                    <input
                      id="base_model_checkbox"
                      type="checkbox"
                      checked={baseModelCustom}
                      onChange={() => setBaseModelCustom(!baseModelCustom)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="base_model_checkbox"
                      className="w-full py-4 ms-2 text-sm font-medium text-gray-700"
                    >
                      Custom
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="items-center justify-center h-24">
              <div className="w-full px-4">
                <p className="text-xl text-gray-800 mb-2 mt-2">
                  Dataset Source
                </p>
                <select
                  id="dataset_source"
                  name="dataset_source"
                  value={datasetSource}
                  onChange={(e) => setDatasetSource(e.target.value)}
                  className="mt-1 block w-full border py-2 px-3 border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="local">Local</option>
                  <option value="hub">Hugging Face Hub</option>
                </select>
              </div>
            </div>
            {/* Add the rest of the form elements here */}
          </div>
          <div>
            <div className="items-center justify-center h-96">
              <div className="w-full px-4">
                <p className="text-xl text-gray-800 mb-2 mt-2">Parameters</p>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    id="show-json-parameters"
                    checked={showJsonParameters}
                    onChange={() => setShowJsonParameters(!showJsonParameters)}
                  />
                  <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900">
                    JSON
                  </span>
                </label>
                {showJsonParameters ? (
                  <div id="json-parameters">
                    <textarea
                      id="params_json"
                      name="params_json"
                      placeholder="Loading..."
                    ></textarea>
                  </div>
                ) : (
                  <div id="dynamic-ui">
                    {/* Add dynamic UI elements here */}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingInterface;
