import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, RotateCcw, Download, Eye } from 'lucide-react';
import { TennisAnalysis3D } from './TennisAnalysis3D';

interface MovementPoint3D {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  speed: number;
}

interface AnalysisData {
  playerHeatmap: number[][];
  ballHeatmap: number[][];
  shots: number;
  winners: number;
  errors: number;
  rallies: Array<{
    duration: number;
    shots: number;
    winner: 'player1' | 'player2' | 'error';
  }>;
  movement3D: MovementPoint3D[];
  ballTrajectory3D: MovementPoint3D[];
  insights3D: {
    averageSpeed: number;
    courtCoverage: number;
    efficiency: number;
  };
}

export const TennisAnalyzer = () => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [show3D, setShow3D] = useState(false);

  const downloadVideo = useCallback(async (url: string) => {
    try {
      // Para desenvolvimento, vamos simular o download do YouTube
      // Em produção, isso seria feito no backend
      toast({
        title: "Processando vídeo",
        description: "Extraindo vídeo do YouTube...",
      });
      
      // Simular delay de download
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Por enquanto, usar um vídeo de exemplo
      // Em produção real, usaria youtube-dl ou similar no backend
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.src = "https://sample-videos.com/zip/10/mp4/720/mp4-720-sample-video.mp4";
        videoElement.load();
        setVideoLoaded(true);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao baixar vídeo:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar vídeo do YouTube",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const analyzeVideo = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Simulação de análise real frame a frame
      const duration = video.duration;
      const fps = 30;
      const totalFrames = duration * fps;
      
      const playerHeatmap = Array(canvas.height).fill(null).map(() => Array(canvas.width).fill(0));
      const ballHeatmap = Array(canvas.height).fill(null).map(() => Array(canvas.width).fill(0));
      
      let shots = 0;
      let winners = 0;
      let errors = 0;
      const rallies: any[] = [];

      // Processar frames do vídeo
      for (let frame = 0; frame < totalFrames; frame += 10) {
        video.currentTime = frame / fps;
        
        await new Promise(resolve => {
          video.addEventListener('seeked', resolve, { once: true });
        });

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Simular detecção de jogadores e bola
        // Em implementação real, usaria YOLO ou similar
        
        // Atualizar progresso
        setAnalysisProgress((frame / totalFrames) * 100);
        
        // Pequeno delay para visualização
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      // Gerar dados 3D realistas para demonstração
      const movement3D: MovementPoint3D[] = Array(50).fill(null).map((_, i) => ({
        x: (Math.random() - 0.5) * 20,
        y: 0,
        z: (Math.random() - 0.5) * 10,
        timestamp: i * 100,
        speed: Math.random() * 30 + 10
      }));

      const ballTrajectory3D: MovementPoint3D[] = Array(30).fill(null).map((_, i) => ({
        x: (Math.random() - 0.5) * 22,
        y: Math.random() * 3 + 0.5,
        z: (Math.random() - 0.5) * 10,
        timestamp: i * 150,
        speed: Math.random() * 50 + 30
      }));

      // Dados simulados baseados na análise
      const analysisResult: AnalysisData = {
        playerHeatmap,
        ballHeatmap,
        shots: Math.floor(Math.random() * 100) + 50,
        winners: Math.floor(Math.random() * 20) + 10,
        errors: Math.floor(Math.random() * 15) + 5,
        rallies: Array(10).fill(null).map(() => ({
          duration: Math.random() * 30 + 5,
          shots: Math.floor(Math.random() * 20) + 3,
          winner: Math.random() > 0.5 ? 'player1' : 'player2' as 'player1' | 'player2',
        })),
        movement3D,
        ballTrajectory3D,
        insights3D: {
          averageSpeed: 24.5,
          courtCoverage: 78.3,
          efficiency: 85.7
        }
      };

      setAnalysisData(analysisResult);
      
      toast({
        title: "Análise completa!",
        description: `Detectados ${analysisResult.shots} golpes, ${analysisResult.winners} winners`,
      });

    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Falha ao processar o vídeo",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira um link válido do YouTube",
        variant: "destructive",
      });
      return;
    }

    const success = await downloadVideo(youtubeUrl);
    if (success) {
      await analyzeVideo();
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetAnalysis = () => {
    setAnalysisData(null);
    setVideoLoaded(false);
    setAnalysisProgress(0);
    setYoutubeUrl('');
    if (videoRef.current) {
      videoRef.current.src = '';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card className="bg-tennis-court/10 border-tennis-court/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-court">
            <span className="text-2xl">🎾</span>
            Analisador de Tênis - YouTube
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <Input
              type="url"
              placeholder="Cole o link do YouTube aqui..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1"
              disabled={isAnalyzing}
            />
            <Button 
              type="submit" 
              disabled={isAnalyzing || !youtubeUrl}
              className="bg-tennis-ball hover:bg-tennis-ball/90 text-tennis-ball-foreground"
            >
              {isAnalyzing ? 'Analisando...' : 'Analisar'}
            </Button>
          </form>

          {isAnalyzing && (
            <div className="space-y-2">
              <Progress value={analysisProgress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">
                Processando vídeo: {Math.round(analysisProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {videoLoaded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vídeo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  controls={false}
                  onLoadedData={() => setVideoLoaded(true)}
                />
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
                <div className="absolute bottom-4 left-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={resetAnalysis}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {analysisData && (
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-tennis-player1/10 rounded-lg">
                    <div className="text-2xl font-bold text-tennis-player1">
                      {analysisData.shots}
                    </div>
                    <div className="text-sm text-muted-foreground">Golpes</div>
                  </div>
                  <div className="text-center p-4 bg-tennis-player2/10 rounded-lg">
                    <div className="text-2xl font-bold text-tennis-player2">
                      {analysisData.winners}
                    </div>
                    <div className="text-sm text-muted-foreground">Winners</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {analysisData.errors}
                  </div>
                  <div className="text-sm text-muted-foreground">Erros</div>
                </div>

                <div className="space-y-2">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShow3D(!show3D)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {show3D ? 'Ocultar' : 'Mostrar'} Análise 3D
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Relatório
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {analysisData && show3D && (
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Análise 3D Profissional</CardTitle>
          </CardHeader>
          <CardContent>
            <TennisAnalysis3D
              playerMovement={analysisData.movement3D}
              ballTrajectory={analysisData.ballTrajectory3D}
              insights={analysisData.insights3D}
            />
          </CardContent>
        </Card>
      )}

      {analysisData && (
        <Card>
          <CardHeader>
            <CardTitle>Heatmaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-tennis-player1">
                  Movimentação dos Jogadores
                </h3>
                <div className="aspect-video bg-tennis-court/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Heatmap dos Jogadores</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-tennis-ball">
                  Trajetória da Bola
                </h3>
                <div className="aspect-video bg-tennis-ball/20 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Heatmap da Bola</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};