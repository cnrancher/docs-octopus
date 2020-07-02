---
id: edge-ui
title: Edge UI
---

import useBaseUrl from '@docusaurus/useBaseUrl';

:::note
Edge-UI当前仅适用于k3s集群。
:::
## 从Helm图表中安装Edge-UI

默认情况下，`Edge-UI`在Octopus[Helm图表](./install#1-octopus-helm-应用)安装时会自动部署，您始终可以使用以下命令将其打开或关闭：
```shell script
$ helm upgrade -n octopus-system --set edge-ui.enabled=true octopus cnrancher/octopus
```


## 从YAML文件安装Edge-UI

通过`all-in-one` YAML文件来部署 `Edge-UI`:

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/edge-api-server/master/deploy/e2e/all_in_one.yaml
```

通过检查其pod和服务状态来验证 `Edge-UI`的状态。
```shell script
$ kubectl get po -n kube-system -l app.kubernetes.io/name=edge-ui

NAME                                      READY   STATUS      RESTARTS   AGE
rancher-edge-ui-5c845c998b-pj2gr          1/1     Running     1          20s

$ kubectl get svc -n kube-system -l app.kubernetes.io/name=edge-ui
NAME              TYPE           CLUSTER-IP    EXTERNAL-IP                PORT(S)          AGE
rancher-edge-ui   LoadBalancer   10.43.98.95   172.16.1.89,192.168.0.90   8443:31520/TCP   22s
```

默认情况下，`Edge-UI`使用服务发现类型为`LoadBalancer`的`8443`端口，您可以通过其`EXTERNAL-IP:8443`来访问它：
<img alt="edge-ui" src={useBaseUrl('img/edge-ui.png')} />

## 登入验证

`Edge-UI`使用k3s生成的用户名和密码进行身份验证，您可以从生成的k3s[[KUBECONFIG]](https://rancher.com/docs/k3s/latest/en/cluster-access/)文件中找到它。

