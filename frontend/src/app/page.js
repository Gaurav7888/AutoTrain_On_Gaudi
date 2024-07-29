// app/page.js
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

const tasks = [
  { id: "text-generation", name: "Text Generation" },
  { id: "text-classification", name: "Text Classification" },
  // Add more tasks as needed
];

export default function Home() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState(tasks[0].id);

  const handleTaskChange = (e) => {
    setSelectedTask(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/train?task=${selectedTask}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select Task</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Task:
          <select
            name="task"
            value={selectedTask}
            onChange={handleTaskChange}
            required
          >
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Next</button>
      </form>
    </div>
  );
}
