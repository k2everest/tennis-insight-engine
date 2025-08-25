import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line, Sphere, Box } from '@react-three/drei';
import * as THREE from 'three';

interface MovementPoint3D {
  x: number;
  y: number;
  z: number;
  timestamp: number;
  speed: number;
}

interface TennisAnalysis3DProps {
  playerMovement: MovementPoint3D[];
  ballTrajectory: MovementPoint3D[];
  insights: {
    averageSpeed: number;
    courtCoverage: number;
    efficiency: number;
  };
}

const TennisCourt = () => {
  return (
    <group>
      {/* Court Base */}
      <Box args={[23.77, 0.1, 10.97]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#2d5a3d" />
      </Box>
      
      {/* Court Lines */}
      <Line
        points={[[-11.885, 0.01, -5.485], [11.885, 0.01, -5.485], [11.885, 0.01, 5.485], [-11.885, 0.01, 5.485], [-11.885, 0.01, -5.485]]}
        color="white"
        lineWidth={2}
      />
      
      {/* Service lines */}
      <Line points={[[-6.4, 0.01, -4.115], [6.4, 0.01, -4.115]]} color="white" lineWidth={2} />
      <Line points={[[-6.4, 0.01, 4.115], [6.4, 0.01, 4.115]]} color="white" lineWidth={2} />
      
      {/* Center line */}
      <Line points={[[0, 0.01, -4.115], [0, 0.01, 4.115]]} color="white" lineWidth={2} />
      
      {/* Net */}
      <Box args={[0.1, 1.07, 12.8]} position={[0, 0.535, 0]}>
        <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
      </Box>
    </group>
  );
};

const PlayerMovementPath = ({ points, color }: { points: MovementPoint3D[], color: string }) => {
  const pathPoints = useMemo(() => {
    return points.map(p => new THREE.Vector3(p.x, p.y + 0.1, p.z));
  }, [points]);

  return (
    <group>
      {pathPoints.length > 1 && (
        <Line points={pathPoints} color={color} lineWidth={3} />
      )}
      {points.map((point, index) => (
        <Sphere key={index} args={[0.1]} position={[point.x, point.y + 0.1, point.z]}>
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.2}
          />
        </Sphere>
      ))}
    </group>
  );
};

const BallTrajectory = ({ points }: { points: MovementPoint3D[] }) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  useFrame((state) => {
    if (points.length > 0 && ballRef.current) {
      const time = state.clock.getElapsedTime();
      const index = Math.floor(time * 2) % points.length;
      setCurrentIndex(index);
      
      const point = points[index];
      ballRef.current.position.set(point.x, point.y + 0.2, point.z);
    }
  });

  const pathPoints = useMemo(() => {
    return points.map(p => new THREE.Vector3(p.x, p.y + 0.2, p.z));
  }, [points]);

  return (
    <group>
      {pathPoints.length > 1 && (
        <Line points={pathPoints} color="#ffff00" lineWidth={2} dashed />
      )}
      <Sphere ref={ballRef} args={[0.08]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={0.3} />
      </Sphere>
    </group>
  );
};

const HeatmapVisualization = ({ points }: { points: MovementPoint3D[] }) => {
  const heatmapData = useMemo(() => {
    const gridSize = 20;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    
    points.forEach(point => {
      const gridX = Math.floor((point.x + 12) * gridSize / 24);
      const gridZ = Math.floor((point.z + 6) * gridSize / 12);
      if (gridX >= 0 && gridX < gridSize && gridZ >= 0 && gridZ < gridSize) {
        grid[gridX][gridZ]++;
      }
    });
    
    return grid;
  }, [points]);

  return (
    <group>
      {heatmapData.map((row, x) =>
        row.map((intensity, z) => {
          if (intensity === 0) return null;
          const normalizedIntensity = Math.min(intensity / 10, 1);
          return (
            <Box
              key={`${x}-${z}`}
              args={[1, 0.05 + normalizedIntensity * 0.5, 1]}
              position={[
                (x - 10) * 1.2,
                (0.025 + normalizedIntensity * 0.25),
                (z - 10) * 0.6
              ]}
            >
              <meshStandardMaterial
                color={new THREE.Color().setHSL(0.7 - normalizedIntensity * 0.7, 1, 0.5)}
                transparent
                opacity={0.7}
              />
            </Box>
          );
        })
      )}
    </group>
  );
};

const Analytics3D = ({ insights }: { insights: TennisAnalysis3DProps['insights'] }) => {
  return (
    <group position={[15, 5, 0]}>
      <Text
        position={[0, 2, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Análise 3D
      </Text>
      <Text
        position={[0, 1, 0]}
        fontSize={0.5}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
      >
        Velocidade: {insights.averageSpeed.toFixed(1)} km/h
      </Text>
      <Text
        position={[0, 0, 0]}
        fontSize={0.5}
        color="#ffff00"
        anchorX="center"
        anchorY="middle"
      >
        Cobertura: {insights.courtCoverage.toFixed(1)}%
      </Text>
      <Text
        position={[0, -1, 0]}
        fontSize={0.5}
        color="#ff6600"
        anchorX="center"
        anchorY="middle"
      >
        Eficiência: {insights.efficiency.toFixed(1)}%
      </Text>
    </group>
  );
};

export const TennisAnalysis3D: React.FC<TennisAnalysis3DProps> = ({
  playerMovement,
  ballTrajectory,
  insights
}) => {
  return (
    <div className="w-full h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [25, 15, 25], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
        
        <TennisCourt />
        <HeatmapVisualization points={playerMovement} />
        <PlayerMovementPath points={playerMovement} color="#00ff88" />
        <BallTrajectory points={ballTrajectory} />
        <Analytics3D insights={insights} />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={10}
          maxDistance={50}
        />
      </Canvas>
    </div>
  );
};