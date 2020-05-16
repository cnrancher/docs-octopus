---
id: install
title: Installation
---

There are two ways to deploy Octopus, one is [Helm chart](https://helm.sh/), another one bases on [Kustomize](https://github.com/kubernetes-sigs/kustomize).

## Octopus Helm Chart

This repository hosts official [Helm](https://helm.sh/) charts for [Octopus](https://github.com/cnrancher/octopus). These charts are used to deploy Octopus to the Kubernetes/k3s Cluster.

### Install Helm3

Read and follow the [Helm installation guide](https://helm.sh/docs/intro/install/).

**Note: The charts in this repository require Helm version 3.x or later.** 

### Add the Octopus Helm Chart repo

In order to be able to use the charts in this repository, add the name and URL to your Helm client:

```console
helm repo add cnrancher http://charts.cnrancher.cn/octopus
helm repo update
```

### Installing the Chart

To install the Octopus Chart into your Kubernetes/k3s cluster use:
```
helm install --namespace octopus-system octopus cnrancher/octopus
```

After installation succeeds, you can get a status of Chart
```
helm status octopus
```

If you want to delete your Chart, use this command:
```
helm delete  octopus
```

The command removes nearly all the Kubernetes components associated with the
chart and deletes the release.

### Helm Chart and Octopus Support

Visit the [Octopus github issues](https://github.com/cnrancher/octopus/issues/) for support.

## Bases on Kustomize

Kustomize is an interesting tool, in solving Kubernetes application management, it uses a different idea then Helm, which calls [Declarative Application Management](https://github.com/kubernetes/community/blob/master/contributors/design-proposals/architecture/declarative-application-management.md). 

The kustomize layout of Octopus looks like as follows:

```
deploy/manifests
    - crd/base - stores raw CRD files 
    - overlays - stores the topmost overlays
    - rbac - stores RBAC files
    - workload - stores workload files
```

During [Octopus generated stage](./develop.md), these topmost overlay will be rendered accordingly:

- `default` overlay -> `deploy/e2e/all_in_one.yaml`
- `without_webhook` overlay -> `deploy/e2e/all_in_one_without_webhook.yaml`

> If deploying `deploy/e2e/all_in_one.yaml`, it's required to deploy [cert manager](https://github.com/jetstack/cert-manager) for provisioning the certificates, please follow [the cert manager document](https://docs.cert-manager.io/en/latest/getting-started/install/kubernetes.html) to install it.

### Animated quick demo

Deploy Octopus without admission webhooks for developing:

[![asciicast](https://asciinema.org/a/blEcEzM1BGzwDTF48sNLRDWk0.svg)](https://asciinema.org/a/blEcEzM1BGzwDTF48sNLRDWk0)

<details>
  <summary>process instruction</summary>
  <code>
  
    # deploy octopus without webhook
    kubectl apply -f deploy/e2e/all_in_one_without_webhook.yaml
    
    # confirm the octopus deployment
    kubectl get all -n octopus-system
    kubectl get crd | grep devicelinks
    
    # deploy a devicelink
    cat adaptors/dummy/deploy/e2e/dl.yaml
    kubectl apply -f adaptors/dummy/deploy/e2e/dl.yaml
    
    # confirm the state of devicelink
    kubectl get dl correct -n default
    
    # deploy dummy adaptor and dummydevice model
    kubectl apply -f adaptors/dummy/deploy/e2e/all_in_one.yaml
    
    # confirm the dummy adaptor deployment
    kubectl get daemonset octopus-adaptor-dummy-adaptor -n octopus-system
    kubectl get crd | grep dummydevices
    
    # confirm the state of devicelink
    kubectl get dl correct -n default
    
    # watch the device instance
    kubectl get dummydevice correct -n default -w
    
  </code>
</details>

Deploy Octopus with admission webhooks for producing:

[![asciicast](https://asciinema.org/a/Yfvuw88rUumSzzJcHn3PJp3p7.svg)](https://asciinema.org/a/Yfvuw88rUumSzzJcHn3PJp3p7)

<details>
  <summary>process instruction</summary>
  <code>
  
    # deploy cert-manager
    kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v0.14.0/cert-manager.yaml
    
    # confirm the cert-manager deployment
    kubectl get all -n cert-manager
    
    # deploy octopus with webhook
    kubectl apply -f deploy/e2e/all_in_one.yaml
    
    # confirm the octopus deployment
    kubectl get all -n octopus-system
    
    # verify the crd of devicelinks
    kubectl get crd | grep devicelinks
    
    # verify the webhooks
    kubectl get mutatingwebhookconfigurations octopus-mutating-webhook-configuration -n octopus-system -o yaml
    kubectl get validatingwebhookconfigurations octopus-validating-webhook-configuration -n octopus-system -o yaml
    
  </code>
</details>
