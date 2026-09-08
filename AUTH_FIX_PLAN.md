# Authentication Fix Plan

## Phase 1: Inspection
- [ ] Inspect entire project structure (frontend + backend)
- [ ] Inspect backend: app.js, routes, controllers, models, middlewares
- [ ] Inspect frontend: routes, API config, Redux/state, screens
- [ ] Inspect .env files and environment variables
- [ ] Trace current login flow end-to-end

## Phase 2: Root Cause Analysis
- [ ] Identify why login always gives "Invalid credentials"
- [ ] Identify registration flow inconsistencies
- [ ] Identify routing gaps

## Phase 3: Implementation
- [ ] Fix backend login/registration logic
- [ ] Fix frontend API configuration
- [ ] Fix LoginScreen (add signup link, correct payload)
- [ ] Create/restructure CompanyRegistration/HRRegistration screen
- [ ] Fix SignupScreen (employee vs company registration)
- [ ] Fix React Router routes
- [ ] Fix auth state management (Redux/context)
- [ ] Fix protected routes
- [ ] Fix logout
- [ ] Add proper error handling
- [ ] Remove unused imports

## Phase 4: Verification
- [ ] Run frontend lint
- [ ] Run frontend build
- [ ] Run backend startup check
- [ ] Verify all 12 test scenarios
- [ ] Verify no broken features