export type ReviewMode = "text" | "code" | "file";
export type WorkspaceView = "detect" | "history" | "comparisons" | "reports";
export type CodeLanguage = "python" | "javascript" | "typescript" | "java" | "c" | "cpp" | "csharp" | "go";

export type FileItem = {
  id: string;
  file: File;
};

export const codeLanguages: Array<{ value: CodeLanguage; label: string; extension: string }> = [
  { value: "python", label: "Python", extension: "py" },
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "java", label: "Java", extension: "java" },
  { value: "c", label: "C", extension: "c" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "csharp", label: "C#", extension: "cs" },
  { value: "go", label: "Go", extension: "go" },
];
