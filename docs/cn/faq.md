---
id: faq
title: 常见问题
---

:::note说明
常见问题解答会定期更新，旨在回答我们的用户最关注的问题。
:::

##### Octopus可以在k3s或本地Kubernetes集群上运行吗？

Octopus遵循k8s api扩展和CRD模型，它与k3s或原生Kubernetes都兼容，所以Octopus可以在k3s或本地Kubernetes集群上运行。

##### Octopus是否支持ARM和AMD64？

Octopus的multi-arch的镜像支持AMD64，ARM64和ARMv7，Octopus可以在从像Raspberry Pi这样的微型计算机到AWS a1.4xlarge 32GiB大型服务器都可以很好地工作。

##### Octopus是否支持Windows？

目前，Octopus不支持Windows，但是我们对将来的想法持开放态度。

##### 如何从源代码构建Octopus

请参考 [Octopus开发指南](./develop)的说明。

##### 如何构建自定义设备适配器？

请参考[开发适配器](./adaptors/develop)的说明。

##### 是否支持本地离线访问UI？

支持，如果是使用`master`镜像的用户可以通过编辑`kubectl edit settings ui-index`来添加使用`local`的配置：
```yaml
apiVersion: octopusapi.cattle.io/v1alpha1
kind: Setting
metadata:
  creationTimestamp: "2020-07-15T11:04:09Z"
  generation: 6
  name: ui-index
  resourceVersion: "5328065"
  selfLink: /apis/octopusapi.cattle.io/v1alpha1/settings/ui-index
  uid: 37e54cfa-ebd5-4d80-91dc-31959dfaf634
default: https://rancher-octopus.s3-accelerate.amazonaws.com/ui/latest/index.html
value: local # 添加local支持本地离线访问UI的js/css文件
```
如果用户使用的是`tag`镜像，例如`cnrancher/octopus-api-server:v1.0.2`则会默认使用离线文件。
