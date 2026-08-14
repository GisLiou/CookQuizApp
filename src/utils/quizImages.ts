const modules = import.meta.glob('../images/*.png', { eager: true, import: 'default' }) as Record<string, string>;

const quizImages: Record<string, string> = {};
for (const path in modules) {
  const filename = path.split('/').pop() as string;
  quizImages[filename] = modules[path];
}

export default quizImages;