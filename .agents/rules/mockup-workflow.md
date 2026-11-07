# Rule: Design Mockup Implementation Workflow

Whenever the user provides an HTML mockup, screenshot, or design reference to implement or convert:
1. **Always activate and follow the `mockup-to-vue-tailwind` skill**.
2. **Never skip Phase 1**: Read `design-map.md`, audit project tokens/components, and produce the 4-part report (Token map, Component map, Gaps/risks, File actions).
3. **Always STOP after Phase 1** and wait for the user's explicit approval before writing any code in Phase 2.
4. **Follow Phase 2 implementation priority strictly**: Existing component as-is → Extended component → Tailwind utilities with tokens → New small component (<200 lines) → Custom CSS only as a last resort.

