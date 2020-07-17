---
id: install
title: 安装部署
---

Octopus支持两种不同的部署方式，一种是基于[Helm chart](https://helm.sh/)部署，另一种是基于[Kustomize](https://github.com/kubernetes-sigs/kustomize)部署。

## 基于Helm chart部署

:::note说明
此仓库中的图表需要Helm 3.x或更高版本。请阅读并遵循[Helm安装指南](https://helm.sh/docs/intro/install/)。
:::

[Octopus-Chart](https://github.com/cnrancher/octopus-chart)项目包含了[Octopus](https://github.com/cnrancher/octopus)的官方Helm图表。 这些图表用于将Octopus部署到Kubernetes或k3s集群。


### 添加Octopus Helm仓库

为了能够使用此存储库中的图表，请将下列名称和URL添加到您的Helm客户端：

```console
helm repo add octopus http://charts.cnrancher.cn/octopus
helm repo update
```

### 安装应用

请运行以下命令，将Octopus Chart安装到Kubernetes或k3s集群中：
```
kubectl create ns octopus-system
```
```
helm install --namespace octopus-system myapp octopus/octopus
```

安装成功后，您可以获取应用状态：
```
helm status myapp -n octopus-system

```

如果要删除应用，请使用以下命令：
```
helm delete myapp -n octopus-system
```
该命令几乎删除了与应用关联的所有Kubernetes组件，并删除了Kubernetes发行版。

### Helm Chart和Octopus支持

请访问[Octopus github issues](https://github.com/cnrancher/octopus/issues/)以获得支持。

## 基于Kustomize部署

Kustomize是解决Kubernetes应用程序管理的另一种工具，它使用的概念与Helm不同，后者称为[声明式应用程序管理](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/architecture/declarative-application-management.md)。

Octopus使用 `Kustomize`生成其安装程序的清单文件，安装程序YAML文件位于以下目录中的[`deploy/e2e](https://github.com/cnrancher/octopus/tree/master/deploy/e2e)目录下 Github，用户可以使用它来安装Octopus及其适配器。

1. 安装Octopus
    ```shell script
    kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/deploy/e2e/all_in_one.yaml
    ```

1. 安装Octopus官方的协议适配器(包含Modbus、OPC-UA、BLE、MQTT和Dummy)
    ```shell script
    kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/modbus/deploy/e2e/all_in_one.yaml
    kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/opcua/deploy/e2e/all_in_one.yaml
    kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/mqtt/deploy/e2e/all_in_one.yaml
    kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/ble/deploy/e2e/all_in_one.yaml
    kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/all_in_one.yaml
    ```

### 动画快速演示

[![asciicast](https://asciinema.org/a/338649.svg)](https://asciinema.org/a/338649)

<details>
  <summary>process instruction</summary>
  <code>
  
    # deploy octopus without webhook
    kubectl apply -f deploy/e2e/all_in_one.yaml
    
    # confirm the octopus deployment
    kubectl get all -n octopus-system
    kubectl get crd | grep devicelinks
    
    # deploy a devicelink
    cat adaptors/dummy/deploy/e2e/dl_specialdevice.yaml
    kubectl apply -f adaptors/dummy/deploy/e2e/dl_specialdevice.yaml
    
    # confirm the state of devicelink
    kubectl get dl living-room-fan -n default
    
    # deploy dummy adaptor and model
    kubectl apply -f adaptors/dummy/deploy/e2e/all_in_one.yaml
    
    # confirm the dummy adaptor deployment
    kubectl get daemonset octopus-adaptor-dummy-adaptor -n octopus-system
    kubectl get crd | grep dummyspecialdevice
    
    # confirm the state of devicelink
    kubectl get dl living-room-fan -n default
    
    # watch the device instance
    kubectl get dummyspecialdevice living-room-fan -n default -w
    
  </code>
</details>
