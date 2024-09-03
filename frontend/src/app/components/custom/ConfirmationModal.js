const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => (
  <div
    id="confirmation-modal"
    tabIndex="-1"
    className={`fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50 ${
      isOpen ? "" : "hidden"
    }`}
  >
    <div className="relative w-full max-w-md p-4">
      <div className="relative bg-white rounded-lg shadow-2xl">
        <div className="p-6 text-center">
          <h3 className="mb-5 text-lg font-medium text-gray-900">
            AutoTrain is a paid offering and you will be charged for this
            action. You can ignore this message if you are running AutoTrain on
            local hardware. Are you sure you want to continue?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onConfirm}
              className="confirm text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 focus:outline-none"
            >
              Yes, I'm sure
            </button>
            <button
              onClick={onCancel}
              className="cancel text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:ring-gray-300 rounded-lg text-sm font-medium px-5 py-2.5 focus:outline-none"
            >
              No, cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ConfirmationModal;
