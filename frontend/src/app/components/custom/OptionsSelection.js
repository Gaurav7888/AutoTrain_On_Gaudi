export const OptionsSelection = ({
  formData,
  styles,
  handleStartTraining,
  handleInputChange,
}) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Training Configuration</h1>
      <form className={styles.form}>
        <label>
          Task:
          <input
            type="text"
            name="task"
            value={formData.task}
            onChange={handleInputChange}
            required
            readOnly
          />
        </label>
        <label>
          Project Name:
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Base Model:
          <input
            type="text"
            name="baseModel"
            value={formData.baseModel}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Dataset Source:
          <input
            type="text"
            name="datasetSource"
            value={formData.datasetSource}
            onChange={handleInputChange}
            required
          />
        </label>
        {/* Add more fields as needed */}
        <button type="button" onClick={handleStartTraining}>
          Start Training
        </button>
      </form>
    </div>
  );
};
