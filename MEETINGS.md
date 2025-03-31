### March 14th 2025

My preferred modules:

1. GDPR compliance (minor module);
	1. [x] Overlaps? 
2. WAF/ModSecurity (major module);
	1. [ ] Overlaps?
3. Framework or toolkit for frontend (minor module);
	1. [x] Overlaps?
4. User management (major module);
	1. [x] Overlaps?
5. Live chat (major module);
	1. [x] Overlaps?

# Meeting notes:

- Decision on modules:
- Who takes care of what modules?
- PR rule set established;
- squash and merge;
- merge main into your branch and test before everything;
- naming convention: pascal (e.g.: `thisIsPascal`)  
- naming convention for branches: name of feature ALL CAPS
### Rundown showdown
```
1. Project Setup and Architecture (Week 1)

Docker Environment: Set up your Docker configuration first since everything must run in containers
Project Structure: Establish your repository organization and folder structure
Tech Stack Initialization: Initialize your Node.js/Fastify backend and TypeScript frontend
Development Workflow: Configure git workflow, coding standards, and basic CI

2. Core Infrastructure (Weeks 1-2)

Database Setup: Configure SQLite and create basic schema
Authentication Framework: Implement basic user registration/login
Frontend Scaffolding: Set up your single-page application structure with routing
API Foundation: Create basic endpoints connecting frontend to backend

3. MVP Game Implementation (Weeks 2-3)

Basic Pong Game: Implement the core game mechanics (local 2-player mode)
Game UI: Create the fundamental game interface
Tournament System: Implement basic tournament structure

4. Feature Development (Weeks 3-6)
After establishing this foundation, you can branch out to implement your selected modules in roughly this order:

Complete User Management features
Remote Players functionality
AI Opponent
Live Chat
Stats Dashboards and Game Customization

Practical First Steps
The most efficient first sprint would involve:

Docker configuration - Get everyone able to run the same environment
Project skeleton - Set up both backend and frontend basic structure
CI/CD pipeline - Ensure seamless integration of everyone's work
Hello World connections between all components - Verify database, backend, and frontend can communicate

This approach follows the "walking skeleton" method - getting a minimal end-to-end implementation working before filling in the details. It helps identify integration problems early and gives the team confidence that the fundamental architecture works.
```

Agreed modules:

- framework for backend (web - major);
	- Felipe, Lauri
- AI opponent (AI-algo - major);
	- Tom
- another game (game - major)
    - Panu
- standard user management, authentication, users across tournaments (web - major);
	- Felipe, Lauri, Tom
- user and game stats dashboards (AI-algo - minor);
	- Panu, Lauri, Felipe
- use a database for the backend (web - minor);
	- Lauri
- use a framework or a toolkit to build the frontend (web - minor);
	- Felipe
- GDPR (cybersecurity - minor);
	- Felipe
- expanding browser compatibility (accessibility - minor);
	- Michael, Tom
- multiple languages (accessibility - minor);
	- Everyone (depends on research)


### Next things to be discussed:

1. database architecture;
2. Usage of Jira;

# Meeting March 31st 2025

- Panu's has showed his game and we have to choose:
1. Multiplayer will be playable in the tournament locally with two logged in player in one session [ ✅ ];
2. Multiplayer will only be playable with one session and guests will only have aliases [ ❌ ];

- Lauri will take care of API's to retrieve data from/to frontend for Panu's;
- 