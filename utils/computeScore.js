function computeScore(lost, found) {
  let score = 0;

  if (lost.category === found.category) score += 40;
  if (lost.location === found.location) score += 20;

  if (lost.color && found.description?.includes(lost.color)) {
    score += 10;
  }

  const lostWords = lost.description?.toLowerCase().split(" ") || [];
  const foundWords = found.description?.toLowerCase().split(" ") || [];

  score += lostWords.filter(w => foundWords.includes(w)).length * 5;

  return score;
}
