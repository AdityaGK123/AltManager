import ProfileEdit from "../ProfileEdit";

export default function ProfileEditExample() {
  // todo: remove mock functionality
  const mockUser = {
    firstName: "Sarah",
    lastName: "Sharma",
    email: "sarah.sharma@company.com",
    currentRole: "Senior Software Engineer",
    industry: "Technology & IT",
    customIndustry: "",
    careerStage: "5-10",
    fiveYearGoal: "Lead a team of 20+ engineers and transition into engineering management",
    biggestChallenge: "leadership",
    workEnvironment: "startup",
  };

  const handleSave = async (updatedProfile: any) => {
    console.log("Saving profile:", updatedProfile);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="p-6">
      <ProfileEdit
        user={mockUser}
        onSave={handleSave}
      />
    </div>
  );
}