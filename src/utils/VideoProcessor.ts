import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface DetectionResult {
  bbox: [number, number, number, number];
  score: number;
  label: string;
}

export interface TennisAnalysis {
  frame: number;
  timestamp: number;
  players: DetectionResult[];
  ball: DetectionResult | null;
  court: DetectionResult | null;
}

export class VideoProcessor {
  private objectDetector: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Inicializando detector de objetos...');
      this.objectDetector = await pipeline(
        'object-detection',
        'Xenova/yolov9-c',
        { device: 'webgpu' }
      );
      this.initialized = true;
      console.log('Detector inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar detector:', error);
      throw error;
    }
  }

  async processFrame(
    canvas: HTMLCanvasElement,
    frameNumber: number,
    timestamp: number
  ): Promise<TennisAnalysis> {
    if (!this.initialized) {
      throw new Error('Processor not initialized');
    }

    try {
      // Detectar objetos no frame
      const detections = await this.objectDetector(canvas);
      
      // Filtrar e classificar detecções
      const players: DetectionResult[] = [];
      let ball: DetectionResult | null = null;
      let court: DetectionResult | null = null;

      for (const detection of detections) {
        const { box, score, label } = detection;
        
        if (score < 0.5) continue; // Filtrar detecções com baixa confiança
        
        const bbox: [number, number, number, number] = [
          box.xmin,
          box.ymin,
          box.xmax,
          box.ymax
        ];

        const result: DetectionResult = {
          bbox,
          score,
          label
        };

        // Classificar por tipo de objeto
        if (label === 'person') {
          players.push(result);
        } else if (label === 'sports ball' || this.isBallLike(result)) {
          if (!ball || score > ball.score) {
            ball = result;
          }
        } else if (this.isCourtLike(result)) {
          if (!court || score > court.score) {
            court = result;
          }
        }
      }

      return {
        frame: frameNumber,
        timestamp,
        players: players.slice(0, 2), // Máximo 2 jogadores
        ball,
        court
      };
    } catch (error) {
      console.error('Erro ao processar frame:', error);
      throw error;
    }
  }

  private isBallLike(result: DetectionResult): boolean {
    const [x1, y1, x2, y2] = result.bbox;
    const width = x2 - x1;
    const height = y2 - y1;
    const area = width * height;
    
    // Bola de tênis deve ser pequena e aproximadamente circular
    return area < 2000 && Math.abs(width - height) < Math.min(width, height) * 0.5;
  }

  private isCourtLike(result: DetectionResult): boolean {
    const [x1, y1, x2, y2] = result.bbox;
    const width = x2 - x1;
    const height = y2 - y1;
    const area = width * height;
    
    // Quadra deve ser grande e retangular
    return area > 50000 && width > height * 1.5;
  }

  async processVideo(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onProgress?: (progress: number) => void,
    onFrame?: (analysis: TennisAnalysis) => void
  ): Promise<TennisAnalysis[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const duration = video.duration;
    const fps = 30;
    const frameInterval = 1 / fps;
    const results: TennisAnalysis[] = [];

    let currentTime = 0;
    let frameNumber = 0;

    while (currentTime < duration) {
      video.currentTime = currentTime;
      
      // Esperar o frame carregar
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      // Desenhar frame no canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // Processar frame
        const analysis = await this.processFrame(canvas, frameNumber, currentTime);
        results.push(analysis);
        
        if (onFrame) {
          onFrame(analysis);
        }
      } catch (error) {
        console.error(`Erro no frame ${frameNumber}:`, error);
      }

      // Atualizar progresso
      const progress = (currentTime / duration) * 100;
      if (onProgress) {
        onProgress(progress);
      }

      currentTime += frameInterval * 5; // Processar a cada 5 frames para performance
      frameNumber++;
    }

    return results;
  }

  generateHeatmap(
    analyses: TennisAnalysis[],
    width: number,
    height: number,
    type: 'players' | 'ball'
  ): number[][] {
    const heatmap = Array(height).fill(null).map(() => Array(width).fill(0));

    for (const analysis of analyses) {
      if (type === 'players') {
        for (const player of analysis.players) {
          const [x1, y1, x2, y2] = player.bbox;
          const centerX = Math.floor((x1 + x2) / 2);
          const centerY = Math.floor((y1 + y2) / 2);
          
          if (centerX >= 0 && centerX < width && centerY >= 0 && centerY < height) {
            heatmap[centerY][centerX] += 1;
          }
        }
      } else if (type === 'ball' && analysis.ball) {
        const [x1, y1, x2, y2] = analysis.ball.bbox;
        const centerX = Math.floor((x1 + x2) / 2);
        const centerY = Math.floor((y1 + y2) / 2);
        
        if (centerX >= 0 && centerX < width && centerY >= 0 && centerY < height) {
          heatmap[centerY][centerX] += 1;
        }
      }
    }

    return heatmap;
  }

  calculateStats(analyses: TennisAnalysis[]) {
    let totalShots = 0;
    let ballDetections = 0;
    let playerMovements = 0;
    
    let prevBallPosition: [number, number] | null = null;
    
    for (const analysis of analyses) {
      if (analysis.ball) {
        ballDetections++;
        const [x1, y1, x2, y2] = analysis.ball.bbox;
        const currentPos: [number, number] = [(x1 + x2) / 2, (y1 + y2) / 2];
        
        if (prevBallPosition) {
          const distance = Math.sqrt(
            Math.pow(currentPos[0] - prevBallPosition[0], 2) +
            Math.pow(currentPos[1] - prevBallPosition[1], 2)
          );
          
          // Se a bola se moveu significativamente, conta como um golpe
          if (distance > 50) {
            totalShots++;
          }
        }
        
        prevBallPosition = currentPos;
      }
      
      playerMovements += analysis.players.length;
    }

    // Estimativas baseadas nas detecções
    const winners = Math.floor(totalShots * 0.15); // ~15% winners
    const errors = Math.floor(totalShots * 0.12);   // ~12% erros
    
    return {
      shots: totalShots,
      winners,
      errors,
      ballDetections,
      playerMovements,
      averagePlayersPerFrame: playerMovements / analyses.length
    };
  }
}