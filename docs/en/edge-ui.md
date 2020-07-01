---
id: edge-ui
title: Edge UI
---

import useBaseUrl from '@docusaurus/useBaseUrl';

:::note
Edge-UI is only supported for k3s cluster.
:::
## Install Edge-UI from Helm
By default, the `Edge-UI` is auto deployed using octopus [Helm chart](./install#1-octopus-helm-chart), you can always turn it on or off with following commands:
```shell script
$ helm upgrade -n octopus-system --set edge-ui.enabled=true octopus cnrancher/octopus
```


## Install Edge-UI from Manifest

Deploy the `edge-ui` using `all-in-one` YAML file:

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/edge-api-server/master/deploy/e2e/all_in_one.yaml
```

Validate the `edge-ui` status by checking its pod and service status.
```shell script
$ kubectl get po -n kube-system -l app.kubernetes.io/name=edge-ui

NAME                                      READY   STATUS      RESTARTS   AGE
rancher-edge-ui-5c845c998b-pj2gr          1/1     Running     1          20s

$ kubectl get svc -n kube-system -l app.kubernetes.io/name=edge-ui
NAME              TYPE           CLUSTER-IP    EXTERNAL-IP                PORT(S)          AGE
rancher-edge-ui   LoadBalancer   10.43.98.95   172.16.1.89,192.168.0.90   8443:31520/TCP   22s
```

by default `edge-ui` uses k3s `LoadBalancer` with port `8443`, you can visit it by its `EXTERNAL-IP:8443`:

<img alt="edge-ui" src={useBaseUrl('img/edge-ui.png')} />

## Authentication

`Edge-UI` uses k3s username and password for authentication, you can find it from the k3s generated [KUBECONFIG](https://rancher.com/docs/k3s/latest/en/cluster-access/) file.

