import { WorksWheel, type WorksWheelItem } from "./works-wheel";

const WORKS: WorksWheelItem[] = [
  { title: "Private conversations", image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=72", href: "#features" },
  { title: "Media that stays in context", image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=72", href: "#features" },
  { title: "Groups built for focus", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=72", href: "#product" },
];

export default function WorksWheelDemo() { return <WorksWheel items={WORKS} label="A calmer way to connect" action="Explore" />; }
