import samuelAvatar from "@assets/generated_images/Samuel_Leadership_Coach_Avatar_0cdaf0f8.png";
import rohanAvatar from "@assets/generated_images/Rohan_Performance_Coach_Avatar_450e031f.png";
import mayaAvatar from "@assets/generated_images/Maya_Career_Coach_Avatar_5c657077.png";
import ariaAvatar from "@assets/generated_images/Aria_HiPo_Coach_Avatar_eb8bae99.png";
import zaraAvatar from "@assets/generated_images/Zara_Life_Coach_Avatar_7a3ec57d.png";
import arjunAvatar from "@assets/generated_images/Arjun_EmpathEAR_Coach_Avatar_7ab0368b.png";

export type CoachType = 'leadership' | 'performance' | 'career' | 'hipo' | 'life' | 'empathear';

export interface Coach {
  id: CoachType;
  name: string;
  title: string;
  description: string;
  specialties: string[];
  avatar: string;
  color: string;
  icon: string;
  isPrimary?: boolean;
}

export const coaches: Record<CoachType, Coach> = {
  leadership: {
    id: 'leadership',
    name: 'Samuel',
    title: 'Leadership Coach',
    description: 'Transform from successful manager to visionary leader',
    specialties: ['Executive presence', 'Strategic thinking', 'Team leadership', 'Organizational change'],
    avatar: samuelAvatar,
    color: 'from-blue-600 to-blue-700',
    icon: '🎯',
  },
  performance: {
    id: 'performance',
    name: 'Rohan',
    title: 'Performance Coach',
    description: 'Accelerate your performance to stand out and advance',
    specialties: ['Productivity optimization', 'Goal achievement', 'Skill development', 'Performance reviews'],
    avatar: rohanAvatar,
    color: 'from-orange-600 to-orange-700',
    icon: '⚡',
  },
  career: {
    id: 'career',
    name: 'Maya',
    title: 'Career Coach',
    description: 'Navigate career transitions and accelerate growth strategically',
    specialties: ['Career planning', 'Job transitions', 'Networking', 'Salary negotiation'],
    avatar: mayaAvatar,
    color: 'from-green-600 to-green-700',
    icon: '💼',
  },
  hipo: {
    id: 'hipo',
    name: 'Aria',
    title: 'HiPo Coach',
    description: 'Strategic career guidance for high-potential professionals',
    specialties: ['Strategic thinking', 'Executive presence', 'Leadership pipeline', 'High-impact decisions'],
    avatar: ariaAvatar,
    color: 'from-purple-600 to-purple-700',
    icon: '🚀',
  },
  life: {
    id: 'life',
    name: 'Zara',
    title: 'Life Coach',
    description: 'Achieve work-life integration and personal fulfillment',
    specialties: ['Work-life balance', 'Stress management', 'Personal goals', 'Wellness'],
    avatar: zaraAvatar,
    color: 'from-pink-600 to-pink-700',
    icon: '🌱',
  },
  empathear: {
    id: 'empathear',
    name: 'Arjun',
    title: 'EmpathEAR Coach',
    description: 'Your empathetic listening companion for emotional support',
    specialties: ['Emotional support', 'Active listening', 'Stress relief', 'Mental wellness'],
    avatar: arjunAvatar,
    color: 'from-teal-600 to-teal-700',
    icon: '💙',
    isPrimary: true, // Always a primary coach
  },
};

export const getCoachRecommendations = (challenge: string): CoachType[] => {
  const challengeMap: Record<string, CoachType[]> = {
    'leadership': ['leadership', 'empathear'],
    'career': ['career', 'empathear'],
    'performance': ['performance', 'empathear'],
    'stress': ['empathear', 'life'],
    'balance': ['life', 'empathear'],
    'strategic': ['hipo', 'empathear'],
  };
  
  return challengeMap[challenge] || ['hipo', 'empathear'];
};