import CoachRecommendation from "../CoachRecommendation";

export default function CoachRecommendationExample() {
  // todo: remove mock functionality
  const mockProfile = {
    firstName: "Priya",
    lastName: "Patel",
    biggestChallenge: "leadership",
  };

  return (
    <div className="min-h-screen bg-background">
      <CoachRecommendation
        userProfile={mockProfile}
        onContinue={(coaches) => console.log("Continue with coaches:", coaches)}
        onModifyRecommendations={() => console.log("Modify recommendations")}
      />
    </div>
  );
}