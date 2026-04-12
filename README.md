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
- [Installation](#installation)
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
