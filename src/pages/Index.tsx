import { TennisAnalyzer } from '@/components/TennisAnalyzer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-court/5 to-tennis-ball/5">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-tennis-court">
            🎾 Analisador de Tênis Real
          </h1>
          <p className="text-xl text-muted-foreground">
            Análise completa de jogos de tênis do YouTube com IA
          </p>
        </div>
        <TennisAnalyzer />
      </div>
    </div>
  );
};

export default Index;
