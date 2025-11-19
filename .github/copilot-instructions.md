## Purpose
Provide concise, project-specific guidance to AI coding agents working in this repository.

## Quick facts (discovered)
- Repo root contains only `README.md` with the single-line description: "This repo hosts a simple program to help with letter recognition."
- No source code, tests, CI configs, or build scripts were found in the workspace during inspection.

## How to be immediately productive
- First, read `README.md` and list missing artifacts needed to complete the user's request (language, model/data, scripts, tests).
- If required files are missing (source, requirements, dataset), ask the user one targeted question before scaffolding (e.g., "Do you want a Python project with a training script and unit tests?").

## Project-specific patterns and constraints
- Because the repository currently contains only a README, do NOT assume a language or framework. Always confirm:
  - preferred language (Python, JS, etc.)
  - whether the project needs ML model training or a simple rule-based recognizer
  - location and format of any input data

## Typical actions and examples
- If asked to implement a feature and the user confirms Python + ML:
  - create a `src/` package, a `requirements.txt`, and a minimal `scripts/train.py` and `scripts/predict.py`.
  - include a small `tests/test_smoke.py` that asserts the training script runs without error.
  - update `README.md` with usage examples and the commands to run tests.

## Developer workflows (when missing)
- No build/test commands were found. Before creating CI or tooling, confirm with the user which commands they expect (e.g., `pytest`, `python -m unittest`, `pip install -r requirements.txt`).

## Communication and safety
- When in doubt, ask a single clarifying question rather than scaffold a large change.
- List assumptions at the top of your PR or change description (language, dependency choices, data location).

## Where to look next in this repo
- `README.md` — starting point; contains the only discovered project description.

## Minimal commit & PR guidance
- Keep changes small and focused. If you scaffold a project, put scaffolding in a single commit and add a separate commit for implementation.
- Include a short README section describing how to run the new code and tests.

If anything here is unclear or you want a different default (for example, scaffold TypeScript instead of Python), ask the user before proceeding.
