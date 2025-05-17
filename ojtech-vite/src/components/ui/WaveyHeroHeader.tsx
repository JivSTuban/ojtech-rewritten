import React, { Component, createRef } from 'react';
import { Button } from "./Button";
import { Link } from "react-router-dom";

interface HeroHeaderProps {
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
  imageSrc?: string;
  waveColor1?: string;
  waveColor2?: string;
  waveColor3?: string;
  waveColor4?: string;
  waveColor5?: string;
  waveColor6?: string;
  waveColor7?: string;
  waveColor8?: string;
  waveOpacityBase?: number;
  waveOpacityIncrement?: number;
  waveAmplitude?: number;
  waveSpeedMultiplier?: number;
}

interface HeroHeaderState {
  width: number;
  height: number;
}

const defaultProps: HeroHeaderProps = {
  title: 'Find Your Perfect <br /> Internship Match',
  subtitle: 'Our AI-powered matching connects you with relevant job opportunities that align with your skills and aspirations.',
  primaryButtonText: 'Explore Opportunities',
  primaryButtonUrl: '/opportunities',
  secondaryButtonText: 'Upload Resume',
  secondaryButtonUrl: '/profile',
  imageSrc: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
  // Pure black and gray theme colors with increasing opacity
  waveColor1: 'rgba(30, 30, 30, 0.2)',
  waveColor2: 'rgba(35, 35, 35, 0.25)',
  waveColor3: 'rgba(40, 40, 40, 0.3)',
  waveColor4: 'rgba(45, 45, 45, 0.35)',
  waveColor5: 'rgba(50, 50, 50, 0.4)',
  waveColor6: 'rgba(55, 55, 55, 0.45)',
  waveColor7: 'rgba(60, 60, 60, 0.5)',
  waveColor8: 'rgba(65, 65, 65, 0.55)',
  waveOpacityBase: 0.2,
  waveOpacityIncrement: 0.05,
  waveAmplitude: 40,
  waveSpeedMultiplier: 0.005,
};

class WaveyHeroHeader extends Component<HeroHeaderProps, HeroHeaderState> {
  private canvasRef = createRef<HTMLCanvasElement>();
  private animationFrameId: number | null = null;
  private time: number = 0;
  
  static defaultProps = defaultProps;

  constructor(props: HeroHeaderProps) {
    super(props);
    
    // Initialize with window dimensions
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const height = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    this.state = {
      width,
      height
    };
    
    this.onResize = this.onResize.bind(this);
    this.drawBackground = this.drawBackground.bind(this);
  }

  componentDidMount() {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', this.onResize);
    }
    
    // Initialize canvas with proper dimensions
    const canvas = this.canvasRef.current;
    if (canvas) {
      canvas.width = this.state.width;
      canvas.height = this.state.height;
    }
    
    // Start animation
    this.drawBackground();
  }

  componentDidUpdate(prevProps: HeroHeaderProps) {
    // Check if wave-related props have changed
    if (
      prevProps.waveColor1 !== this.props.waveColor1 ||
      prevProps.waveColor2 !== this.props.waveColor2 ||
      prevProps.waveColor3 !== this.props.waveColor3 ||
      prevProps.waveColor4 !== this.props.waveColor4 ||
      prevProps.waveColor5 !== this.props.waveColor5 ||
      prevProps.waveColor6 !== this.props.waveColor6 ||
      prevProps.waveColor7 !== this.props.waveColor7 ||
      prevProps.waveColor8 !== this.props.waveColor8 ||
      prevProps.waveOpacityBase !== this.props.waveOpacityBase ||
      prevProps.waveOpacityIncrement !== this.props.waveOpacityIncrement ||
      prevProps.waveAmplitude !== this.props.waveAmplitude ||
      prevProps.waveSpeedMultiplier !== this.props.waveSpeedMultiplier
    ) {
      // Cancel the previous animation frame
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Start a new animation
      this.drawBackground();
    }
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResize);
    }
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
    
    const canvas = this.canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }

  drawBackground() {
    const canvas = this.canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = this.state;
    
    ctx.clearRect(0, 0, width, height);

    // dark base - pure black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // flowing waves
    const {
      waveColor1,
      waveColor2,
      waveColor3,
      waveColor4,
      waveColor5,
      waveColor6,
      waveColor7,
      waveColor8,
      waveOpacityBase,
      waveOpacityIncrement,
      waveAmplitude,
      waveSpeedMultiplier
    } = this.props;
    
    const waveColors = [
      waveColor1,
      waveColor2,
      waveColor3,
      waveColor4,
      waveColor5,
      waveColor6,
      waveColor7,
      waveColor8,
    ];
    
    for (let i = 0; i < 8; i++) {
      const opacity = waveOpacityBase! + i * waveOpacityIncrement!;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin((x + this.time + i * 100) * waveSpeedMultiplier!) * waveAmplitude! + i * 20;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = waveColors[i] || `rgba(40, 40, 40, ${opacity})`;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    this.time += 1.5;
    this.animationFrameId = requestAnimationFrame(this.drawBackground);
  }

  render() {
    const {
      title,
      subtitle,
      primaryButtonText,
      primaryButtonUrl,
      secondaryButtonText,
      secondaryButtonUrl,
      imageSrc
    } = this.props;

    return (
      <div className="relative w-full h-screen overflow-hidden bg-black text-white">
        <canvas
          ref={this.canvasRef}
          className="absolute top-0 left-0 w-full h-full z-0"
          width={this.state.width}
          height={this.state.height}
        />

        <div className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 h-full">
          <div className="max-w-xl">
            <h1
              className="text-5xl font-bold leading-tight bg-gradient-to-r from-gray-500 via-gray-300 to-gray-400 text-transparent bg-clip-text animate-fade-in-up"
              dangerouslySetInnerHTML={{ __html: title! }}
            />
            <p className="mt-6 text-lg text-gray-300 animate-fade-in-up delay-200">
              {subtitle}
            </p>
            <div className="mt-8 flex gap-4 animate-fade-in-up delay-300">
              {primaryButtonText && primaryButtonUrl && (
                <Link to={primaryButtonUrl}>
                  <Button 
                    variant="default" 
                    className="bg-gray-200 text-black hover:bg-gray-300"
                  >
                    {primaryButtonText}
                  </Button>
                </Link>
              )}
              {secondaryButtonText && secondaryButtonUrl && (
                <Link to={secondaryButtonUrl}>
                  <Button 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:bg-gray-900"
                  >
                    {secondaryButtonText}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:block max-w-sm">
            <div
              className="backdrop-blur-sm bg-black/30 border border-gray-800 rounded-3xl p-4 transform-gpu transition-transform duration-500 -rotate-6 shadow-lg"
            >
              <img
                src={imageSrc}
                alt="Hero Visual"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default WaveyHeroHeader;
