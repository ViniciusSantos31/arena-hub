export const transformGroupMetadata = (metadata: string | null) => {
  if (!metadata) return null;

  try {
    const parsed: { description?: string } = JSON.parse(metadata);
    return parsed.description || null;
  } catch {
    return null;
  }
};
