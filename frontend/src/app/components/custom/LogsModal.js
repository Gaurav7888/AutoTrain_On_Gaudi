const LogsModal = ({ isOpen, onClose, logs }) => (
  <div
    id="logs-modal"
    tabIndex="-1"
    className={`fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 ${
      isOpen ? "" : "hidden"
    }`}
  >
    <div className="relative w-full max-w-5xl p-4">
      <div className="relative bg-white rounded-lg shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
        >
          <svg
            className="w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close</span>
        </button>
        <div className="p-6 md:p-8 text-center">
          <h3 className="mb-5 text-lg font-medium text-gray-900">Logs</h3>
          <div
            id="logContent"
            className="text-xs font-normal text-left overflow-y-auto max-h-[calc(100vh-400px)] border-t border-gray-200 pt-4"
          >
            {logs}
          </div>
        </div>
      </div>
    </div>
  </div>
);
