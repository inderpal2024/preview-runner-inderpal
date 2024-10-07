import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Visualization = ({waveSpeed, waveFrequency, waveColor, bgColor}) => {
  const canvas = useRef(null);
  const circles = useRef([]);
  const animationRef = useRef(null);
  const lastDrawTime = useRef(null);
  const mouseDownTimemoutRef = useRef(null);
  const mouseDownTimeRef = useRef(null);
  const mousePosRef = useRef({x: 0, y: 0});

  const addCircle = (x, y) => {
    circles.current.push({x, y, radius: 0});
  };

  useEffect(() => {
    const animate = (prevTime) => {
      if (lastDrawTime.current && canvas.current) {
        const ctx = canvas.current.getContext('2d');
        let dt = (performance.now() - lastDrawTime.current) / 1000,
          dr = dt * waveSpeed,
          maxRadius = Math.hypot(ctx.canvas.width, ctx.canvas.height);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        circles.current = circles.current.filter(circle => {
          circle.radius += dr;
          return circle.radius < maxRadius;
        });

        ctx.lineWidth = 2;
        ctx.strokeStyle = waveColor;
        circles.current.forEach(circle => {
          ctx.beginPath();
          ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
          ctx.stroke();
        });
      }
      lastDrawTime.current = performance.now();
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [waveSpeed, waveFrequency, waveColor, bgColor]);

  const resizeHandler = () => {
    if (canvas.current) {
      canvas.current.width = window.innerWidth;
      canvas.current.height = window.innerHeight;
    }
  };
  const mousedownHandler = (e) => {
    if (e.target !== canvas.current) {
      return;
    }

    const x = e.clientX, y = e.clientY;
    const mousedownTime = Date.now();
    const delay = 1000 / waveFrequency;
    mouseDownTimeRef.current = mousedownTime;
    mousePosRef.current.x = x;
    mousePosRef.current.y = y;
    addCircle(x, y);

    let n = 0, t0 = Date.now();
    const addNextCircle = () => {
      if (mouseDownTimeRef.current === mousedownTime && mousePosRef.current) {
        n++;
        addCircle(mousePosRef.current.x, mousePosRef.current.y);
        mouseDownTimemoutRef.current = setTimeout(addNextCircle, mousedownTime + n * delay - Date.now());
      }
    }
    mouseDownTimemoutRef.current = setTimeout(addNextCircle, delay);
  };
  const mouseupHandler = () => {
    mousePosRef.current.x = 0;
    mousePosRef.current.y = 0;
    clearTimeout(mouseDownTimemoutRef.current);
    mouseDownTimeRef.current = null;
  };
  const mousemoveHandler = (e) => {
    if (mouseDownTimeRef.current) {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
    }
  }
  useEffect(() => {
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('mouseup', mouseupHandler);
    window.addEventListener('mousedown', mousedownHandler);
    window.addEventListener('mousemove', mousemoveHandler);
    resizeHandler();

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mouseup', mouseupHandler);
      window.removeEventListener('mousedown', mousedownHandler);
      window.removeEventListener('mousemove', mousemoveHandler);
    }
  });

  return <canvas ref={canvas} className="fixed bottom-0 top-0 left-0 right-0 z-0" /*;*//>;
}
const ControlInput = ({label, type, value, updateVal}) => {
  return <div className="flex flex-row flex-nowrap content-center pr-8 pb-1 md:pb-0 md:w-1/4 sm:w-1/2 w-full justify-between items-center">
    <label className="shrink-0 grow-0">{label}</label>
    <Input
        className="grow-0 shrink basis-20"
        type={type}
        value={value}
        onChange={(e)=> updateVal(e.target.value)}
    />
  </div>
}
export default function App() {
  const [controls, setControls] = useState({
    waveSpeed: 10,
    waveFrequency: 2,
    waveColor: '#004C66',
    bgColor: '#FFFFF0'
  });
  const [hideCtrl, setHideCtrl] = useState(true);

  return (
    <div>
      <Visualization {...controls} />
      <Button className="sm:hidden fixed right-4 bottom-4 h-8 w-16 z-20"
          onClick={(e) => setHideCtrl(!hideCtrl)}>{hideCtrl ? 'Show' : 'Hide'}</Button>
      <div className={`flex flex-row flex-wrap ${hideCtrl ? 'hidden' : ''} sm:flex ` +
          `w-full mr-4 fixed bottom-0 bg-gray-100 p-2 pb-16 rounded-lg z-10`}
          >
        <ControlInput {...{label: 'Speed', type: 'number', value: controls.waveSpeed,
            updateVal: (val) => setControls({...controls, waveSpeed: val})}} />
        <ControlInput {...{label: 'Frequency', type: 'number', value: controls.waveFrequency,
            updateVal: (val) => setControls({...controls, waveFrequency: val})}} />
        <ControlInput {...{label: 'Colour', type: 'color', value: controls.waveColor,
            updateVal: (val) => setControls({...controls, waveColor: val})}} />
        <ControlInput {...{label: 'Background', type: 'color', value: controls.bgColor,
            updateVal: (val) => setControls({...controls, bgColor: val})}} />
      </div>
    </div>
  );
};
