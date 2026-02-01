import { useState, useEffect, useRef, Suspense, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, Stars } from '@react-three/drei'
import * as THREE from 'three'

const LOFI_PLAYLISTS = [
  'jfKfPfyJRdk',
  'rUxyKA_-grg', 
  '4xDzrJKXOOY',
  '5qap5aO4i9A',
  'lTRiuFIWV54',
]

interface WeatherData {
  city: string
  temp: number
  condition: string
  icon: string
}

const MOCK_WEATHER: WeatherData[] = [
  { city: 'Tokyo', temp: 18, condition: 'Partly Cloudy', icon: '⛅' },
  { city: 'New York', temp: 12, condition: 'Rainy', icon: '🌧️' },
  { city: 'London', temp: 9, condition: 'Foggy', icon: '🌫️' },
  { city: 'Sydney', temp: 26, condition: 'Sunny', icon: '☀️' },
  { city: 'Paris', temp: 14, condition: 'Cloudy', icon: '☁️' },
  { city: 'Dubai', temp: 32, condition: 'Clear', icon: '🌤️' },
  { city: 'São Paulo', temp: 28, condition: 'Thunderstorm', icon: '⛈️' },
  { city: 'Moscow', temp: -2, condition: 'Snowy', icon: '❄️' },
]

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  
  const gradientTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    const gradient = ctx.createLinearGradient(0, 0, 512, 256)
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(0.3, '#16213e')
    gradient.addColorStop(0.5, '#0f3460')
    gradient.addColorStop(0.7, '#1a1a2e')
    gradient.addColorStop(1, '#0a0a0f')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 256)
    
    ctx.fillStyle = '#f59e0b22'
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const radius = Math.random() * 2 + 0.5
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    ctx.strokeStyle = '#22d3d333'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 8; i++) {
      const y = (i + 1) * 32
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(512, y)
      ctx.stroke()
    }
    for (let i = 0; i < 16; i++) {
      const x = (i + 1) * 32
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, 256)
      ctx.stroke()
    }
    
    ctx.fillStyle = '#4ade8044'
    const continents = [
      { x: 100, y: 80, w: 60, h: 50 },
      { x: 180, y: 60, w: 80, h: 70 },
      { x: 280, y: 70, w: 100, h: 80 },
      { x: 400, y: 100, w: 70, h: 60 },
      { x: 120, y: 160, w: 50, h: 60 },
      { x: 380, y: 180, w: 60, h: 40 },
    ]
    continents.forEach(c => {
      ctx.beginPath()
      ctx.ellipse(c.x, c.y, c.w / 2, c.h / 2, 0, 0, Math.PI * 2)
      ctx.fill()
    })
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])
  
  const cloudTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, 512, 256)
    
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const radius = Math.random() * 30 + 10
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.05
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.07
      cloudsRef.current.rotation.x = Math.sin(time * 0.1) * 0.02
    }
    if (atmosphereRef.current) {
      const scale = 1.15 + Math.sin(time * 0.5) * 0.02
      atmosphereRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group>
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          map={gradientTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </Sphere>
      
      <Sphere ref={cloudsRef} args={[2.02, 64, 64]}>
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.6}
          depthWrite={false}
        />
      </Sphere>
      
      <Sphere ref={atmosphereRef} args={[2.15, 64, 64]}>
        <meshBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>
      
      <Sphere args={[2.3, 32, 32]}>
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  )
}

function WeatherParticles() {
  const particlesRef = useRef<THREE.Points>(null)
  
  const particles = useMemo(() => {
    const count = 500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 2
      
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      
      const colorChoice = Math.random()
      if (colorChoice < 0.4) {
        colors[i * 3] = 0.96
        colors[i * 3 + 1] = 0.62
        colors[i * 3 + 2] = 0.04
      } else if (colorChoice < 0.7) {
        colors[i * 3] = 0.55
        colors[i * 3 + 1] = 0.36
        colors[i * 3 + 2] = 0.96
      } else {
        colors[i * 3] = 0.13
        colors[i * 3 + 1] = 0.83
        colors[i * 3 + 2] = 0.83
      }
    }
    
    return { positions, colors }
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.02
      particlesRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#f59e0b" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      <spotLight
        position={[5, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#22d3d3"
      />
      <Globe />
      <WeatherParticles />
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  )
}

function MusicPlayer({ isPlaying, onToggle }: { isPlaying: boolean; onToggle: () => void }) {
  return (
    <div className="absolute top-6 left-6 z-20">
      <div 
        className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4 
                   shadow-2xl shadow-amber-500/10 transition-all duration-500 hover:bg-white/10
                   hover:border-amber-500/30 group"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onToggle}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 
                     flex items-center justify-center transition-all duration-300
                     hover:scale-110 hover:shadow-lg hover:shadow-amber-500/50
                     active:scale-95"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <div>
            <p className="text-xs text-amber-400/70 mono tracking-wider">NOW STREAMING</p>
            <p className="text-white/90 font-medium">Lo-Fi Radio</p>
            <div className="flex items-center gap-2 mt-1">
              {isPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400 rounded-full animate-pulse"
                      style={{
                        height: `${Math.random() * 100}%`,
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '0.5s',
                      }}
                    />
                  ))}
                </div>
              )}
              <span className="text-xs text-white/40">
                {isPlaying ? 'Playing' : 'Paused'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeatherWidget({ weather }: { weather: WeatherData }) {
  return (
    <div 
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-3 
                 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/30
                 hover:scale-105 cursor-default min-w-[140px]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-purple-400/70 mono tracking-wider">{weather.city}</p>
          <p className="text-2xl font-semibold text-white/90">{weather.temp}°</p>
          <p className="text-xs text-white/50">{weather.condition}</p>
        </div>
        <span className="text-2xl">{weather.icon}</span>
      </div>
    </div>
  )
}

function WeatherPanel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const displayCount = 4

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_WEATHER.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const visibleWeather = useMemo(() => {
    const result: WeatherData[] = []
    for (let i = 0; i < displayCount; i++) {
      result.push(MOCK_WEATHER[(currentIndex + i) % MOCK_WEATHER.length])
    }
    return result
  }, [currentIndex])

  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="space-y-3">
        <div className="text-right mb-4">
          <p className="text-xs text-cyan-400/70 mono tracking-widest">GLOBAL WEATHER</p>
          <p className="text-white/60 text-sm">Live conditions worldwide</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {visibleWeather.map((w, i) => (
            <div
              key={`${w.city}-${currentIndex}-${i}`}
              className="animate-fadeIn"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <WeatherWidget weather={w} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TimeDisplay() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="absolute bottom-24 left-6 z-20">
      <div className="mono">
        <p className="text-6xl font-bold text-white/90 tracking-tight">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </p>
        <p className="text-sm text-amber-400/60 tracking-widest mt-1">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  )
}

function CenterTitle() {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-center pointer-events-none select-none">
      <h1 
        className="text-7xl md:text-8xl font-light tracking-tighter text-white/10"
        style={{ textShadow: '0 0 80px rgba(245, 158, 11, 0.3)' }}
      >
        EARTH
      </h1>
      <p className="text-white/20 mono tracking-[0.5em] text-sm mt-2">VIBES</p>
    </div>
  )
}

function YouTubeEmbed({ videoId, isPlaying }: { videoId: string; isPlaying: boolean }) {
  return (
    <div className="fixed top-0 left-0 w-0 h-0 overflow-hidden">
      <iframe
        width="1"
        height="1"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=${isPlaying ? 1 : 0}&loop=1&playlist=${videoId}&controls=0`}
        allow="autoplay; encrypted-media"
        title="Lo-Fi Music"
      />
    </div>
  )
}

function StartOverlay({ onStart }: { onStart: () => void }) {
  return (
    <div 
      className="fixed inset-0 z-50 bg-[#0a0a0f] flex items-center justify-center cursor-pointer"
      onClick={onStart}
    >
      <div className="text-center animate-pulse">
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 
                      border border-white/10 flex items-center justify-center
                      hover:scale-110 transition-transform duration-500">
          <svg className="w-16 h-16 text-amber-400 ml-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <h2 className="text-3xl text-white/90 font-light tracking-wide">Enter the Vibe</h2>
        <p className="text-white/40 mt-2 mono text-sm">Click anywhere to start</p>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="absolute bottom-4 left-0 right-0 z-20 text-center">
      <p className="text-white/20 text-xs mono tracking-wider">
        Requested by <span className="text-amber-500/40">@JolupCCTV</span> · Built by <span className="text-purple-400/40">@clonkbot</span>
      </p>
    </footer>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playlistId] = useState(() => 
    LOFI_PLAYLISTS[Math.floor(Math.random() * LOFI_PLAYLISTS.length)]
  )

  const handleStart = () => {
    setStarted(true)
    setIsPlaying(true)
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
      
      {!started && <StartOverlay onStart={handleStart} />}
      
      <YouTubeEmbed videoId={playlistId} isPlaying={isPlaying} />
      
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      
      <CenterTitle />
      <MusicPlayer isPlaying={isPlaying} onToggle={() => setIsPlaying(!isPlaying)} />
      <WeatherPanel />
      <TimeDisplay />
      <Footer />
    </div>
  )
}