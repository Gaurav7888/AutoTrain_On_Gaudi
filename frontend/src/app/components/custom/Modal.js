const Modal = ({ id, isOpen, onClose, children }) => (
  <div
    id={id}
    tabIndex="-1"
    className={`overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full ${
      isOpen ? "" : "hidden"
    }`}
  >
    <div className="relative p-4 w-full max-w-md max-h-full">
      <div className="relative bg-white rounded-lg shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
        >
          <svg
            className="w-3 h-3"
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
        <div className="p-4 md:p-5 text-center">
          <h3 className="mb-5 text-sm font-normal text-gray-800">{children}</h3>
        </div>
      </div>
    </div>
  </div>
);

const FinalModal = ({ isOpen, onClose, message }) => (
  <Modal id="final-modal" isOpen={isOpen} onClose={onClose}>
    {message}
  </Modal>
);

const HelpModal = ({ isOpen, onClose, content }) => (
  <Modal id="help-modal" isOpen={isOpen} onClose={onClose}>
    {content}
  </Modal>
);

export default { FinalModal, HelpModal };
