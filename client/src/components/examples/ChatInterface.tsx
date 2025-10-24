import ChatInterface from "../ChatInterface";
import { coaches } from "@/types/coaches";

export default function ChatInterfaceExample() {
  return (
    <div className="h-screen">
      <ChatInterface
        coach={coaches.leadership}
        onBack={() => console.log("Back to coaches")}
        onHeartMessage={(messageId) => console.log(`Hearted message: ${messageId}`)}
      />
    </div>
  );
}