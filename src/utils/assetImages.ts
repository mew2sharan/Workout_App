const imageModules = import.meta.glob('../assets/images/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

const imageByFileName: Record<string, string> = Object.fromEntries(
  Object.entries(imageModules).map(([modulePath, resolvedUrl]) => {
    const fileName = modulePath.split('/').pop() || modulePath;
    return [fileName, resolvedUrl];
  })
);

/**
 * Resolves static image paths under Vite's configured base path (e.g. /your-repo-name/).
 */
export function getAssetImage(pathOrFileName: string): string {
  const fileName = pathOrFileName.split('/').pop() || pathOrFileName;
  return imageByFileName[fileName] || pathOrFileName;
}
