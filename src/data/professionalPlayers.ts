export interface ProfessionalPlayer {
  name: string;
  ranking: number;
  style: string;
  averageSpeed: number;
  courtCoverage: number;
  efficiency: number;
  strengths: string[];
  movement3D: {
    x: number;
    y: number;
    z: number;
    timestamp: number;
    speed: number;
  }[];
}

export const professionalPlayers: ProfessionalPlayer[] = [
  {
    name: "Rafael Nadal",
    ranking: 1,
    style: "Baseline Aggressive",
    averageSpeed: 28.5,
    courtCoverage: 92.3,
    efficiency: 89.7,
    strengths: ["Forehand topspin", "Court coverage", "Defensive positioning"],
    movement3D: Array(50).fill(null).map((_, i) => ({
      x: (Math.random() - 0.5) * 22,
      y: 0,
      z: (Math.random() - 0.5) * 10,
      timestamp: i * 100,
      speed: Math.random() * 10 + 25
    }))
  },
  {
    name: "Novak Djokovic",
    ranking: 2,
    style: "All Court",
    averageSpeed: 26.8,
    courtCoverage: 88.9,
    efficiency: 91.2,
    strengths: ["Return game", "Mental toughness", "Flexibility"],
    movement3D: Array(50).fill(null).map((_, i) => ({
      x: (Math.random() - 0.5) * 20,
      y: 0,
      z: (Math.random() - 0.5) * 8,
      timestamp: i * 100,
      speed: Math.random() * 8 + 24
    }))
  },
  {
    name: "Roger Federer",
    ranking: 3,
    style: "Offensive Baseline",
    averageSpeed: 25.2,
    courtCoverage: 85.1,
    efficiency: 93.5,
    strengths: ["Serve", "Net play", "Shot variety"],
    movement3D: Array(50).fill(null).map((_, i) => ({
      x: (Math.random() - 0.5) * 18,
      y: 0,
      z: (Math.random() - 0.5) * 9,
      timestamp: i * 100,
      speed: Math.random() * 12 + 20
    }))
  }
];

export const getRandomProfessionalPlayer = (): ProfessionalPlayer => {
  return professionalPlayers[Math.floor(Math.random() * professionalPlayers.length)];
};

export const compareWithProfessional = (
  playerStats: {
    averageSpeed: number;
    courtCoverage: number;
    efficiency: number;
  },
  professional: ProfessionalPlayer
) => {
  const speedDiff = professional.averageSpeed - playerStats.averageSpeed;
  const coverageDiff = professional.courtCoverage - playerStats.courtCoverage;
  const efficiencyDiff = professional.efficiency - playerStats.efficiency;

  const improvements: string[] = [];

  if (speedDiff > 2) {
    improvements.push(`Aumente a velocidade de movimento em ${speedDiff.toFixed(1)} km/h como ${professional.name}`);
  }

  if (coverageDiff > 5) {
    improvements.push(`Melhore a cobertura da quadra em ${coverageDiff.toFixed(1)}% seguindo o estilo ${professional.style}`);
  }

  if (efficiencyDiff > 3) {
    improvements.push(`Aumente a eficiência em ${efficiencyDiff.toFixed(1)}% focando em: ${professional.strengths.join(', ')}`);
  }

  return {
    professional,
    improvements,
    similarityScore: Math.max(0, 100 - Math.abs(speedDiff) - Math.abs(coverageDiff) - Math.abs(efficiencyDiff))
  };
};