export function preloadImages(paths: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(
    paths.map((path) => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
        img.src = path;
      });
    }),
  );
}
