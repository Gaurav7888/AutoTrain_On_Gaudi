const LoadingSpinner = () => (
  <div
    id="loadingSpinner"
    role="status"
    className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2 flex flex-col items-center"
  >
    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-400"></div>
    <span className="sr-only mt-4 text-blue-500">Loading...</span>
  </div>
);

export default LoadingSpinner;
