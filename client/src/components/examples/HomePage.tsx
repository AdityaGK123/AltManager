import HomePage from "../HomePage";
import { CoachType } from "@/types/coaches";

export default function HomePageExample() {
  // todo: remove mock functionality
  const mockUser = {
    id: '1',
    email: 'sarah.sharma@company.com',
    firstName: 'Sarah',
    lastName: 'Sharma',
    profileImageUrl: undefined,
  };

  const mockPrimaryCoaches: CoachType[] = ['leadership', 'empathear'];

  return (
    <HomePage
      user={mockUser}
      primaryCoaches={mockPrimaryCoaches}
      onSelectCoach={(coachId) => console.log(`Selected coach: ${coachId}`)}
      onLogout={() => console.log("Logout clicked")}
    />
  );
}