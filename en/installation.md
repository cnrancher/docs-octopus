---
id: install
title: Installation
---

There are two ways to deploy Octopus, one is [Helm chart](https://helm.sh/), another one bases on [Kustomize](https://github.com/kubernetes-sigs/kustomize).

## 1. Octopus Helm Chart

:::note
The charts in this repository requires Helm version 3.x or later.**, read and follow the [Helm installation guide](https://helm.sh/docs/intro/install/).
:::

The [Octopus-Chart](https://github.com/cnrancher/octopus-chart) repository hosts official Helm charts for [Octopus](https://github.com/cnrancher/octopus). These charts are used to deploy Octopus to the Kubernetes/k3s Cluster.


### Add the Octopus Helm Chart repo

In order to be able to use the charts in this repository, add the name and URL to your Helm client:

```console
$ helm repo add cnrancher http://charts.cnrancher.cn/octopus
$ helm repo update
```

### Installing the Chart

To install the Octopus Chart into your Kubernetes/k3s cluster use:
```
$ helm create ns octopus-system
```
```
$ helm install --namespace octopus-system octopus cnrancher/octopus
```

After installation succeeds, you can get a status of Chart
```
$ helm status octopus
```

If you want to delete your Chart, use this command:
```
$ helm delete octopus
```

The command removes nearly all the Kubernetes components associated with the
chart and deletes the release.

### Helm Chart and Octopus Support

Visit the [Octopus github issues](https://github.com/cnrancher/octopus/issues/) for support.

## 2. Bases on Kustomize

Kustomize is an interesting tool in solving Kubernetes application management, it uses a different idea then Helm, which calls [Declarative Application Management](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/architecture/declarative-application-management.md). 

Octopus uses `Kustomize` to generate its installer manifest files, the installer YAML file is under the [`deploy/e2e`](https://github.com/cnrancher/octopus/tree/master/deploy/e2e) directory on Github, user can use it to install the octopus and its adaptors.

1. Install Octopus
    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/all_in_one.yaml
    ```

1. Install Octopus Official Adaptors
    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/modbus/deploy/e2e/all_in_one.yaml
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/opcua/deploy/e2e/all_in_one.yaml
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/mqtt/deploy/e2e/all_in_one.yaml
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/ble/deploy/e2e/all_in_one.yaml
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/all_in_one.yaml
    ```

### Animated quick demo

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
