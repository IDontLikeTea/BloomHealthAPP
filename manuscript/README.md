# Simulation Results & Parameters

This folder contains the manuscript detailing the scientific evaluation and simulation methodology behind the compassionate feedback design principles used in this application.

## The Paper
You can read the full study here:
- **[care-sim-paper-final.pdf](file:///c:/Users/chenc/code/compassionate_health_tracker/nextjs_space/manuscript/care-sim-paper-final.pdf)**

## Key Simulation Data & Findings

The manuscript describes a 60-day behavioral simulation comparing **Rigid** vs **Compassionate** feedback policies across 4 simulated user personality cohorts ($N = 400$ agents, 2,000 total trajectories per policy).

### Cohort Definitions & Parameters
| Cohort | Baseline Motivation ($M_0$) | Stress Sensitivity ($\lambda$) | Negative Appraisal Gain ($\alpha$) | Recovery Gain ($\beta$) |
| :--- | :---: | :---: | :---: | :---: |
| **Perfectionist** | 85 | 0.9 | 1.5 | 0.2 |
| **Habitual/Defensive** | 60 | 0.8 | 1.2 | 0.4 |
| **Resilient** | 75 | 0.5 | 0.5 | 0.9 |
| **Control** | 70 | 0.5 | 1.0 | 0.5 |

### 60-Day User Retention Results
Below is the comparison of user retention at Day 60 under both policies:

| Cohort | Rigid (Day 60) | Compassionate (Day 60) | Difference | Divergence Onset |
| :--- | :---: | :---: | :---: | :---: |
| **Perfectionist** | 24.7% | **56.0%** | **+31.3 pp** | Day 9 |
| **Habitual/Defensive** | 8.7% | **36.7%** | **+28.0 pp** | Day 4 |
| **Control** | 46.7% | **61.3%** | **+14.7 pp** | Day 16 |
| **Resilient** | 76.7% | **89.3%** | **+12.7 pp** | Day 52 |

### Key Takeaways
1. **Decoupling Action & Affect**: Under the Rigid feedback policy, dietary error and negative self-talk are tightly coupled ($r = 0.82$). Compassionate reframing decouples this interaction ($r = 0.35$), preventing temporary lapses from spiraling into total disengagement.
2. **Psychological Reactance**: For habitual/defensive users, rigid warnings trigger counter-regulatory eating behaviors (an average **12.4% increase** in caloric intake on the day following a warning), demonstrating that strict warnings can backfire.
