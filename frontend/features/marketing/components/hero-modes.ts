import { IconCode, IconFileText, IconSearch } from "@tabler/icons-react";

export const heroModes = [
  {
    id: "documents",
    label: "Documents",
    icon: IconFileText,
    title: "Research methods — literature review",
    type: "DOCX · PAGE 02",
    score: "87%",
    matchType: "Lexical overlap",
    accent: "sky",
    submitted: "A systematic approach to collecting and analysing information helps researchers answer a defined question.",
    submittedHit: "collecting and analysing information",
    matched: "A systematic process for gathering and analysing evidence helps researchers answer a clear question.",
    matchedHit: "gathering and analysing evidence",
    sources: [
      { title: "Earlier submission", detail: "Research Methods · Section A", score: "87%" },
      { title: "Open research guide", detail: "Public source · 2024", score: "74%" },
      { title: "Course reading", detail: "Research Methods · Week 02", score: "61%" },
    ],
  },
  {
    id: "code",
    label: "Source code",
    icon: IconCode,
    title: "Sorting algorithms exercise",
    type: "PYTHON · LINES 08–15",
    score: "72%",
    matchType: "Normalized tokens",
    accent: "orange",
    submitted: "def sort_items(items):\n    ordered = []\n    for value in items:\n        ordered.append(value)",
    submittedHit: "ordered.append(value)",
    matched: "def arrange(values):\n    result = []\n    for item in values:\n        result.append(item)",
    matchedHit: "result.append(item)",
    sources: [
      { title: "Earlier submission", detail: "Data Structures · Section A", score: "72%" },
      { title: "Course example", detail: "Sorting · Lab 04", score: "58%" },
      { title: "Public repository", detail: "Python · 2023", score: "41%" },
    ],
  },
  {
    id: "web",
    label: "Web sources",
    icon: IconSearch,
    title: "Research design — source comparison",
    type: "PUBLIC WEB · EXCERPT",
    score: "81%",
    matchType: "Semantic similarity",
    accent: "violet",
    submitted: "The choice of method depends on the question being asked and the kind of evidence needed.",
    submittedHit: "kind of evidence needed",
    matched: "Researchers select an approach based on the research question and required evidence.",
    matchedHit: "research question and required evidence",
    sources: [
      { title: "Open research guide", detail: "University library · 2024", score: "81%" },
      { title: "Methods handbook", detail: "Public source · Chapter 03", score: "69%" },
      { title: "Earlier submission", detail: "Research Methods · Section B", score: "52%" },
    ],
  },
] as const;

export type HeroMode = (typeof heroModes)[number];
