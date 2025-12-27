# Release v0.0.5

## Features
No new features.
## Tests
No test changes.
## Documentation
No documentation changes.
## Fixes
- fix: add base: '/socialbeats/' to vite.config.js

## Continuous integration (CI)
No CI changes.
## Other changes
- Merge pull request #38 from SocialBeats/develop

## Full commit history

For full commit history, see [here](https://github.com/SocialBeats/frontend/compare/v0.0.4...v0.0.5).

# Release v0.0.4

## Features
- feat: adapt ui according to key attribute removal
- feat: new global beat player
- feat: cover, wave and download feats
- feat: new email pages and routes
- feat: add play button in playlists details to reproduce beats
- feat: add initial version of playlistDetails
- feat: add initial version of playlistDetails screen
- feat: finish public playlists screen
- feat: add initial version of user playlists screen
- feat: add create playlists button to myPlaylist screen
- feat: add editplaylist and myplaylistsviews views
- feat: add complete create playlist screen
- feat: add prepath to api-routes in order to communicate properly with api-gateway
- feat: add delete my rating view (mock data)
- feat: allow edit rating (stars)
- feat: add edit my rating view (mock data)
- feat: add create my rating view (mock data)
- feat: explore page first version including top played beats, recent beats and advance search
- feat: add my rating view (mock data)
- feat: add rating list view (mock data)
- feat: add rating service endpoints
- feat: add edit comments view (mock data)
- feat: add delete comments view (mock data)
- feat: improved visibility and download section
- feat: add create comments view (mock data)
- feat: finish list comments view (mock data)
- feat: add pagination in list comments view and improve styles
- feat: add first version of list comments with mock data
- feat: replaced emojis for icons and added drag and drop for audio upload
- feat: add first version of listComments
- feat: add comment service endpoints
- feat: add initial version of playlistDetails screen
- feat: add initial versions of MyPlaylists, UserPlaylists and PublicPlaylists screens
- feat: add editplaylist screen
- feat: add createPlaylist screen
- feat: add playlistService endpoints

## Tests
No test changes.
## Documentation
No documentation changes.
## Fixes
- fix: delete base url from vite.config.js
- fix: minnor changes
- fix: fix error of white comments in ratings
- fix: change beat visibility to Owner only
- fix: minnor changes on download button
- fix: change beat search bar for global search bar
- fix: remove Beat pricing atributes and minnor logical view changes
- fix: fix comment mensage in rating
- fix: beat player justified
- fix: removed unused attributes
- fix: currency selector overflow
- fix: unified styles
- fix: improved css management avoiding duplicity
- fix: improved user experience with drag and drop component
- fix: basic beat information  section improved
- fix: improved basic beat information section
- fix: delete .env from git tracking
- fix: fix dashboards imports errors

## Continuous integration (CI)
No CI changes.
## Other changes
- Merge pull request #37 from SocialBeats/develop
- Merge pull request #36 from SocialBeats/feat/beats-download
- Merge branch 'develop' into feat/beats-download
- Merge branch 'feat/beats-download' of https://github.com/SocialBeats/frontend into feat/beats-download
- Merge pull request #35 from SocialBeats/feat/email-pages
- Merge remote-tracking branch 'origin/feat/beats-download' into feat-playlists-views
- Merge remote-tracking branch 'origin/develop' into feat-playlists-views
- style: add public playlists pagination css
- Merge remote-tracking branch 'origin/develop' into feat-playlists-views
- style: adapt playlists views css to be always dark theme
- Merge remote-tracking branch 'origin/develop' into feat-playlists-views
- style: fix pagination input width
- style: center edit buttons in comments edit view
- Merge branch 'develop' into feat/beats-download
- Merge branch 'develop' into feat/ratings-views
- Merge branch 'develop' into feat/ratings-views
- style: adjust delete comments modal buttons to app styles
- Merge branch 'develop' into feat/comments-views
- Merge branch 'develop' into feat/comments-views
- style: improve list comments styles
- Merge branch 'develop' into feat/comments-views
- style: change favicon
- Merge remote-tracking branch 'origin/feat/P3/beat-page' into feat-playlists-views
- chore: restructure playlists css files
- chore: add skeleton for playlist views development

## Full commit history

For full commit history, see [here](https://github.com/SocialBeats/frontend/compare/v0.0.3...v0.0.4).

# Release v0.0.3

## Features
- feat: add random quote fetching functionality to ViewDashboard
- feat: implement number formatting utility and update widgets to use formatted values; enhance SpiderWidget to accept core metrics
- feat: steps profile verification (except for identity verification)
- feat: added new endpoints in profile service and fix profile section
- feat: add disabled state and selection badge for widgets in AddWidgetModal; integrate existing widgets into modal
- feat: add Floating Action Button (FAB) for adding widgets; implement visibility toggle based on header button visibility
- feat: update BeatsPositionWidget to display timestamp of first beat and improve widget title and description
- feat: add bump animation to BPM widget based on BPM value
- feat: enhance BPM widget with new speedometer visualization and improved layout
- feat: enhance BPM widget with improved styling and layout adjustments
- feat: add new widgets and enhance dashboard metrics
- feat: Enhance widget management with loading and error handling for dashboard widgets
- feat: Reimplement dashboard widget management with new AddWidgetModal and widget types
- feat: Add success and error modals for dashboard creation and update processes
- feat: Integrate API calls for fetching, deleting, and updating dashboards
- feat: added studies section
- feat: add ProfileCertifications component with S3 upload functionality
- feat: integrate S3 avatar upload
- feat: Add .env to .gitignore for environment variable management
- feat: implement routes to visit profiles
- feat: load user profile in NavBar
- feat: enhance profile editing functionality
- feat: profile page in frontend (preliminary)
- feat: List Beats in CreateDashboard component

## Tests
No test changes.
## Documentation
- docs: add LICENSE

## Fixes
- fix: add base url to frontend
- fix: refactor RatioWidget styles for improved layout and responsiveness; update CSS classes and structure
- fix: enhance widget layout and styling; add responsive span classes for Decibels and Ratio widgets
- fix: update BadgeWidget and GaugeWidget styles for improved layout; add new widget span class for 'apertura' type in ViewDashboard
- fix: add full-width span class for widgets; update DecibelsWidget for improved layout and accessibility
- fix: refactor SimpleNumberWidget and BeatsPositionWidget for improved structure and styling; add utility classes for better layout
- fix: enhance widget styles for consistent sizing and layout; add utility class for equal height widgets
- fix: add styling to prevent title wrapping in ProgressBarWidget for consistent height
- fix: update ProgressBarWidget styling for consistent sizing and layout
- fix: enhance ChromaWidget and KeyWidget for improved responsiveness and layout; adjust ViewDashboard for better section alignment
- fix: refactor dashboard widgets with new styles and structure; replace MetricsWidgets.css with individual stylesheets for better maintainability
- fix: implement KeyWidget with Circle of Fifths visualization and update styling for improved layout
- fix: enhance widget styling and layout for improved visualization and user experience
- fix: navbar overflow
- fix: prevent duplicate tags in handleAddTag function

## Continuous integration (CI)
No CI changes.
## Other changes
- Merge pull request #34 from SocialBeats/develop
- Merge pull request #33 from SocialBeats/feat/quotable
- Merge branch 'develop' into feat/quotable
- Merge pull request #32 from SocialBeats/feat/widget-visualization
- Merge pull request #31 from SocialBeats/feat/profile-steps-verification
- Merge pull request #30 from SocialBeats/feature/fix-profile-navbar
- Merge pull request #29 from SocialBeats/feat/crud-widgets
- Merge pull request #26 from SocialBeats/feat/create-dashboard
- Fix error while merging
- Merge pull request #24 from SocialBeats/feat/s3-profile-integration
- Merge branch 'develop' into feat/s3-profile-integration
- Merge pull request #25 from SocialBeats/feat/profile-studies
- Update src/components/profile/ProfileStudiesSection.css
- Update src/components/profile/StudiesModal.jsx
- Update src/components/ui/Modal.jsx
- Update src/components/profile/StudiesModal.jsx
- Update src/components/profile/StudiesModal.css
- Merge pull request #23 from SocialBeats/feat/s3-profile-integration
- refactor: profile page refactor
- Merge pull request #22 from SocialBeats/copilot/sub-pr-15-one-more-time
- Merge branch 'feat/s3-profile-integration' into copilot/sub-pr-15-one-more-time
- Remove unnecessary catch clauses that only re-throw errors
- Use dynamic isOwnProfile value from hook instead of hardcoding
- Fix code review issues: prevent infinite re-render and remove duplicate setSaving
- Merge pull request #15 from SocialBeats/feat/profile-page
- Refactor Profile components to eliminate code duplication
- Merge pull request #21 from SocialBeats/copilot/sub-pr-15-yet-again
- Merge branch 'feat/profile-page' into copilot/sub-pr-15-yet-again
- Merge pull request #19 from SocialBeats/copilot/sub-pr-15-again
- Merge pull request #18 from SocialBeats/copilot/sub-pr-15
- refactor: extract magic number to MAX_TAGS constant
- Initial plan
- refactor: extract magic number to MAX_ABOUT_ME_LENGTH constant
- Initial plan
- Update src/pages/app/profile/ProfileView.jsx
- Update src/pages/app/profile/Profile.jsx
- Initial plan
- Initial plan
- Merge remote-tracking branch 'origin/main' into develop
- Merge pull request #17 from SocialBeats/feat/crud-dashboards
- Merge branch 'develop' into feat/crud-dashboards

## Full commit history

For full commit history, see [here](https://github.com/SocialBeats/frontend/compare/v0.0.2...v0.0.3).

# Release v0.0.2

## Features
No new features.
## Tests
No test changes.
## Documentation
No documentation changes.
## Fixes
No fixes added.
## Continuous integration (CI)
- ci: add Dockerfile-dev

## Other changes
No other changes.
## Full commit history

For full commit history, see [here](https://github.com/SocialBeats/frontend/compare/v0.0.1...v0.0.2).

# Release v0.0.1

## Features
- feat: add dynamic variables with .env
- feat: make frontend able to have runtime env variables
- feat: token rotation when 401
- feat: flujo de autenticación básico.
- feat: added validation to file format avoiding invalid format tricks
- feat: s3 uplaod and retrieve integration
- feat: error management
- feat: login workflow and token rotation
- feat: Delete Beat button added to DetailBeatPage
- feat: Implement analytics service endpoints for beat metrics, dashboards, and widgets
- feat: Add environment configuration example
- feat: Update and Create Beat form integrated
- feat: implement register service in frontend
- feat: register and login mocked
- feat: front connected to back in BeatsListPage and BeatDetailPage
- feat: connect front with back in MyBeatsListView
- feat: My Beats view functional prototipe
- feat: functional prototipe of Beats list
- feat: Dasboards and widgets views
- feat: Added new basic components and layouts
- feat: Initial layouts, pages and components
- feat: Stablish basic frontend structure

## Tests
No test changes.
## Documentation
- docs: Update installation instructions to use pnpm
- docs: Update README to streamline setup instructions
- docs: Update README.md

## Fixes
- fix: dashboards import errors
- fix: beats upload frontend updated and refined
- fix: Update import for CreateDashboard component to CreateDashboards
- fix: delete .env
- fix: Change CreateDashboards component name
- fix: added style to BeatDetailPage
- fix: minnor styles changes for BeatListPage
- fix: Implement changes in public layout, landing page, dashboard, and core UI components with updated branding and global styles.
- fix: Update import paths for CSS files to use the correct styles directory

## Continuous integration (CI)
- ci: add Dockerfile and release workflow
- ci: add conventional commits workflow
- ci: add issue templates

## Other changes
- Merge pull request #16 from SocialBeats/develop
- Merge pull request #13 from SocialBeats/feat/P3/beat-page
- Merge branch 'develop' into feat/P3/beat-page
- Merge pull request #14 from SocialBeats/feat/authenticated-workflow
- Merge branch 'develop' into feat/authenticated-workflow
- chore: add some dependencies versions to package-lock.json
- Merge remote-tracking branch 'origin/main' into develop
- Merge branch 'develop' into feat/P3/beat-page
- Merge branch 'develop' into feat/P3/beat-page
- Merge branch 'feat/P3/beat-page' of https://github.com/SocialBeats/frontend into feat/P3/beat-page
- Merge pull request #12 from SocialBeats/feat/analysis-service-endpoints
- Merge pull request #11 from SocialBeats/feat/login
- Merge branch 'develop' into feat/P3/beat-page
- Merge pull request #10 from SocialBeats/feat/analysis-service-endpoints
- Merge pull request #9 from SocialBeats/feat/auth-frontend
- Merge remote-tracking branch 'origin/develop' into feat/P3/beat-page
- style: add padding in register/login page
- style: updated literals
- develop update
- Merge pull request #8 from SocialBeats/feat/dashboards
- Merge pull request #7 from SocialBeats/feat/initial-design
- initial commit
- Initial commit

## Full commit history

For full commit history, see [here](https://github.com/SocialBeats/frontend/compare/...v0.0.1).

