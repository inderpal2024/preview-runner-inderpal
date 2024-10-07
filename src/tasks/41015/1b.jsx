import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const Visualization = ({ waveSpeed, frequency, waveColor, bgColor }) => {
  const canvasRef = useRef(null);
  const circles = useRef([]);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(Date.now());

  const draw = useCallback((ctx) => {
    const now = Date.now();
    const dt = (now - lastTimeRef.current) / 1000; // time delta in seconds
    lastTimeRef.current = now;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    circles.current = circles.current.filter(circle => {
      const radius = circle.radius + waveSpeed * dt;
      if (radius < Math.hypot(ctx.canvas.width, ctx.canvas.height)) {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, radius, 0, 2 * Math.PI);
        ctx.lineWidth = 2;
        ctx.strokeStyle = waveColor;
        ctx.stroke();
        circle.radius = radius;
        return true;
      }
      return false;
    });
  }, [waveSpeed, waveColor, bgColor]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    draw(ctx);
    animationRef.current = requestAnimationFrame(animate);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight - 60; // Adjust for form height
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animate]);

  const handleMouseDown = (e) => {
    if (e.buttons === 1) { // Left mouse button
      circles.current.push({ x: e.clientX, y: e.clientY - 60, radius: 0 });
    }
  };

  return <canvas ref={canvasRef} onMouseDown={handleMouseDown} style={{ width: '100%', height: 'calc(100vh - 60px)' }} />;
};

export default function App() {
  const [waveSpeed, setWaveSpeed] = useState(10);
  const [frequency, setFrequency] = useState(2);
  const [waveColor, setWaveColor] = useState('#004C66');
  const [bgColor, setBgColor] = useState('#FFFFF0');
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex flex-col h-screen">
      <Visualization 
        waveSpeed={waveSpeed} 
        frequency={frequency} 
        waveColor={waveColor} 
        bgColor={bgColor} 
      />
      <div className="mt-auto">
        <Button onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? "Show Settings" : "Hide Settings"}
        </Button>
        {!isCollapsed && (
          <Card className="mt-2">
            <CardContent className="p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div>
                  <Label htmlFor="speed">Wave Speed</Label>
                  <Input id="speed" type="number" value={waveSpeed} onChange={(e) => setWaveSpeed(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency (Hz)</Label>
                  <Input id="frequency" type="number" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))} />
                </div>
                <div>
                  <Label htmlFor="waveColor">Wave Color</Label>
                  <Input id="waveColor" type="color" value={waveColor} onChange={(e) => setWaveColor(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="bgColor">Background Color</Label>
                  <Input id="bgColor" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}