---
id: faq
title: 常见问题
---

:::note
常见问题解答会定期更新，旨在回答我们的用户最常问到的关于Octopus的问题。
:::

##### Octopus可以在k3或本地Kubernetes集群上运行吗？

是的，Octopus遵循k8s api扩展和CRD模型，它与k3s或原生Kubernetes都兼容。

##### Octopus是否支持ARM和AMD64

是的，Octopus的multi-arch的镜像支持ARM64和ARMv7，Octopus从像Raspberry Pi这样的小东西到AWS a1.4xlarge 32GiB服务器都可以很好地工作。

##### Octopus是否支持Windows？

目前，Octopus本身不支持Windows，但是我们对将来的想法持开放态度。

##### 如何从源代码构建Octopus

请参考 [Octopus开发指南](./develop)的说明.

##### 如何构建自定义设备适配器？

请参考[开发适配器](./adaptors/develop)的说明。
