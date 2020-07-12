---
id: about
title: 关于 Octopus
sidebar_label: 关于 Octopus
---

import useBaseUrl from '@docusaurus/useBaseUrl';

## Octopus 简介

Octopus是基于Kubernetes或[k3s](https://k3s.io/)的开源和云原生的设备管理系统，它非常轻巧，也不需要替换Kubernetes集群的任何基础组件。 部署了Octopus，集群可以将边缘设备作为自定义k8s资源进行管理。

## 核心概念

如同八爪鱼一样，Octopus由大脑（Brain）和触角（Limbs）组成。 大脑只需部署一个领导者，或在HA模式下自动选择一个领导者，它只要负责处理相对集中的信息，例如验证节点是否存在以及设备模型（类型）是否存在。
而Limbs则需要部署在可以连接设备的各个边缘节点上，它们通过协议适配器（Adaptors）与实际设备通信。 因此，Octopus是通过一种DeviceLink的YAML文件（k8s资源对象）配置和管理设备。

## 基于k3s集群的架构图
<img alt="architecture" src={useBaseUrl('img/architecture.png')} />
