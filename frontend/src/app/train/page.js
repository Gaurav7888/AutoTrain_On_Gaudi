// app/train/page.js
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles from "./train.module.css";

const tasks = [
  { id: "text-generation", name: "Text Generation" },
  { id: "text-classification", name: "Text Classification" },
  // Add more tasks as needed
];

export default function Train() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTask = searchParams.get("task") || tasks[0].id;

  const [selectedTask, setSelectedTask] = useState(initialTask);

  const handleTaskChange = (event) => {
    setSelectedTask(event.target.value);
  };

  const handleStart = () => {
    // Handle the start training logic
    console.log("Starting training for:", selectedTask);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Training Configuration</h1>
      <select
        className={styles.dropdown}
        value={selectedTask}
        onChange={handleTaskChange}
      >
        {tasks.map((task) => (
          <option key={task.id} value={task.id}>
            {task.name}
          </option>
        ))}
      </select>
      <button className="css-button" onClick={handleStart}>
        Start Training
      </button>
    </div>
  );
}
