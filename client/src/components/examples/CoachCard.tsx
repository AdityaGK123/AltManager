import CoachCard from "../CoachCard";
import { coaches } from "@/types/coaches";

export default function CoachCardExample() {
  return (
    <div className="p-6 space-y-4">
      <CoachCard 
        coach={coaches.leadership} 
        onSelect={(id) => console.log(`Selected coach: ${id}`)}
        isPrimary={true}
      />
      <CoachCard 
        coach={coaches.empathear} 
        onSelect={(id) => console.log(`Selected coach: ${id}`)}
        isCompact={true}
      />
    </div>
  );
}