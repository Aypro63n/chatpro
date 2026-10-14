"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

export interface WorksWheelItem { title: string; image: string; href?: string; }
export interface WorksWheelProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> { items: WorksWheelItem[]; label?: string; action?: string; }

export function WorksWheel({ items, label = "ChatPro in motion", action = "Open", className, ...props }: WorksWheelProps) {
  const [turn, setTurn] = React.useState(0);
  const safeItems = items.slice(0, 12);
  const ringSize = Math.max(safeItems.length, 1);
  const active = ((Math.round(turn) % ringSize) + ringSize) % ringSize;
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const lastWheelAt = React.useRef(0);

  React.useEffect(() => {
    const node = wheelRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const now = performance.now();
      if (now - lastWheelAt.current < 90) return;
      lastWheelAt.current = now;
      event.preventDefault();
      const delta = event.deltaY > 0 || event.deltaX > 0 ? 1 : -1;
      setTurn((value) => value + delta * 0.22);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  if (!safeItems.length) return null;
  const circleMode = Math.abs(turn % 1) < 0.08;
  return (
    <section aria-label={label} className={cn("works-wheel", circleMode ? "works-wheel-resting" : "works-wheel-turning", className)} {...props}>
      <div className="works-wheel-stage" ref={wheelRef} tabIndex={0} aria-label="Scroll to rotate capabilities">
        {safeItems.map((item, index) => {
          const fraction = (index - turn) / ringSize;
          const angle = fraction * Math.PI * 2 - Math.PI / 2;
          const distance = Math.min(1, Math.abs(((index - active + ringSize / 2) % ringSize) - ringSize / 2));
          const x = Math.cos(angle) * 31;
          const y = Math.sin(angle) * 31;
          const depth = (Math.cos(angle) + 1) / 2;
          const style = {
            transform: circleMode
              ? `translate(-50%, -50%) translate(${x}%, ${y}%) rotate(${angle * 57.3 + 90}deg) scale(${0.72 + depth * 0.28})`
              : `translate(-50%, -50%) translateY(${(index - turn) * 30}%) rotate(${(index - turn) * 5}deg) scale(${index === active ? 1 : 0.82})`,
            opacity: circleMode ? 0.25 + depth * 0.75 : Math.max(0.15, 1 - distance * 0.28),
            zIndex: Math.round(depth * 20),
          } as React.CSSProperties;
          const content = <><img src={item.image} alt="" loading="lazy" /><span className="works-wheel-overlay"><span>{item.title}</span>{action && item.href ? <span className="works-wheel-action">{action}</span> : null}</span></>;
          return item.href ? <a key={item.title} href={item.href} className="works-wheel-item" style={style}>{content}</a> : <div key={item.title} className="works-wheel-item" style={style}>{content}</div>;
        })}
        <div className="works-wheel-label">{safeItems[active]?.title}</div>
        <span className="works-wheel-hint">Scroll inside to rotate</span>
      </div>
      <div className="works-wheel-index" role="tablist" aria-label={`${label} index`}>
        {safeItems.map((item, index) => <button key={item.title} type="button" role="tab" aria-selected={index === active} onClick={() => setTurn(index)}>{String(index + 1).padStart(2, "0")} {item.title}</button>)}
      </div>
    </section>
  );
}
export default WorksWheel;
