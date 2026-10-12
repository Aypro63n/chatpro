"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

export interface WorksWheelItem { title: string; image: string; href?: string; }
export interface WorksWheelProps extends Omit<React.ComponentPropsWithoutRef<"section">, "children"> { items: WorksWheelItem[]; label?: string; action?: string; }

export function WorksWheel({ items, label = "ChatPro in motion", action = "Open", className, ...props }: WorksWheelProps) {
  const [active, setActive] = React.useState(0);
  const safeItems = items.slice(0, 12);
  if (!safeItems.length) return null;
  return (
    <section aria-label={label} className={cn("works-wheel", className)} {...props}>
      <div className="works-wheel-stage">
        {safeItems.map((item, index) => {
          const offset = (index - active + safeItems.length) % safeItems.length;
          const distance = offset > safeItems.length / 2 ? offset - safeItems.length : offset;
          const visible = Math.abs(distance) <= 2;
          const style = { transform: `translate(-50%, -50%) translateY(${distance * 28}%) rotate(${distance * 4}deg) scale(${distance === 0 ? 1 : 0.82})`, opacity: visible ? Math.max(0.18, 1 - Math.abs(distance) * 0.28) : 0, zIndex: 20 - Math.abs(distance) } as React.CSSProperties;
          const content = <><img src={item.image} alt="" loading="lazy" /><span className="works-wheel-overlay"><span>{item.title}</span>{action && item.href ? <span className="works-wheel-action">{action}</span> : null}</span></>;
          return item.href ? <a key={item.title} href={item.href} className="works-wheel-item" style={style}>{content}</a> : <div key={item.title} className="works-wheel-item" style={style}>{content}</div>;
        })}
        <div className="works-wheel-label">{safeItems[active]?.title}</div>
      </div>
      <div className="works-wheel-index" role="tablist" aria-label={`${label} index`}>
        {safeItems.map((item, index) => <button key={item.title} type="button" role="tab" aria-selected={index === active} onClick={() => setActive(index)}>{String(index + 1).padStart(2, "0")} {item.title}</button>)}
      </div>
    </section>
  );
}
export default WorksWheel;
