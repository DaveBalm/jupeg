import { Question } from '../types/math';

export const INITIAL_JUPEB_QUESTIONS: Question[] = [
  {
    id: 'jupeb-calc-001',
    topic: 'Calculus',
    subtopic: 'Product & Chain Rule',
    year: 'JUPEB 2023 Paper 1',
    question_text: 'Differentiate $y = x^2 \\sin(3x)$ with respect to $x$, and express the result in fully factored form.',
    difficulty_level: 2,
    key_concept: 'Product Rule: $\\frac{d}{dx}[uv] = u\\frac{dv}{dx} + v\\frac{du}{dx}$ combined with Chain Rule $\\frac{d}{dx}[\\sin(ax)] = a\\cos(ax)$',
    final_answer: '\\frac{dy}{dx} = x(2\\sin(3x) + 3x\\cos(3x))',
    diagram_config: {
      type: 'function-plot',
      title: 'Graph of y = x² sin(3x) and its Derivative y\'',
      explanation: 'Interactive visual comparing the primary oscillation function with its rate-of-change envelope.',
      xDomain: [-3, 3],
      yDomain: [-8, 8],
      curves: [
        {
          fn: 'x^2 * sin(3 * x)',
          color: '#38bdf8',
        },
        {
          fn: 'x * (2 * sin(3 * x) + 3 * x * cos(3 * x))',
          color: '#a855f7',
        },
      ],
      points: [
        { x: 0, y: 0, label: 'Stationary Inflection (0,0)' },
      ],
      matplotlibPythonScript: `import numpy as np
import matplotlib.pyplot as plt

# Domain for JUPEB Calculus demonstration
x = np.linspace(-3, 3, 500)
y = x**2 * np.sin(3 * x)
dy_dx = x * (2 * np.sin(3 * x) + 3 * x * np.cos(3 * x))

plt.figure(figsize=(9, 5), facecolor='#060a12')
ax = plt.axes()
ax.set_facecolor('#060a12')

plt.plot(x, y, label=r'$y = x^2 \\sin(3x)$', color='#38bdf8', lw=2.2)
plt.plot(x, dy_dx, label=r"$\\frac{dy}{dx} = x(2\\sin(3x) + 3x\\cos(3x))$", color='#a855f7', lw=1.8, linestyle='--')
plt.scatter([0], [0], color='#f43f5e', s=50, zorder=5, label='Inflection (0,0)')

plt.title('JUPEB 2023 - Product & Chain Rule Oscillation', color='white', fontsize=13, pad=12)
plt.xlabel('x', color='#94a3b8')
plt.ylabel('y', color='#94a3b8')
plt.grid(True, linestyle=':', alpha=0.3, color='#334155')
plt.tick_params(colors='#94a3b8')
legend = plt.legend(facecolor='#0f172a', edgecolor='#334155', labelcolor='white')
plt.tight_layout()
plt.show()`,
      manimAnimationScript: `from manim import *

class JUPEBProductRuleAnimation(Scene):
    def construct(self):
        # 3Blue1Brown Mathematical Animation Pipeline for JUPEB
        self.camera.background_color = "#060a12"
        
        title = Tex(r"Differentiating $y = x^2 \\sin(3x)$", font_size=38, color=BLUE_B)
        title.to_edge(UP)
        self.play(Write(title))
        
        # 1. Coordinate Axes
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-8, 8, 2],
            x_length=9,
            y_length=5.5,
            axis_config={"color": GREY_B, "stroke_width": 2},
        ).shift(DOWN * 0.3)
        
        self.play(Create(axes), run_time=1.2)
        
        # 2. Plot Curve y = x^2 * sin(3x)
        curve = axes.plot(lambda x: (x**2) * np.sin(3*x), color="#38bdf8", stroke_width=3.5)
        curve_label = MathTex(r"y = x^2 \\sin(3x)", color="#38bdf8", font_size=30).next_to(curve, UP)
        
        self.play(Create(curve), FadeIn(curve_label), run_time=2)
        self.wait(0.5)
        
        # 3. Dynamic Moving Tangent Line (ValueTracker)
        x_tracker = ValueTracker(-2.2)
        
        dot = always_redraw(lambda: Dot(
            point=axes.c2p(x_tracker.get_value(), (x_tracker.get_value()**2) * np.sin(3*x_tracker.get_value())),
            color=RED_C,
            radius=0.08
        ))
        
        # Derivative slope: dy/dx = x(2sin(3x) + 3x cos(3x))
        def get_slope(x_val):
            return x_val * (2 * np.sin(3 * x_val) + 3 * x_val * np.cos(3 * x_val))
            
        tangent = always_redraw(lambda: axes.get_secant_slope_group(
            x_tracker.get_value(),
            curve,
            dx=0.001,
            secant_line_color=YELLOW,
            secant_line_length=3.5
        ))
        
        self.play(FadeIn(dot), FadeIn(tangent))
        # Animate tangent gliding across critical points
        self.play(x_tracker.animate.set_value(2.2), run_time=4, rate_func=linear)
        self.wait(1)
`,
      openGraphImageSpec: {
        socialCardTitle: 'How to Differentiate x² sin(3x) Step-by-Step | JUPEB Past Questions',
        targetAspectRatio: '1200x630',
        r2BucketKey: 'og-images/jupeb-calc-001.png',
      },
    },
    multiple_choice_options: [
      { label: 'A', text: '$2x \\cos(3x)$', is_correct: false },
      { label: 'B', text: '$x(2\\sin(3x) + 3x\\cos(3x))$', is_correct: true },
      { label: 'C', text: '$6x^2 \\cos(3x)$', is_correct: false },
      { label: 'D', text: '$2x \\sin(3x) + x^2 \\cos(3x)$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Identify the two multiplicand functions $u(x)$ and $v(x)$.',
        math_equation: 'u = x^2, \\quad v = \\sin(3x)',
        hint: 'Split $y$ into two simpler functions that are multiplied together.',
        common_pitfall: 'Do not attempt to distribute or treat $3x$ as separate from the sine function.',
      },
      {
        step_order: 2,
        instruction: 'Compute individual derivatives $\\frac{du}{dx}$ and $\\frac{dv}{dx}$ using the Chain Rule.',
        math_equation: '\\frac{du}{dx} = 2x, \\quad \\frac{dv}{dx} = \\frac{d}{dx}[\\sin(3x)] = 3\\cos(3x)',
        hint: 'Remember the derivative of $\\sin(kx)$ is $k\\cos(kx)$ due to the inner derivative $\\frac{d}{dx}(3x) = 3$.',
        common_pitfall: 'Forgetting to multiply by 3 (the inner derivative), giving just $\\cos(3x)$.',
      },
      {
        step_order: 3,
        instruction: 'Apply the Product Rule formula $\\frac{dy}{dx} = u \\frac{dv}{dx} + v \\frac{du}{dx}$.',
        math_equation: '\\frac{dy}{dx} = (x^2)[3\\cos(3x)] + (\\sin(3x))[2x] = 3x^2\\cos(3x) + 2x\\sin(3x)',
        hint: 'Substitute $u, v, \\frac{du}{dx}, \\frac{dv}{dx}$ directly into the product rule formula.',
        common_pitfall: 'Confusing the product rule with quotient rule (adding vs subtracting terms).',
      },
      {
        step_order: 4,
        instruction: 'Factor out the common factor $x$ for the final simplified JUPEB examination form.',
        math_equation: '\\frac{dy}{dx} = x\\big(2\\sin(3x) + 3x\\cos(3x)\\big)',
        hint: 'Both terms have at least one factor of $x$. Factor it out to match typical JUPEB marking schemes.',
        common_pitfall: 'Leaving the answer un-factored may lose 1 accuracy mark in JUPEB theory sections.',
      },
    ],
  },
  {
    id: 'jupeb-calc-002',
    topic: 'Calculus',
    subtopic: 'Integration by Parts',
    year: 'JUPEB 2022 Paper 2',
    question_text: 'Evaluate the indefinite integral $\\int x e^{2x} \\, dx$.',
    difficulty_level: 2,
    key_concept: 'Integration by Parts formula: $\\int u \\, dv = u v - \\int v \\, du$',
    final_answer: '\\frac{1}{2} x e^{2x} - \\frac{1}{4} e^{2x} + C = \\frac{1}{4}e^{2x}(2x - 1) + C',
    multiple_choice_options: [
      { label: 'A', text: '$\\frac{1}{2}x^2 e^{2x} + C$', is_correct: false },
      { label: 'B', text: '$\\frac{1}{4}e^{2x}(2x - 1) + C$', is_correct: true },
      { label: 'C', text: '$\\frac{1}{2}e^{2x}(x - 1) + C$', is_correct: false },
      { label: 'D', text: '$2x e^{2x} - e^{2x} + C$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Choose $u$ and $dv$ using the LIATE rule (Logarithmic, Inverse trig, Algebraic, Trig, Exponential).',
        math_equation: 'u = x, \\quad dv = e^{2x} \\, dx',
        hint: 'Algebraic terms ($x$) simplify when differentiated, while exponentials ($e^{2x}$) easily integrate.',
        common_pitfall: 'Choosing $u = e^{2x}$ and $dv = x\\,dx$ makes the integral more complicated (giving $\\int x^2 e^{2x}$).',
      },
      {
        step_order: 2,
        instruction: 'Differentiate $u$ to obtain $du$, and integrate $dv$ to obtain $v$.',
        math_equation: 'du = dx, \\quad v = \\int e^{2x} \\, dx = \\frac{1}{2} e^{2x}',
        hint: 'Remember dividing by the linear coefficient 2 when integrating $e^{2x}$.',
        common_pitfall: 'Multiplying by 2 instead of dividing by 2 when integrating.',
      },
      {
        step_order: 3,
        instruction: 'Apply the formula $\\int u \\, dv = uv - \\int v \\, du$.',
        math_equation: '\\int x e^{2x} \\, dx = (x)\\left(\\frac{1}{2} e^{2x}\\right) - \\int \\frac{1}{2} e^{2x} \\, dx',
        hint: 'Form the product $uv$ and set up the remaining integral $\\int v \\, du$.',
        common_pitfall: 'Dropping the minus sign in front of $\\int v \\, du$.',
      },
      {
        step_order: 4,
        instruction: 'Compute the remaining integral $\\int \\frac{1}{2}e^{2x} \\, dx$ and add the constant of integration $C$.',
        math_equation: '= \\frac{1}{2}x e^{2x} - \\frac{1}{2}\\left(\\frac{1}{2}e^{2x}\\right) + C = \\frac{1}{2}x e^{2x} - \\frac{1}{4}e^{2x} + C',
        hint: 'Integrating $\\frac{1}{2}e^{2x}$ introduces another factor of $\\frac{1}{2}$, making the coefficient $\\frac{1}{4}$.',
        common_pitfall: 'Forgetting the arbitrary constant $+C$ in an indefinite integral.',
      },
      {
        step_order: 5,
        instruction: 'Factor out the common term $\\frac{1}{4}e^{2x}$.',
        math_equation: '= \\frac{1}{4}e^{2x}(2x - 1) + C',
        hint: 'Factor out $\\frac{1}{4}e^{2x}$: note $\\frac{1}{2} = \\frac{2}{4}$.',
        common_pitfall: 'Arithmetic slip with factoring fractions.',
      },
    ],
  },
  {
    id: 'jupeb-calc-003',
    topic: 'Calculus',
    subtopic: 'Implicit Differentiation',
    year: 'JUPEB 2021 Paper 1',
    question_text: 'Given the curve $x^3 + y^3 = 6xy$, find the gradient $\\frac{dy}{dx}$ at the point $(3, 3)$.',
    difficulty_level: 3,
    key_concept: 'Implicit Differentiation: Apply $\\frac{d}{dx}$ to every term and use the chain rule $\\frac{d}{dx}(y^n) = n y^{n-1}\\frac{dy}{dx}$',
    final_answer: '\\left.\\frac{dy}{dx}\\right|_{(3,3)} = -1',
    multiple_choice_options: [
      { label: 'A', text: '$1$', is_correct: false },
      { label: 'B', text: '$-1$', is_correct: true },
      { label: 'C', text: '$0$', is_correct: false },
      { label: 'D', text: '$3$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Differentiate both sides of $x^3 + y^3 = 6xy$ with respect to $x$.',
        math_equation: '\\frac{d}{dx}[x^3] + \\frac{d}{dx}[y^3] = 6\\frac{d}{dx}[xy]',
        hint: 'Remember that $y$ is a function of $x$, so differentiating $y$ yields terms with $\\frac{dy}{dx}$.',
        common_pitfall: 'Differentiating $y^3$ as simply $3y^2$ without appending $\\frac{dy}{dx}$.',
      },
      {
        step_order: 2,
        instruction: 'Apply the Chain Rule to $y^3$ and the Product Rule to $xy$.',
        math_equation: '3x^2 + 3y^2 \\frac{dy}{dx} = 6\\left(x\\frac{dy}{dx} + y\\right) = 6x\\frac{dy}{dx} + 6y',
        hint: 'For $6xy$, take $u = 6x$ and $v = y$ so $\\frac{d}{dx}(6xy) = 6y + 6x\\frac{dy}{dx}$.',
        common_pitfall: 'Forgetting to apply the product rule to the $6xy$ term on the right side.',
      },
      {
        step_order: 3,
        instruction: 'Rearrange and collect all terms containing $\\frac{dy}{dx}$ on one side.',
        math_equation: '3y^2 \\frac{dy}{dx} - 6x \\frac{dy}{dx} = 6y - 3x^2 \\implies \\frac{dy}{dx}(3y^2 - 6x) = 6y - 3x^2',
        hint: 'Group $\\frac{dy}{dx}$ on the left hand side, and all non-derivative terms on the right hand side.',
        common_pitfall: 'Sign errors when moving terms across the equality sign.',
      },
      {
        step_order: 4,
        instruction: 'Solve for $\\frac{dy}{dx}$ by dividing through by $(3y^2 - 6x)$.',
        math_equation: '\\frac{dy}{dx} = \\frac{6y - 3x^2}{3y^2 - 6x} = \\frac{2y - x^2}{y^2 - 2x}',
        hint: 'Cancel the common factor of 3 from numerator and denominator.',
        common_pitfall: 'Leaving unsimplified fractions.',
      },
      {
        step_order: 5,
        instruction: 'Substitute the given point coordinates $x = 3, y = 3$ to find the numerical gradient.',
        math_equation: '\\left.\\frac{dy}{dx}\\right|_{(3,3)} = \\frac{2(3) - (3)^2}{(3)^2 - 2(3)} = \\frac{6 - 9}{9 - 6} = \\frac{-3}{3} = -1',
        hint: 'Insert $x=3$ and $y=3$ directly into the simplified gradient expression.',
        common_pitfall: 'Arithmetic mistakes with signs: note $(6-9 = -3)$ and $(9-6 = +3)$.',
      },
    ],
  },
  {
    id: 'jupeb-alg-001',
    topic: 'Algebra',
    subtopic: 'Partial Fractions',
    year: 'JUPEB 2023 Paper 1',
    question_text: 'Resolve into partial fractions: $\\frac{3x + 5}{(x - 1)(x + 2)}$.',
    difficulty_level: 1,
    key_concept: 'Linear non-repeated factors decomposition: $\\frac{P(x)}{(x-a)(x-b)} = \\frac{A}{x-a} + \\frac{B}{x-b}$',
    final_answer: '\\frac{8}{3(x - 1)} + \\frac{1}{3(x + 2)}',
    multiple_choice_options: [
      { label: 'A', text: '$\\frac{8}{3(x-1)} + \\frac{1}{3(x+2)}$', is_correct: true },
      { label: 'B', text: '$\\frac{2}{x-1} + \\frac{1}{x+2}$', is_correct: false },
      { label: 'C', text: '$\\frac{5}{x-1} - \\frac{2}{x+2}$', is_correct: false },
      { label: 'D', text: '$\\frac{8}{x-1} + \\frac{1}{x+2}$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Set up the partial fraction decomposition identity with undetermined constants $A$ and $B$.',
        math_equation: '\\frac{3x + 5}{(x - 1)(x + 2)} \\equiv \\frac{A}{x - 1} + \\frac{B}{x + 2}',
        hint: 'Since both denominator factors are distinct linear factors, assign constant numerators $A$ and $B$.',
        common_pitfall: 'Using a linear numerator like $Ax + B$ for a simple linear denominator.',
      },
      {
        step_order: 2,
        instruction: 'Multiply both sides by the common denominator $(x - 1)(x + 2)$.',
        math_equation: '3x + 5 \\equiv A(x + 2) + B(x - 1)',
        hint: 'Clear fractions to obtain a polynomial identity valid for all $x$.',
        common_pitfall: 'Mismatched cross-multiplication (pairing $A$ with $(x-1)$ instead of $(x+2)$).',
      },
      {
        step_order: 3,
        instruction: 'Use the cover-up / substitution method: Set $x = 1$ to eliminate $B$ and solve for $A$.',
        math_equation: '3(1) + 5 = A(1 + 2) + B(0) \\implies 8 = 3A \\implies A = \\frac{8}{3}',
        hint: 'Choosing the root $x=1$ turns $(x-1)$ into zero, isolating $A$ immediately.',
        common_pitfall: 'Carefully compute $3(1) + 5 = 8$, not 6.',
      },
      {
        step_order: 4,
        instruction: 'Set $x = -2$ to eliminate $A$ and solve for $B$.',
        math_equation: '3(-2) + 5 = A(0) + B(-2 - 1) \\implies -6 + 5 = -3B \\implies -1 = -3B \\implies B = \\frac{1}{3}',
        hint: 'Choosing $x = -2$ zeros out $(x+2)$, giving $-1 = -3B$.',
        common_pitfall: 'Double negative errors: $-1 / -3 = +1/3$.',
      },
      {
        step_order: 5,
        instruction: 'Substitute $A = \\frac{8}{3}$ and $B = \\frac{1}{3}$ back into the original decomposition.',
        math_equation: '\\frac{3x + 5}{(x - 1)(x + 2)} = \\frac{8}{3(x - 1)} + \\frac{1}{3(x + 2)}',
        hint: 'Place the denominator 3 neatly next to the binomial factors in standard algebraic format.',
        common_pitfall: 'Writing stacked fractions $\\frac{\\frac{8}{3}}{x-1}$ without simplifying.',
      },
    ],
  },
  {
    id: 'jupeb-alg-002',
    topic: 'Algebra',
    subtopic: 'Binomial Expansion & Constant Term',
    year: 'JUPEB 2022 Paper 1',
    question_text: 'Find the term independent of $x$ (the constant term) in the binomial expansion of $\\left(2x - \\frac{1}{x^2}\\right)^9$.',
    difficulty_level: 2,
    key_concept: 'General term in binomial expansion: $T_{r+1} = \\binom{n}{r} a^{n-r} b^r$. The term independent of $x$ has total power $x^0$.',
    final_answer: 'T_4 = -5376',
    multiple_choice_options: [
      { label: 'A', text: '$5376$', is_correct: false },
      { label: 'B', text: '$-5376$', is_correct: true },
      { label: 'C', text: '$-672$', is_correct: false },
      { label: 'D', text: '$672$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Write down the general $(r+1)^{\\text{th}}$ term formula for $(a + b)^n$ with $n = 9$.',
        math_equation: 'T_{r+1} = \\binom{9}{r} (2x)^{9-r} \\left(-\\frac{1}{x^2}\\right)^r',
        hint: 'Identify $a = 2x$, $b = -x^{-2}$, and $n = 9$. Pay close attention to the negative sign in $b$!',
        common_pitfall: 'Omitting the minus sign in $\\left(-\\frac{1}{x^2}\\right)$.',
      },
      {
        step_order: 2,
        instruction: 'Separate the numerical coefficients from the powers of $x$.',
        math_equation: 'T_{r+1} = \\binom{9}{r} 2^{9-r} (-1)^r \\cdot x^{9-r} \\cdot x^{-2r} = \\binom{9}{r} 2^{9-r} (-1)^r \\cdot x^{9 - 3r}',
        hint: 'Use exponent laws: $(x^{-2})^r = x^{-2r}$, and $x^{9-r} \\cdot x^{-2r} = x^{9 - 3r}$.',
        common_pitfall: 'Incorrectly adding powers of $x$ (e.g. thinking $(9-r) - 2r = 9 - r$).',
      },
      {
        step_order: 3,
        instruction: 'Set the exponent of $x$ equal to 0 to find the value of $r$ corresponding to the constant term.',
        math_equation: '9 - 3r = 0 \\implies 3r = 9 \\implies r = 3',
        hint: 'For a term to be independent of $x$, its power must be $x^0 = 1$.',
        common_pitfall: 'Remember that $r=3$ means it is the 4th term ($T_{3+1} = T_4$).',
      },
      {
        step_order: 4,
        instruction: 'Evaluate the combinatorial coefficient $\\binom{9}{3}$.',
        math_equation: '\\binom{9}{3} = \\frac{9 \\times 8 \\times 7}{3 \\times 2 \\times 1} = 3 \\times 4 \\times 7 = 84',
        hint: 'Cancel factors systematically: $9/3 = 3$ and $8/2 = 4$.',
        common_pitfall: 'Multiplication errors when calculating factorial combinations.',
      },
      {
        step_order: 5,
        instruction: 'Compute the full numerical value of $T_4$ by substituting $r = 3$.',
        math_equation: 'T_4 = 84 \\cdot 2^{9-3} \\cdot (-1)^3 = 84 \\cdot 2^6 \\cdot (-1) = 84 \\cdot 64 \\cdot (-1) = -5376',
        hint: 'Note that $(-1)^3 = -1$, which makes the final constant term negative.',
        common_pitfall: 'Missing the negative sign from $(-1)^3$, giving $+5376$ instead of $-5376$.',
      },
    ],
  },
  {
    id: 'jupeb-trig-001',
    topic: 'Trigonometry',
    subtopic: 'Trigonometric Equations',
    year: 'JUPEB 2022 Paper 2',
    question_text: 'Solve the equation $2\\cos^2 x + 3\\sin x - 3 = 0$ for $0^\\circ \\le x \\le 360^\\circ$.',
    difficulty_level: 2,
    key_concept: 'Pythagorean trigonometric identity: $\\cos^2 x = 1 - \\sin^2 x$, reducing to a quadratic in $\\sin x$.',
    final_answer: 'x \\in \\{30^\\circ, 90^\\circ, 150^\\circ\\}',
    multiple_choice_options: [
      { label: 'A', text: '$\\{30^\\circ, 150^\\circ\\}$', is_correct: false },
      { label: 'B', text: '$\\{30^\\circ, 90^\\circ, 150^\\circ\\}$', is_correct: true },
      { label: 'C', text: '$\\{60^\\circ, 120^\\circ\\}$', is_correct: false },
      { label: 'D', text: '$\\{90^\\circ, 270^\\circ\\}$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Use the identity $\\cos^2 x = 1 - \\sin^2 x$ to rewrite the equation purely in terms of $\\sin x$.',
        math_equation: '2(1 - \\sin^2 x) + 3\\sin x - 3 = 0',
        hint: 'To solve trigonometric equations with mixed sin and cos, express all terms in the same trigonometric ratio.',
        common_pitfall: 'Forgetting to distribute the 2 over $(1 - \\sin^2 x)$.',
      },
      {
        step_order: 2,
        instruction: 'Expand and rearrange into a standard quadratic form $a s^2 + b s + c = 0$.',
        math_equation: '2 - 2\\sin^2 x + 3\\sin x - 3 = 0 \\implies -2\\sin^2 x + 3\\sin x - 1 = 0 \\implies 2\\sin^2 x - 3\\sin x + 1 = 0',
        hint: 'Multiply the entire equation by $-1$ to make the leading coefficient positive.',
        common_pitfall: 'Sign error when combining $2 - 3 = -1$.',
      },
      {
        step_order: 3,
        instruction: 'Factorize the quadratic in $\\sin x$.',
        math_equation: '(2\\sin x - 1)(\\sin x - 1) = 0',
        hint: 'Two numbers that multiply to $2 \\times 1 = 2$ and add to $-3$ are $-2$ and $-1$.',
        common_pitfall: 'Incorrect factoring pairs.',
      },
      {
        step_order: 4,
        instruction: 'Solve for the two possible values of $\\sin x$.',
        math_equation: '\\sin x = \\frac{1}{2} \\quad \\text{or} \\quad \\sin x = 1',
        hint: 'Set each factor to zero: $2\\sin x - 1 = 0 \\implies \\sin x = 1/2$; $\\sin x - 1 = 0 \\implies \\sin x = 1$.',
        common_pitfall: 'Neglecting one of the roots.',
      },
      {
        step_order: 5,
        instruction: 'Determine all angle solutions in the given domain $0^\\circ \\le x \\le 360^\\circ$.',
        math_equation: '\\text{For } \\sin x = \\frac{1}{2}: x = 30^\\circ, \\quad 180^\\circ - 30^\\circ = 150^\\circ; \\quad \\text{For } \\sin x = 1: x = 90^\\circ',
        hint: 'Sine is positive in Quadrant 1 and Quadrant 2 (CAST rule).',
        common_pitfall: 'Missing the second quadrant solution $150^\\circ$.',
      },
    ],
  },
  {
    id: 'jupeb-vec-001',
    topic: 'Vectors & Mechanics',
    subtopic: 'Scalar Dot Product & Angles',
    year: 'JUPEB 2021 Paper 2',
    question_text: 'Find the angle $\\theta$ between the vectors $\\vec{u} = 2\\hat{i} - \\hat{j} + 2\\hat{k}$ and $\\vec{v} = 4\\hat{i} + 3\\hat{k}$.',
    difficulty_level: 2,
    key_concept: 'Scalar (Dot) Product: $\\vec{u} \\cdot \\vec{v} = |\\vec{u}||\\vec{v}| \\cos\\theta \\implies \\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}||\\vec{v}|}$',
    final_answer: '\\theta = \\arccos\\left(\\frac{14}{15}\\right) \\approx 21.04^\\circ',
    multiple_choice_options: [
      { label: 'A', text: '$\\arccos(14/15) \\approx 21.0^\\circ$', is_correct: true },
      { label: 'B', text: '$\\arccos(8/15) \\approx 57.8^\\circ$', is_correct: false },
      { label: 'C', text: '$\\arccos(2/3) \\approx 48.2^\\circ$', is_correct: false },
      { label: 'D', text: '$90.0^\\circ$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Calculate the scalar dot product $\\vec{u} \\cdot \\vec{v}$.',
        math_equation: '\\vec{u} \\cdot \\vec{v} = (2)(4) + (-1)(0) + (2)(3) = 8 + 0 + 6 = 14',
        hint: 'Notice that $\\vec{v}$ has no $\\hat{j}$ component, meaning its coefficient is 0.',
        common_pitfall: 'Multiplying $(-1)$ by $3$ by assuming the components align without checking unit vectors.',
      },
      {
        step_order: 2,
        instruction: 'Calculate the magnitude $|\\vec{u}|$.',
        math_equation: '|\\vec{u}| = \\sqrt{2^2 + (-1)^2 + 2^2} = \\sqrt{4 + 1 + 4} = \\sqrt{9} = 3',
        hint: 'The magnitude of a 3D vector is $\\sqrt{x^2 + y^2 + z^2}$. Note $(-1)^2 = +1$.',
        common_pitfall: 'Squaring $-1$ as $-1$ instead of $+1$.',
      },
      {
        step_order: 3,
        instruction: 'Calculate the magnitude $|\\vec{v}|$.',
        math_equation: '|\\vec{v}| = \\sqrt{4^2 + 0^2 + 3^2} = \\sqrt{16 + 9} = \\sqrt{25} = 5',
        hint: 'This is a standard 3-4-5 right triangle vector.',
        common_pitfall: 'Arithmetic slip under the square root.',
      },
      {
        step_order: 4,
        instruction: 'Substitute into the angle formula $\\cos\\theta = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}||\\vec{v}|}$.',
        math_equation: '\\cos\\theta = \\frac{14}{(3)(5)} = \\frac{14}{15} \\implies \\theta = \\arccos\\left(\\frac{14}{15}\\right) \\approx 21.04^\\circ',
        hint: 'Divide the dot product by the product of both magnitudes ($3 \\times 5 = 15$).',
        common_pitfall: 'Forgetting to take the inverse cosine $\\arccos$.',
      },
    ],
  },
  {
    id: 'jupeb-coord-001',
    topic: 'Coordinate Geometry',
    subtopic: 'Circles & Tangents',
    year: 'JUPEB 2023 Paper 2',
    question_text: 'Find the equation of the tangent line to the circle $(x - 2)^2 + (y + 1)^2 = 25$ at the point $P(5, 3)$.',
    difficulty_level: 2,
    key_concept: 'The tangent to a circle at point $P$ is perpendicular to the radial line connecting the center $C(h,k)$ to $P(x_1,y_1)$: $m_{\\text{tangent}} = -\\frac{1}{m_{\\text{radius}}}$.',
    final_answer: '3x + 4y - 27 = 0',
    diagram_config: {
      type: 'function-plot',
      title: 'Circle (x-2)² + (y+1)² = 25 and Tangent 3x + 4y - 27 = 0',
      explanation: 'Geometric plane showing circle center C(2, -1), point of tangency P(5, 3), and perpendicular tangent line.',
      xDomain: [-5, 9],
      yDomain: [-8, 6],
      curves: [
        {
          fn: '-0.75 * x + 6.75', // Tangent line: y = (-3x + 27)/4 = -0.75x + 6.75
          color: '#38bdf8',
        },
        {
          fn: '(4/3) * (x - 2) - 1', // Radial line: through (2, -1) and (5, 3)
          color: '#a855f7',
        },
      ],
      points: [
        { x: 2, y: -1, label: 'Center C(2, -1)' },
        { x: 5, y: 3, label: 'Point of Tangency P(5, 3)' },
      ],
      matplotlibPythonScript: `import numpy as np
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(7, 7), facecolor='#060a12')
ax.set_facecolor('#060a12')

# Draw Circle (x-2)^2 + (y+1)^2 = 25
circle = plt.Circle((2, -1), 5, color='#10b981', fill=False, lw=2, label='$(x-2)^2 + (y+1)^2 = 25$')
ax.add_patch(circle)

# Tangent line: 3x + 4y - 27 = 0 => y = (27 - 3x)/4
x_vals = np.linspace(-2, 8, 200)
y_tangent = (27 - 3 * x_vals) / 4
plt.plot(x_vals, y_tangent, color='#38bdf8', lw=2, label='Tangent: $3x + 4y - 27 = 0$')

# Radial line connecting C(2,-1) to P(5,3)
plt.plot([2, 5], [-1, 3], color='#a855f7', lw=1.8, linestyle='--', label='Radius $r=5$')

# Points
plt.scatter([2, 5], [-1, 3], color=['#fbbf24', '#f43f5e'], s=60, zorder=5)
plt.text(2.2, -1.3, 'C(2, -1)', color='#fbbf24', fontweight='bold')
plt.text(5.2, 3.1, 'P(5, 3)', color='#f43f5e', fontweight='bold')

plt.xlim(-5, 9)
plt.ylim(-8, 6)
plt.gca().set_aspect('equal', adjustable='box')
plt.title('JUPEB Coordinate Geometry - Circle Tangency', color='white', fontsize=12, pad=12)
plt.grid(True, linestyle=':', alpha=0.3, color='#334155')
plt.tick_params(colors='#94a3b8')
plt.legend(facecolor='#0f172a', edgecolor='#334155', labelcolor='white')
plt.tight_layout()
plt.show()`,
    },
    multiple_choice_options: [
      { label: 'A', text: '$3x + 4y - 27 = 0$', is_correct: true },
      { label: 'B', text: '$4x - 3y - 11 = 0$', is_correct: false },
      { label: 'C', text: '$3x - 4y - 3 = 0$', is_correct: false },
      { label: 'D', text: '$5x + 3y - 25 = 0$', is_correct: false },
    ],
    steps: [
      {
        step_order: 1,
        instruction: 'Identify the coordinates of the center $C(h, k)$ from the circle equation.',
        math_equation: '(x - h)^2 + (y - k)^2 = r^2 \\implies C(h, k) = (2, -1)',
        hint: 'Compare with $(x-2)^2 + (y+1)^2 = 25$. Note $y+1 = y - (-1)$, so $k = -1$.',
        common_pitfall: 'Stating the center as $(-2, 1)$ by taking wrong signs.',
      },
      {
        step_order: 2,
        instruction: 'Compute the gradient $m_{\\text{radius}}$ of the normal/radius connecting center $C(2, -1)$ to $P(5, 3)$.',
        math_equation: 'm_{\\text{radius}} = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{3 - (-1)}{5 - 2} = \\frac{4}{3}',
        hint: 'Use the standard slope formula $\\frac{\\Delta y}{\\Delta x}$. Notice $3 - (-1) = 3 + 1 = 4$.',
        common_pitfall: 'Inverting slope as $\\frac{\\Delta x}{\\Delta y}$.',
      },
      {
        step_order: 3,
        instruction: 'Find the gradient $m_{\\text{tangent}}$ using the perpendicularity condition $m_1 m_2 = -1$.',
        math_equation: 'm_{\\text{tangent}} = -\\frac{1}{m_{\\text{radius}}} = -\\frac{1}{4/3} = -\\frac{3}{4}',
        hint: 'Take the negative reciprocal of the radial line gradient.',
        common_pitfall: 'Forgetting the negative sign or failing to invert the fraction.',
      },
      {
        step_order: 4,
        instruction: 'Use point-slope form $y - y_1 = m(x - x_1)$ with point $(5, 3)$.',
        math_equation: 'y - 3 = -\\frac{3}{4}(x - 5) \\implies 4(y - 3) = -3(x - 5)',
        hint: 'Multiply through by 4 to eliminate fractions immediately.',
        common_pitfall: 'Distributing $-3$ into $(x-5)$ as $-3x - 15$ instead of $-3x + 15$.',
      },
      {
        step_order: 5,
        instruction: 'Expand and rearrange into general linear form $Ax + By + C = 0$.',
        math_equation: '4y - 12 = -3x + 15 \\implies 3x + 4y - 27 = 0',
        hint: 'Bring all terms to the left hand side so the coefficient of $x$ is positive.',
        common_pitfall: 'Arithmetic slip: $-12 - 15 = -27$.',
      },
    ],
  },
];
