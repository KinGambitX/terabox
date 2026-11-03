export const morph = {
  type: "spring" as const,
  duration: 0.45,
  bounce: 0.14,
};

export const fade = {
  duration: 0.22,
  ease: [0.23, 1, 0.32, 1] as const,
};

export type SkeletonProps = {
  active: boolean;
  id: string;
};
