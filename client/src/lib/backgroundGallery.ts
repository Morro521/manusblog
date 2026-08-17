export type BackgroundImage = {
  id: string;
  src: string;
  alt: string;
};

// 只放入已确认适合公开首页、低干扰且可叠加文字的素材。
export const safeBackgroundImages: readonly BackgroundImage[] = [
  {
    id: "observatory-night",
    src: "/manus-storage/observatory-night_fc4b375d.jpg",
    alt: "夜空下的天文观测台",
  },
];

export function chooseBackgroundImage(
  images: readonly BackgroundImage[] = safeBackgroundImages,
  randomValue = Math.random(),
) {
  if (images.length === 0) return undefined;
  const index = Math.min(images.length - 1, Math.floor(Math.max(0, randomValue) * images.length));
  return images[index];
}
