// app/page.js
"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

const tasks = [
  { id: "text-generation", name: "Text Generation" },
  { id: "text-classification", name: "Text Classification" },
  // Add more tasks as needed
];

export default function Home() {
  const router = useRouter();

  const handleCardClick = (taskId) => {
    router.push(`/train?task=${taskId}`);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select a Task</h1>
      <div className={styles.cardContainer}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={styles.card}
            onClick={() => handleCardClick(task.id)}
          >
            {task.name}
          </div>
        ))}
      </div>
    </div>
  );
}
