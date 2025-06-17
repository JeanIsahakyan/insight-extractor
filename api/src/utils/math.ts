export const calculateCosineSimilarity1 = (a: number[], b: number[]) => {
  const dotProduct = a.reduce((acc, cur, i) => acc + cur * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((acc, cur) => acc + cur ** 2, 0));
  const magnitudeB = Math.sqrt(b.reduce((acc, cur) => acc + cur ** 2, 0));
  const magnitudeProduct = magnitudeA * magnitudeB;
  if (magnitudeProduct === 0) {
    return 0; // Prevent division by zero
  }
  return dotProduct / magnitudeProduct;
};

export function calculateCosineSimilarity(vecA: Float32Array, vecB: Float32Array): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  return dotProduct / (normA * normB);
}
