---
id: octopus-ui
title: Octopus UI
---

import useBaseUrl from '@docusaurus/useBaseUrl';

:::note说明
Octopus-UI当前仅适用于k3s集群。
:::
## 从Helm图表中安装Octopus-UI

默认情况下，`Octopus-UI`在Octopus[Helm图表](./install#1-octopus-helm-应用)安装时会自动部署，您始终可以使用以下命令将其打开或关闭：
```shell script
$ helm upgrade -n octopus-system --set octopus-ui.enabled=true octopus octopus/octopus
```


## 从YAML文件安装Octopus-UI

通过`all-in-one` YAML文件来部署 `Octopus-UI`：

```shell script
kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus-api-server/master/deploy/e2e/all_in_one.yaml
```

:::note说明
国内用户，可以使用以下方法加速安装：
    
```
kubectl apply -f http://rancher-mirror.cnrancher.com/octopus/api-server/master/deploy/e2e/all_in_one.yaml
```
:::

通过检查其pod和服务状态来验证 `Octopus-UI`的状态。
```shell script
kubectl get po -n kube-system -l app.kubernetes.io/name=octopus-ui

NAME                                      READY   STATUS      RESTARTS   AGE
rancher-octopus-api-server-5c845c998b-pj2gr          1/1     Running     1          20s

kubectl get svc -n kube-system -l app.kubernetes.io/name=octopus-ui
NAME              TYPE           CLUSTER-IP    EXTERNAL-IP                PORT(S)          AGE
rancher-octopus-api-server   LoadBalancer   10.43.98.95   172.16.1.89,192.168.0.90   8443:31520/TCP   22s
```

默认情况下，`Octopus-UI`使用服务发现类型为`LoadBalancer`的`8443`端口，您可以通过其`EXTERNAL-IP:8443`来访问它：

<img alt="Octopus-UI" src={useBaseUrl('img/edge-ui.jpg')} />

## 登入验证

`Octopus-UI`使用k3s生成的用户名和密码进行身份验证，您可以从生成的k3s[[KUBECONFIG]](https://rancher.com/docs/k3s/latest/en/cluster-access/)文件中找到它。

