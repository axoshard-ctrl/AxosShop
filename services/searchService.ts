export class SearchService {
  // Simple Levenshtein distance for typo correction
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[b.length][a.length];
  }

  static getDidYouMean(query: string, products: string[]): string | null {
    const threshold = 3;
    let closest = { word: '', distance: threshold };

    products.forEach(product => {
      const distance = this.levenshteinDistance(
        query.toLowerCase(),
        product.toLowerCase()
      );
      if (distance < closest.distance) {
        closest = { word: product, distance };
      }
    });

    return closest.distance < threshold ? closest.word : null;
  }

  static getAutocompleteSuggestions(
    query: string,
    products: string[]
  ): string[] {
    const lowerQuery = query.toLowerCase();
    return products
      .filter(p => p.toLowerCase().startsWith(lowerQuery))
      .slice(0, 5);
  }
}
