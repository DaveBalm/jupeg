export type TopicName = 
  | 'Calculus'
  | 'Algebra'
  | 'Trigonometry'
  | 'Coordinate Geometry'
  | 'Vectors & Mechanics'
  | 'Statistics & Probability';

export interface Step {
  step_order: number;
  instruction: string;
  math_equation: string;
  hint: string;
  common_pitfall: string;
}

export interface GraphPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface GraphCurve {
  fn: string; // e.g. "x^2 * sin(3 * x)" or "x * exp(2 * x)"
  color?: string;
  range?: [number, number];
  closed?: boolean;
}

export interface DiagramConfig {
  type: 'function-plot' | 'geometry-plane' | 'vector-plane';
  title?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  curves?: GraphCurve[];
  points?: GraphPoint[];
  tangentAt?: {
    x: number;
    label?: string;
  };
  integralArea?: {
    from: number;
    to: number;
    fn: string;
  };
  vectors?: {
    from: [number, number];
    to: [number, number];
    label: string;
    color: string;
  }[];
  matplotlibPythonScript?: string;
  manimAnimationScript?: string; // 3Blue1Brown mathematical animation Python code
  jsxgraphConfig?: {
    boardBoundingBox: [number, number, number, number];
    elements: {
      type: 'point' | 'line' | 'arrow' | 'circle' | 'polygon' | 'angle';
      parents: any[];
      name?: string;
      color?: string;
    }[];
  };
  openGraphImageSpec?: {
    socialCardTitle: string;
    targetAspectRatio: '1200x630' | '1080x1080';
    r2BucketKey?: string;
  };
  explanation?: string;
}

export interface Question {
  id: string;
  topic: TopicName;
  subtopic: string;
  year?: string;
  question_text: string;
  difficulty_level: 1 | 2 | 3;
  key_concept: string;
  final_answer: string;
  steps: Step[];
  diagram_config?: DiagramConfig;
  multiple_choice_options?: {
    label: string;
    text: string;
    is_correct: boolean;
  }[];
}

export interface UserAttempt {
  id: string;
  question_id: string;
  topic: TopicName;
  is_correct: boolean;
  time_taken_seconds: number;
  attempted_at: string;
  hints_used_count: number;
  steps_revealed_count: number;
  rating?: 'hard' | 'good' | 'easy';
}

export interface SRSItem {
  question_id: string;
  repetition: number;
  interval_days: number;
  ease_factor: number;
  next_review_date: string; // ISO string
  last_reviewed_date: string;
  status: 'learning' | 'review' | 'mastered';
}

export interface UserProfile {
  id: string;
  full_name: string;
  subscription_tier: 'free' | 'pro' | 'school_license';
  streak_days: number;
  last_active_date: string;
  total_study_seconds: number;
}
