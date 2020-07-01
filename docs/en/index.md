---
id: about
title: About Octopus
sidebar_label: About Octopus
---

import useBaseUrl from '@docusaurus/useBaseUrl';

## Octopus Introduction

Octopus is an open-source and cloud-native device management system based on Kubernetes or [k3s](https://k3s.io/), it is very lightweight and does not need to replace any basic components of the Kubernetes cluster. After Octopus deployed, the cluster can have the ability to manage edge devices as custom k8s resources.

## Concepts

Like the real octopus, Octopus consists of the brain and limbs. The brain can only deploy one or choose the leader(HA mode), it is responsible for processing that relatively centralized information, for example validating whether the node exists and device model(type) exists. 
The limbs need to be deployed on the edge nodes that the device can connect to, they talk to real-world devices through adaptors. Therefore, Octopus manages devices by managing its device connections(i.e, DeviceLink).

## Architecture Setup with k3s Cluster
<img alt="architecture" src={useBaseUrl('img/architecture.png')} />
