import Link from "next/link";
import Image from "next/image";

export default function Sidebar({
  validUsers,
  enableLocal,
  enableNgc,
  enableNvcf,
  version,
}) {
  return (
    <aside
      id="separator-sidebar"
      className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50">
        <Link
          href="https://huggingface.co/autotrain"
          target="_blank"
          className="flex items-center ps-2.5 mb-5"
        >
          <Image
            src="https://raw.githubusercontent.com/huggingface/autotrain-advanced/main/static/logo.png"
            className="h-6 me-3 sm:h-7"
            alt="AutoTrain Logo"
            width={24}
            height={24}
          />
        </Link>
        <hr className="mb-2" />
        <ul className="space-y-2 font-medium">
          <li>
            <label
              htmlFor="autotrain_user"
              className="text-sm font-medium text-gray-700"
            >
              Hugging Face User
              <button
                type="button"
                id="autotrain_user_info"
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-info-circle"></i>
              </button>
            </label>
            <select
              name="autotrain_user"
              id="autotrain_user"
              className="mt-1 block w-full border border-gray-300 px-3 py-2 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {validUsers.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </li>
          <li>
            <label htmlFor="task" className="text-sm font-medium text-gray-700">
              Task
              <button
                type="button"
                id="task_info"
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-info-circle"></i>
              </button>
            </label>
            <select
              id="task"
              name="task"
              className="mt-1 block w-full border border-gray-300 px-3 py-2 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <optgroup label="LLM Finetuning">
                <option value="llm:sft">LLM SFT</option>
                <option value="llm:orpo">LLM ORPO</option>
                <option value="llm:generic">LLM Generic</option>
                <option value="llm:dpo">LLM DPO</option>
                <option value="llm:reward">LLM Reward</option>
              </optgroup>
              {/* Add other optgroups and options here */}
            </select>
          </li>
          <li>
            <label
              htmlFor="hardware"
              className="text-sm font-medium text-gray-700"
            >
              Hardware
              <button
                type="button"
                id="hardware_info"
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-info-circle"></i>
              </button>
            </label>
            <select
              id="hardware"
              name="hardware"
              className="mt-1 block w-full border border-gray-300 px-3 py-2 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {enableLocal === 1 && (
                <option value="local-ui">Local/Space</option>
              )}
              {enableLocal === 0 && enableNgc === 0 && enableNvcf === 0 && (
                <>
                  <optgroup label="Hugging Face Spaces">
                    <option value="spaces-a10g-large">1xA10G Large</option>
                    {/* Add other Hugging Face Spaces options */}
                  </optgroup>
                  <optgroup label="Hugging Face Endpoints">
                    <option value="ep-aws-useast1-m">1xA10G</option>
                    {/* Add other Hugging Face Endpoints options */}
                  </optgroup>
                </>
              )}
              {/* Add conditions for NGC and NVCF options */}
            </select>
          </li>
          <li>
            <label
              htmlFor="parameter_mode"
              className="text-sm font-medium text-gray-700"
            >
              Parameter Mode
              <button
                type="button"
                id="parameter_mode_info"
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-info-circle"></i>
              </button>
            </label>
            <select
              id="parameter_mode"
              name="parameter_mode"
              className="mt-1 block w-full border border-gray-300 px-3 py-2 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="basic">Basic</option>
              <option value="full">Full</option>
            </select>
          </li>
        </ul>
        <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200">
          <li>
            <a
              href="#"
              id="button_logs"
              className="flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group"
            >
              <svg
                className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 group-hover:text-gray-900"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 18"
              >
                <path d="M18 0H6a2 2 0 0 0-2 2h14v12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Z" />
                <path d="M14 4H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2ZM2 16v-6h12v6H2Z" />
              </svg>
              <span className="ms-3">Logs</span>
            </a>
          </li>
          {/* Add other list items for Documentation, FAQs, and GitHub Repo */}
        </ul>
        <ul className="pt-4 mt-4 space-y-2 font-medium border-t border-gray-200">
          <div className="block text-xs text-gray-400 text-center">
            {version}
          </div>
        </ul>
      </div>
    </aside>
  );
}
