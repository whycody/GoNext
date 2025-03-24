# GoNext
![GoNextLogo](/Docs/imgs/GoNext.png)

![Stars](https://img.shields.io/github/stars/gonext?style=flat-square)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-45.5%25-blue?style=flat-square)
![Python](https://img.shields.io/badge/TypeScript-54.5%25-blue?style=flat-square)
![Repo Size](https://img.shields.io/github/repo-size/whycody/gonext?style=flat-square)

![Created At](https://img.shields.io/badge/created%20at-march%202025-informational?style=flat-square)
![Release Date](https://img.shields.io/badge/release%20date-june%202025-yellow?style=flat-square)

## Contents

- [Team](#team)
- [Vision and Scope](#vision-and-scope)
- [Requirements](#requirements)
    - [Use case diagram](#use-case-diagram)
    - [Mockups](#mockups)
- [Definition of Done](#definition-of-done)
- [Architecture and Design](#architecture-and-design)
    - [Domain model](#domain-model)
- [Risk Plan](#risk-plan)
- [Pre-Game](#pre-game)
- [Release plan](#release-plan)
    - [Release 1](#release-1)
    - [Release 2](#release-2)
- [Produkt Increments](#product-increments)
    - [Sprint 1](#sprint-1)
    - [Sprint 2](#sprint-2)


## Team

- Yauheni Budzko - s217623 - s217623@sggw.edu.pl
- Oktawian Kausz - s217601 - s217601@sggw.edu.pl
- Izabela Kołodziejska - s217260 - s217260@sggw.edu.pl
- Marcin Galewski - s220252 - s220252@sggw.edu.pl
- Paweł Hebda - s217626 - s217626@sggw.edu.pl

***

## Vision and Scope

### Vision statement

<!--The app is designed to be minimalistic and user-friendly, allowing easy task management and progress tracking. Users can set schedules, monitor completion percentages, and maintain streaks for consistent habits. The app rewards task and habit completions with badges.-->
<!-- The goal of this project is to create an app that will help them remember their resolutions, habits and budgeting goals. It will be an easy way of keeping track of your achievements providing a sense of acomplishement with every finished task. Visualizing your spending will also help with sticking to your saving goals and enable you to track your expenses. We want to help others and ourselves stick to our goals and live the best life we can. -->
The purpose of the project is to create a mobile application that manages the prioretary list of user tasks and tasks of groups to which the user belongs.

### Functions

Registration/Logging in;

Creating tasks;

Prioritising the tasks;

Creating groups/Managing groups;

### Assumptions

Staying organized has never been easier with this intuitive to-do list app. Designed for individuals who need to manage their daily tasks efficiently, the app helps users stay on top of responsibilities, deadlines, and personal goals. Users can create and prioritize tasks to focus on what matters most. Whether it's managing work assignments, planning events, or keeping track of daily errands, the app ensures everything stays in one place. Collaboration is seamless with group task management. Users can create shared lists, assign tasks, and track progress, making teamwork more efficient. Whether coordinating with colleagues, planning trips with friends, or managing household chores, this feature simplifies organization. usWith a clean and user-friendly interface, the app reduces stress by keeping everything structured and accessible, making daily life more productive and hassle-free.

***

## Requirements

### Use Case Diagram

![Use case diagram](/Docs/imgs/use_case.png)

### Functions' description

Registration/Logging in:

- User Authentication: Secure login and registration process.

Creating Tasks:

- Task Input: Users can create tasks with titles, descriptions, and deadlines.

Prioritizing Tasks:

- Priority Levels: Mark tasks as high, medium, or low priority.

Creating Groups/Managing Groups:

- Group Creation: Users can form groups for task collaboration.
- Role Management: Assign roles such as admin, member, or viewer within groups.
- Task Sharing: Ability to assign and track group tasks collectively.

***

### Mockups

### User Story 1

<!--![User Story 1](imgs/1_updated.png) - wzór linka do User Story 1-->

### User Story 2 

<!--![User Story 2](imgs/2_updated.png) - wzór linka do User Story 2-->

***

### User Stories

- User story 1(Registration/Logging in): As a user, I want to register/log in to the application, so that I can use it for my personal purposes.
- User story 2(Creating tasks): As a user, I want to create tasks, so that I keep track on my personal objectives.
- User story 3(Managing tasks): As a user, I want to assign a priority level to a task, edit it, or delete it so that I have a clear overview of all task details.
- User story 4(Creating groups): As a user, I want to create a group so that I can collaborate on tasks with other group members.
- User story 5(Managing groups): As a group admin, I want to set other members as admins or remove them from the group so that I can maintain proper group management.

***

## Definition of Done
> [!NOTE]  
> 
> The Definition of Done is a set of criteria that must be performed for a particular User Story to be considered “done”.

1. All tasks completed
2. US is accepted by the client  
3. The code merged into the main branch  
***

## Architecture and Design

### Domain model

<!--![Domain Model](imgs/ModelodeDominio.PNG)-->

***

## Risk Plan

### Success Threshold 

<!---
The project fails if:
 Essential features such as habit tracking, visual progress insights, task and habit management, reminders, and goal setting are incomplete or not functioning as intended.
Users find it difficult to navigate the app or encounter usability issues, leading to dissatisfaction and disengagement.
Reminders are unreliable, causing users to miss their tasks and habits frequently.
Milestone tracking for goals is confusing or not visually represented clearly, leading to user frustration.

- The "must" user stories are not developed
- The app is not in a working condition upon release.
The team is not satisfied with the app and their work on the project, based on a questionare at the last meeting before final release. -->

The project is considered to be successful if:
<!--- By the final release date, all essential features, namely habit tracking, task and habit management and reminders, are fully implemented and pass acceptance tests without critical defects.
Users find the app intuitive, user-friendly, and engaging, leading to positive feedback and a high level of satisfaction.
Reminders are delivered accurately and on time, ensuring users can effectively manage their tasks and habits.
Milestone tracking for goals is visually appealing, easy to understand, and provides users with a sense of achievement and progress. -->

- All user stories are completed, including assigned tasks.
- All team members contributed equally to the project.
- The team is satisfied with the application and their work on the project,

<!-- - The interface of the app it appealing to most group members and clients. -->

### Risk List

<!-- - RSK1 - PxI: 4x5=20; Inaccurate Time and Effort Estimations
  - Risk: The team lacks experience in estimating the time and effort required for tasks, leading to underestimations or overestimations, resulting in unforeseen project delays.
  - Impact: 5
  - Likelihood: 4 -->
  - RSK1 - PxI: 4×4=16; Unequal Contribution from Team Members
    - Risk: Some team members may take on more responsibilities than others, causing workload imbalance and potential dissatisfaction.
    - Impact: 4
    - Likelihood: 4

  - RSK2 - PxI: 4×3=12; Poor User Adoption Due to Non-Intuitive UI/UX
    - Risk: If the app’s interface is not user-friendly, users may abandon it quickly.
    - Impact: 4
    - Likelihood: 3

  - RSK3 - PxI: 5×4=20; Security Vulnerabilities
    - Risk: Improper handling of security mechanisms could lead to security breaches, such as unauthorized access or data leaks.
    - Impact: 5
    - Likelihood: 4

### Actions for risk mitigations (PxI>=20)

<!-- - R1 - Generative IA (LLM) can hallucinate:
    - Action: Provide users knowlegde of the limitations of generative AI and address potential inaccuracies in outputs.
    - Action: Keep the LLM updated with the latest information, secure version and best practices to minimize inaccuracies.
    - Action: Provide the LLM with a structured template that includes accurate user information and other essential details. -->
  - R3 - Security Vulnerabilities in Authentication Flow:
    - Action: Use secure authentication practices.
    - Action: Perform security audits and penetration testing before release.


## Pre-Game

### Sprint 0 Plan

- Goal: project description
- Dates: from 10.03 to 17.03, 1 week
- Sprint 0 Tasks:
    - Task1 - Write the Team
    - Task2 - Write the Vision and Scope
    - Task3 - Write the Requirements
    - Task4 - Write DoD
    - Task5 - Write the Architecture and Design
    - Task6 - Write the Risk Plan
    - Task7 - Write the Pre-Gane
    - Task8 - Write Release Plan
    - Task9 - Write Product increments
    - Task10 - Create US, estimate difficulty(SML), prioretize(MoSCoW), sort
    - Task11 - Create a repository

***

## Release Plan

### Release 1

- Goal: We define the most important features of the project that are necessary for the minimum operation of the application: <!-- MVP - Developed US1, US3, US4, US6 with a working interface. -->
    - Registration
    - Logging in
    - Creating tasks
    - Managing tasks
- Date: 16.04
- Release: V1.0

***

### Release 2

- Goal: Groups functionality, admin role:<!-- Final release – Developed US2 and US5. The interface is aestheaticaly pleasing and intuitive. -->
    - Creating groups
    - Managing groups
- Date: 16.05
- Release: V2.0

***

## Product Increments
### Sprint 1

#### Sprint Plan

- Goal: Create the base architecture of the app and basic interface.

    - Registration
    - Logging in
    - In-App navigation
    - Initial task creation

- Date: from 18.03 to 04.04, 2 weeks

- To do:
    - US1: Registration/Logging in
    - US2: Creating tasks

#### Sprint Analysis

- Analysis: Analysis will occur after the sprint finishes

- Version: 0.1
