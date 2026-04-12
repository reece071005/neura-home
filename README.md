<p align="center">
  <img src="docs/NeuraHomeLogo.png" alt="Project Logo">
</p>

# Neura Home

An AI-driven smart home platform that learns user routines from time-series sensor data, integrates computer vision for environmental awareness, and provides a natural language voice assistant powered by large language models.

<div align="center">
  <a href="https://neurahome.me">
    <img src="https://cdn.simpleicons.org/googlechrome" width="18" style="vertical-align: middle;" />
    Website
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://www.youtube.com/watch?v=8MGqcfFiD_Q">
    <img src="https://cdn.simpleicons.org/youtube" width="18" style="vertical-align: middle;" />
    Demo Video
  </a>
  &nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="https://www.instagram.com/neurahome42">
    <img src="https://cdn.simpleicons.org/instagram" width="18" style="vertical-align: middle;" />
    Instagram
  </a>
</div>

**Note:** This repository contains the **mobile frontend application** for the Neura Home system. The backend services and AI components are maintained in a separate repository.

- **Backend Repository:** https://github.com/reece071005/neura-home-backend

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Tech Stack](#tech-stack)

## Overview

Neura Home is an AI-driven smart home system designed to move beyond standard rule-based automation. Instead of relying solely on manually configured schedules or triggers, the platform learns behavioural patterns from historical smart home data, including device states, sensor activity, and temporal patterns. By analysing this time-series data, the system can identify recurring routines and predict actions that improve automation within the home environment.

The Neura Home ecosystem combines multiple intelligent components, including behavioural routine prediction, computer vision for environmental awareness and event detection, and a natural language voice assistant powered by a large language model. These components work together to enable context-aware automation and intuitive interaction with the home.

The overall system architecture consists of a mobile application frontend, a backend API, and several containerised AI services running as microservices on a local Neura Home Hub. The hub integrates with the Home Assistant platform to monitor sensors and control connected IoT devices such as lights, climate systems, blinds, and cameras. This local-first architecture prioritises reliability, privacy, and low-latency control while still allowing optional cloud-based services to extend system capabilities when required.

## Features

- **AI Routine Learning**  
  The system analyses historical smart home data, including device states, sensor activity, and temporal patterns, to identify recurring behavioural routines. These patterns are used to predict and automate future actions within the home, reducing the need for manually configured schedules or rule-based automations.

- **Configurable AI Behaviour**  
  Users can enable or disable AI-driven automation on a per-room basis through the mobile application. This allows users to maintain control over where intelligent automation is applied and adjust system behaviour depending on room usage or personal preferences.

- **AI Training Control**  
  The system supports configurable AI training schedules for individual rooms, allowing models to be retrained automatically at defined intervals. Users can also manually trigger retraining when system behaviour needs to be updated or corrected.

- **Computer Vision Monitoring**  
  Integrated vision services analyse camera feeds to provide environmental awareness within the home. The system can detect activity, monitor spaces, and support intelligent notifications based on visual events.

- **Resident Recognition and Tracking**  
  Users can register known faces within the system, allowing the vision service to distinguish between recognised residents and unknown individuals. The system can maintain a last known location for detected residents within the home.

- **Voice Assistant with Contextual Queries**  
  A natural language voice assistant powered by a large language model allows users to interact with the system using spoken commands. In addition to controlling devices, users can ask contextual questions such as where a specific resident was last detected within the home.

- **Mobile Application Interface**  
  The mobile application provides a central interface for interacting with the system. Users can monitor devices, configure AI behaviour, manage system settings, and interact with the voice assistant.

- **User Profiles, Roles, and Personalised Dashboards**  
  The system supports multiple user accounts with role-based permissions, including administrator and standard user roles. Each user can customise their own dashboards by adding, removing, and rearranging widgets, allowing them to prioritise the devices and controls most relevant to their daily use while maintaining appropriate access permissions within the household.

- **Integration with Smart Home Ecosystems**  
  Neura Home integrates with the Home Assistant platform to communicate with a wide range of IoT devices, enabling control of lights, climate systems, blinds, sensors, and cameras.

- **Local-First Architecture**  
  Core system intelligence runs locally on the Neura Home Hub, ensuring low-latency control, improved reliability, and enhanced privacy. Optional cloud-based services are used for the large language model that powers the voice assistant, enabling advanced natural language interaction when required.
  
## System Architecture

## Getting Started

The following steps describe how to run the **Neura Home mobile application** in a development environment.  
The application is built using **React Native and Expo** and communicates with a local **Neura Home Hub backend** running on the same local network.

### Prerequisites

Before running the application, ensure the following tools are installed:

- **Node.js** (v18 or later recommended)
- **npm** or **yarn**
- **Expo CLI**
- **Git**
- **iOS Simulator (Xcode)** or **Android Emulator (Android Studio)**  
  OR a physical mobile device with the **Expo Go** application installed.

**Note:** In order to complete onboarding and interact with the system, the following components must be running and connected to the **same local network**:

- A running **[Neura Home Hub backend](https://github.com/reece071005/neura-home-backend)**
- A **[Home Assistant](https://github.com/home-assistant/core)** instance with connected IoT devices
- The **mobile device** running the Neura Home application

The mobile application discovers the **Neura Home Hub** over the local network during setup and communicates with **Home Assistant** through the hub. Therefore, the **Hub, Home Assistant instance, and mobile device must all be reachable on the same local network**.

### Installation

```bash
# Clone the repository
git clone https://github.com/reece071005/neura-home.git
cd neura-home

# Install dependencies
npm install
```

### Running the Application

The Neura Home mobile application is built using React Native with Expo and is intended to be run as a development build.

To run the application on iOS:
```bash
npx expo run:ios
```
To run the application on Android: 
```bash
npx expo run:android
```
These commands will build and launch the development version of the application on the selected simulator or connected device.

**Note:** The mobile application was primarily designed and tested for **iPhones** during development. While the application should still function correctly on Android devices, the user interface and layout were optimised for the iOS environment.

### Connecting to the Neura Hub

When the application launches, it will attempt to automatically discover a Neura Home Hub on the local network.

If automatic discovery is unsuccessful, the Hub IP address can be entered manually within the application during the onboarding process.

To successfully complete onboarding and interact with smart home devices:

- The Neura Hub backend must be running
- Home Assistant must be running with connected IoT devices
- The mobile device, hub and Home Assistant instance must be on the same local network

Once connected, the application allows users to control devices, configure AI automation preferences, manage training schedules, and interact with the Neura Home voice assistant.

## Usage

Once the mobile application is running and connected to a **Neura Home Hub**, users can interact with the system through the mobile interface.

### Hub Discovery and Onboarding

When the application launches, it attempts to **automatically discover a Neura Home Hub on the local network**.

If discovery is unsuccessful, the **Hub IP address can be entered manually** during the onboarding process. After connecting to the hub, the application will attempt to **automatically detect a Home Assistant instance** on the network. The user will then be prompted to provide a **[Home Assistant Long-Lived Access Token](https://www.home-assistant.io/docs/authentication/)**, which allows the Neura Hub to securely communicate with Home Assistant and access connected smart home devices.

### Device Control

The dashboard provides a central interface for controlling and monitoring smart home devices connected through Home Assistant. Users can interact with devices such as:

- Lights
- Climate systems
- Blinds
- Fans
- CCTV
- Other Home Assistant compatible devices

Users can toggle devices, adjust settings, and monitor device states directly from the mobile application.

### AI Automation Configuration

The application allows users to configure **AI automation behaviour on a per-room basis**.

Users can enable or disable AI automation for specific rooms and adjust automation preferences through the settings interface.

### Climate Preconditioning Preferences

Users can influence AI behaviour by configuring **climate preconditioning preferences** for individual rooms.

These preferences allow the user to specify:

- Preferred temperature range
- Typical arrival time
- How long before arrival the room should begin adjusting

For example, a user may indicate that they usually arrive home at **6:30 PM**, prefer the room temperature to be within a specific range, and want the room to begin adjusting **a set number of minutes before arrival**. The system will then evaluate the **current room temperature before the expected arrival time** and determine whether heating or cooling should be activated to reach the desired comfort level.

These preferences help guide the AI system while still allowing it to make context-aware decisions based on real-time environmental data and historical patterns.

### AI Training Management

Neura Home allows users to control how frequently AI models retrain based on collected smart home data.

Users can:

- Configure automated training schedules for individual rooms (daily, weekly, monthly)
- Trigger **manual retraining** if system behaviour needs to be updated
- Monitor when sufficient data has been collected for model training

### Automation Notifications

When the system performs an AI-driven automation, the user receives a notification through the mobile application.

These notifications inform the user when actions such as device adjustments or environmental changes are performed automatically by the AI. This allows users to remain aware of system behaviour and maintain transparency over automated actions.

Notifications can include information such as:

- The devices and room was affected
- The time the action occurred
- The confidence of the model

### Voice Assistant

The built-in **Neura voice assistant** allows users to interact with the system using natural language.

Users can:

- Control smart home devices using natural language voice commands
- Ask general questions or request information unrelated to the home (e.g. recipes, facts, or other queries)
- Query the system about the smart home environment, such as device states or system status
- Ask contextual questions related to the vision system, for example **“Where was Alex last seen?”**

### Vision Notifications

The system integrates computer vision services to analyse camera feeds and detect activity within the home.

Users can receive notifications related to:

- Motion detection
- Recognised residents
- Unknown individuals
- Other detected events within monitored spaces (e.g. deliveries)

### Personalised Dashboards

Each user can customise their own dashboard within the mobile application.

Users can add, remove, and rearrange widgets to prioritise the devices and controls most relevant to their daily use. Dashboards are stored **per user account**, allowing different members of the household to maintain personalised interfaces tailored to their preferences.

### User Roles and Administration

The first user registered with a Neura Home Hub is automatically assigned the **administrator role**.

Administrators have the ability to manage household users, including:

- Adding new users to the system
- Assigning administrator or standard user roles
- Removing existing users

Standard users can interact with the smart home system and AI features but do not have permission to manage other users.

## Frontend Tech Stack

This repository contains the **mobile frontend application** for Neura Home.

Backend services, AI infrastructure, and system orchestration are implemented in the **Neura Home Hub backend**, which is maintained in a separate repository.

- **Backend Repository:** https://github.com/reece071005/neura-home-backend

### Mobile Application

- **React Native** – Cross-platform mobile application framework
- **Expo** – Development environment and build tooling
- **TypeScript** – Strongly typed JavaScript for improved reliability and maintainability

### Mobile Capabilities

- **Expo Audio** – Voice recording and playback for the Neura voice assistant
- **Expo Network** – Local network discovery for locating the Neura Hub
- **React Navigation / Expo Router** – Application navigation and routing

### Mobile Permissions

The application may request access to the following device capabilities:

- Microphone access for voice assistant interaction
- Camera access for capturing or registering recognised faces
- Notifications for AI automation and vision alerts
