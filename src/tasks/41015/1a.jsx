import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const VisualizationArea = ({ waveSpeed, frequency, waveColor, bgColor, onMouseDown }) => {
  const canvasRef = useRef(null);
  const circles = useRef([]);
  const lastUpdate = useRef(Date.now());
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 60; // Adjust for form height

    const animate = () => {
      const now = Date.now();
      const dt = now - lastUpdate.current;
      lastUpdate.current = now;

      // Clear canvas
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (isMouseDown) {
        circles.current.push({ x: mousePos.x, y: mousePos.y, r: 0 });
      }

      // Draw and update circles
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2;
      circles.current = circles.current.filter(circle => {
        circle.r += waveSpeed * (dt / 1000);
        if (circle.r < Math.hypot(canvas.width, canvas.height)) {
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
          ctx.stroke();
          return true;
        }
        return false;
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleMouseMove = (e) => {
      if (isMouseDown) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [waveSpeed, frequency, waveColor, bgColor, isMouseDown]);

  const handleMouseDown = (e) => {
    setIsMouseDown(true);
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsMouseDown(false);

  return (
    <canvas 
      ref={canvasRef} 
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ backgroundColor: bgColor }}
    />
  );
};

export default function App() {
  const [waveSpeed, setWaveSpeed] = useState(10);
  const [frequency, setFrequency] = useState(2);
  const [waveColor, setWaveColor] = useState('#004C66');
  const [bgColor, setBgColor] = useState('#FFFFF0');
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <VisualizationArea 
        waveSpeed={waveSpeed}
        frequency={frequency}
        waveColor={waveColor}
        bgColor={bgColor}
      />
      <Card className={`mt-auto ${isCollapsed ? 'hidden' : 'block'}`}>
        <CardContent className="p-2">
          <div className="flex flex-wrap items-center justify-between">
            <Button size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
              {isCollapsed ? "Show Controls" : "Hide Controls"}
            </Button>
            {!isCollapsed && (
              <>
                <div className="sm:flex sm:space-x-4">
                  <Label className="sm:inline-block sm:w-1/4">Wave Speed</Label>
                  <Input type="number" value={waveSpeed} onChange={(e) => setWaveSpeed(Number(e.target.value))} className="sm:w-3/4" />
                </div>
                <div className="sm:flex sm:space-x-4 mt-2 sm:mt-0">
                  <Label className="sm:inline-block sm:w-1/4">Frequency (Hz)</Label>
                  <Input type="number" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} className="sm:w-3/4" />
                </div>
                <div className="sm:flex sm:space-x-4 mt-2">
                  <Label className="sm:inline-block sm:w-1/4">Wave Color</Label>
                  <Input type="color" value={waveColor} onChange={(e) => setWaveColor(e.target.value)} className="sm:w-3/4" />
                </div>
                <div className="sm:flex sm:space-x-4 mt-2">
                  <Label className="sm:inline-block sm:w-1/4">Background</Label>
                  <Input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="sm:w-3/4" />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}