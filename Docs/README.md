# GoNext
![GoNextLogo](/Docs/imgs/GoNext.png)

![Stars](https://img.shields.io/github/stars/gonext?style=flat-square)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-45.5%25-orange?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-19.7%25-orange?style=flat-square)
![CSS](https://img.shields.io/badge/CSS-19.2%25-orange?style=flat-square)
![Python](https://img.shields.io/badge/Python-13.9%25-orange?style=flat-square)
![Others](https://img.shields.io/badge/Others-1.7%25-orange?style=flat-square)
![Repo Size](https://img.shields.io/github/repo-size/whycody/gonext?style=flat-square)

![Created At](https://img.shields.io/badge/created%20at-march%202025-informational?style=flat-square)
![Release Date](https://img.shields.io/badge/release%20date-june%202025-yellow?style=flat-square)

## Contents

- [Team](#team)
- [Vision and Scope](#vision-and-scope)
- [Requirements](#requirements)
    - [Use case diagram](#use-case-diagram)
    - [User Stories](#user-stories)
    - [App usage demonstrations](#app-usage-demonstrations)
- [Definition of Done](#definition-of-done)
- [Cloud Services](#cloud-services)
- [Risk Plan](#risk-plan)
- [Security Threats](#security-threats)
- [Migration](#migration)
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

## User Stories

- User story 1(Registration): As a user, I want to register in the application, so that I can use it for my personal purposes.
- User story 2(Logging in): As a user, I want to log in to the application, so that I can use it for my personal purposes.
- User story 3(Forgot password): As a user, I want to reset my password in case I forgot it, so that I can continue using the application without creating a new account.
- User story 4(Change password): As a user, I want to be able to change my password, so that if my logging credentials are leaked, I can change them easily.
- User story 5(Creating tasks): As a user, I want to create tasks, so that I keep track on my personal objectives.
- User story 6(Managing tasks): As a user, I want to assign a priority level to a task, edit it, or delete it so that I have a clear overview of all task details.
- User story 7(Creating groups): As a user, I want to create a group so that I can collaborate on tasks with other group members.
- User story 8(Inviting members): As a group admin, I want to invite users to a created group, so that we can share common tasks.
- User story 9(Managing groups): As a group admin, I want to set other members as admins or remove them from the group so that I can maintain proper group management.
- User story 10(Logging out): As a user, I want to log out, so that I can get back to using the application later without idle state.

***

## App usage demonstrations

### User Story 1

<!--![User Story 1](imgs/1_updated.png) - GIF filmik US1-->
![User Story 1](Docs/imgs/US1_1.jpg)

### User Story 2 

<!--![User Story 2](imgs/2_updated.png) - GIF filmik US2-->

***

## Definition of Done
> [!NOTE]  
> 
> The Definition of Done is a set of criteria that must be performed for a particular User Story to be considered “done”.

1. All tasks completed
2. US is accepted by the client  
3. The code merged into the main branch  

***

## Cloud Services

The project uses following cloud servises:
- Azure App Service
- Azure Database for PostgreSQL

Let's dive into them.

### Azure App Service
Azure App Service is a Platform-as-a-Service (PaaS) offering to host web applications, REST APIs, and mobile backends. It is running RESTful APIs for mobile or web applications.
Benefits:
- Free access
- Managed runtime and scaling
- Built-in CI/CD integration
- SSL/TLS support by default
- Easy deployment via GitHub

Scaling and performance:
- Autoscaling based on CPU/memory usage or schedule
- Load balancing and traffic management

### Azure Database for PostgreSQL
A managed relational database built on PostgreSQL with automated maintenance, backups, and scaling.
Benefits: 
- Built-in high availability (zone-redundant)
- Automated patching and backup
- Private endpoint support
- Encryption at rest and in transit

Scaling and performance:
- Vertical scaling (compute and storage) without downtime


### Compliance and Certifications
In addition, both services comply with major standards:
- ISO/IEC 27001
- SOC 1, 2, and 3
- HIPAA
- GDPR
  

### Cloud service safety
Azure App Service offers a robust security framework with built-in features and integrations to protect applications and data. While it provides a strong baseline of security, users are responsible for configuring and maintaining their own security settings for the highest level of protection.
- HTTPS Enforcement: App Service automatically forces HTTPS connections, ensuring encrypted communication between the client and the server.
- TLS/SSL Certificates: Users can add TLS/SSL certificates for custom domains to maintain secure connections, particularly when using HTTPS. 
- Data Residency: App Service Environments store data within the region where they are deployed.
- Managed Identities: These identities allow App Service apps to securely access secrets in Azure Key Vault without needing to store credentials in code or app settings.
- Key Vault Integration: Users can use Key Vault to securely store and manage secrets like database credentials and API keys.


Azure Database for PostgreSQL offers robust security features to protect your data, both in transit and at rest. It leverages encryption, authentication, and access control to ensure a secure environment. Data at rest is encrypted using FIPS 140-2 validated cryptographic modules, while data in transit is protected with SSL/TLS. 
- Encryption at Rest: Azure Database for PostgreSQL uses FIPS 140-2 validated cryptographic modules to encrypt data stored on disk, including backups and temporary files.
- Encryption in Transit: Data is encrypted during transmission using Secure Sockets Layer (SSL) and Transport Layer Security (TLS).
- VNet Integration: You can integrate your PostgreSQL server with Azure's virtual network (VNet) for private access, preventing public exposure.

 
***

## Risk Plan

### Success Threshold 

The project is considered to be successful if:
- All user stories are completed, including assigned tasks.
- All team members contributed equally to the project.
- The team is satisfied with the application and their work on the project,

### Risk List
Risk list contains most probably occurring issues during app development. We introduce risk scaling depending on their impact on app's functionality and its likelihood of occurrence. Impact and Likelihood are measured in skale 1(least) to 5(most). Then using formula "RSK1 = PxI" we calculate how dangerous the risk is for the app. We set a risk threshold equals 20, meaning that every risk with risk score >= 20 is considered to be dangerous and needed to be mitigated. 

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
  - RSK3 - Security Vulnerabilities in Authentication Flow:
    - Action: Use secure authentication practices.
    - Action: Perform security audits and penetration testing before release.
      
***

## Security Threats

### Threats list and our threat mitigation

  - T1 - Hardcoded Secrets and Credentials
    - Threat: If API keys, tokens, or passwords are hardcoded into the codebase, they can be exposed publicly, leading to unauthorized access.
    - Mitigation: We ensured that all secrets are stored securely using environment variables.
      
  - T2 - Insecure Authentication
    - Threat: Without proper authentication mechanisms, unauthorized users might gain access to restricted areas of the application.
    - Mitigation 1: When creating an account, we force user to create a strong password, by checking whether it contains 8 characters(including 1 lowecase letter, 1 uppercase letter, 1 number and 1 special symbol).
    - Mitigation 2: All credentials are hashed via Django side with adding salt and stored securely in the database. While trying to log in, the system compares hashed credentials.
   
  - T3 - Lack of Input Validation
    - Threat: Improper input validation can lead to vulnerabilities like SQL injection or cross-site scripting (XSS).
    - Mitigation 1: We validate and sanitize all user inputs on both client and server sides.
    - Mitigation 2: Trying to log in, built-in serialiser checks whether all fields sent by user have correct type.

  - T4 - Use of Vulnerable Dependencies
    - Threat: Outdated or vulnerable third-party packages can introduce security flaws.
    - Mitigation: We regularly audit dependencies using 'npm audit'.

  - T5 - Inadequate Logging and Monitoring
    - Threat: Without proper logging, detecting and responding to security incidents becomes challenging.
    - Mitigation: We implemented comprehensive logging for critical actions and monitor logs regularly.

  - T6 - Cross-Origin Resource Sharing (CORS) Misconfigurations
    - Threat: A poorly configured CORS policy can expose endpoints to unauthorized origins.
    - Mitigation: We defined strict Access-Control-Allow-Origin policies.

  - T7 - Rate Limiting and Brute-Force Protection
    - Threat: Login endpoints or APIs could be targeted by bots trying to guess credentials.
    - Mitigation 1: We implemented rate limiting.
    - Mitigation 2: While trying to log it, the system checks if there were unsuccessful login tries before for the following IP and username and whether axes blocked access to the app for this user.
   
  - T8 - Possible JWT token leak
    - Threat: Insecurely stored or incorrectly verified tokens can be hijacked or forged.
    - Mitigation: We hash tokens and add SALT for propper security.

  - T9 - Refresh token stealth
    - Threat: Insecurely stored refresh token may be a security vulnerability.
    - Mitigation: We secured refresh token with deviceID - from now on, refresh token is assigned to a device.

  - T10 - Admin rights access
    - Threat: Admin logs into the application with their own credentials. If the credentials are stolen, the service is in danger.
    - Mitigation: Admin operates the application through Django admin.

  - T11 - Non-authorised group members
    - Threat: Group members could have invited non-autorised users to a group, leading to information leak.
    - Mitigation: Users can be added to a group only by a group admin.

***
## Migration
Because the configuration of cloud services on Azure required time in the beginning of the project and there wasn't a lot of time available to work on, the app was developed localy and then migrated to Azure. The process consisted of first configuring a simple postgresql database which the team could connect to while working on the app (with web server running locally). After that a fork was made from the default repository and using github actions we had a working deployment to Azure app service with our backend running there. With the whole setup configured all that was left was to point the frontend URLs to Azure on development setups.

***

## Pre-Game

### Sprint 0 Plan

- Goal: project description
- Dates: from 10.03 to 17.03, 1 week
- Sprint 0 Tasks:
    - Task1 - Write the Team
    - Task2 - Write the Vision and Scope
    - Task3 - Write the Requirements
    - Task4 - Write DoD
    - Task5 - Write the Risk Plan
    - Task6 - Write the Security Threats
    - Task7 - Write the Pre-Gane
    - Task8 - Write Release Plan
    - Task9 - Write Product increments
    - Task10 - Create US
    - Task11 - Create a repository
    - Task12 - Write the Cloud Services

***

## Release Plan

### Release 1

- Goal: We define the most important features of the project that are necessary for the minimum operation of the application: 
    - Registration
    - Logging in
    - Creating tasks
    - Managing tasks
- Date: 20.04
- Release: V1.0

***

### Release 2

- Goal: Groups functionality, admin role, security issues:
    - Creating groups
    - Managing groups
    - Fixing bugs
    - UI improvement
- Date: 02.06
- Release: V2.0

***

## Product Increments
### Sprint 1

#### Sprint Plan

- Goal: Create the base architecture of the app and basic interface.
  
- Date: from 18.03 to 04.04, 2 weeks

- To do:
    - US1: Registration
    - US2: Logging in
    - US5: Creating tasks

- Version: 0.1

### Sprint 2

#### Sprint Plan

- Goal: Registration, email verification, group creation.

- Date: from 07.04 to 13.04, 2 weeks

- To do:
    - US1: Registration
    - US2: Loggin in
    - US4: Creating groups

- Version: 0.2

### Sprint 3

#### Sprint Plan

- Goal: Fix previous sprint issues.

- Date: from 14.04 to 20.04, 1 week

- To do:
    - US1: Registration
    - US2: Logging in
    - US4: Creating groups

- Version: 1.0

### Sprint 4

#### Sprint Plan

- Goal: Group creation, backend security.

- Date: from 21.04 to 27.04, 1 week

- To do:
    - US1: Registration
    - US4: Creating groups

- Version: 1.1

### Sprint 5

#### Sprint Plan

- Goal: API setting, settings, group invitation, email verification.

- Date: from 28.04 to 04.05, 1 week

- To do:
    - US1: Registration
    - US2: Logging in
    - US6: Managing tasks
    - US8: Inviting members

- Version: 1.2

### Sprint 6

#### Sprint Plan

- Goal: Security improvments, password change, documentation, UI.

- Date: from 5.05 to 11.05, 1 week

- To do:
    - US3: Forgot password
    - US4: Change password

- Version: 1.3

### Sprint 7

#### Sprint Plan

- Goal: Documenation, reset password, API testing, settings, UI.

- Date: from 12.05 to 18.05, 1 week

- To do:
    - US3: Forgot password
    - US6: Managing tasks
    - US8: Intviting members
    - US10: Logging out

- Version: 1.4

### Sprint 8

#### Sprint Plan

- Goal: Managing groups, backend security, UI.

- Date: from 19.05 to 25.05, 1 week

- To do:
    - US9: Managing groups

- Version: 1.5

### Sprint 9

#### Sprint Plan

- Goal: Group creation UI, security, documentation.

- Date: from 26.05 to 02.06, 1 week

- To do:
    - US4: Change password
    - US7: Creating groups
    - Inner fixs

- Version: 2.0
