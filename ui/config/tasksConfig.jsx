export const tasksOpts = [
  {
    category: "LLM",
    color: "#023e8a",
    options: [
      {
        value: "llm:sft",
        label: "Supervised Fine Tuning",
        borderColor: "#0077b6",
        enabled: false,
      },
    ],
  },
  {
    category: "Text",
    color: "#015b9f",
    options: [
      {
        value: "text-classification",
        label: "Text Classification",
        borderColor: "#00b4d8",
        enabled: true,
      },
    ],
  },
  {
    category: "Audio",
    color: "#0077b6",
    options: [
      {
        value: "audio-classification",
        label: "Audio Classification",
        borderColor: "#48cae4",
        enabled: false,
      },
    ],
  },
  {
    category: "Image",
    color: "#0096c7",
    options: [
      {
        value: "image-generation",
        label: "Image Generation",
        borderColor: "#ade8f4",
        enabled: false,
      },
    ],
  },
];
