---
id: quick-start
title: Quick-Start Guide
---

## Prerequisite
You should either have an existing k3s or Kubernetes cluster to deploy the Octopus app. For users who don't have an existing Kubernetes cluster can follow the [Spin-up k3s Cluster Using k3d](#spin-up-k3s-cluster-using-k3doptional) to run a quick test.

### Spin-up k3s Cluster Using k3d(optional)

[k3d](https://github.com/rancher/k3d) is a tool to create containerized k3s clusters. This means, that you can spin-up a multi-node k3s cluster on a single machine using Docker.

1. Spin-up a local k3d cluster with 3 worker nodes on default.
    ```shell script 
    curl -fL https://octopus-assets.oss-cn-beijing.aliyuncs.com/k3d/cluster-k3s-spinup.sh | bash -
    ```
   
   :::note
   You are expected to see the following logs if the installation succeeds, use either `CTRL+C` to stop the local cluster.
   :::
   ```logs
   [INFO] [0604 17:09:41] creating edge cluster with v1.17.2
   INFO[0000] Created cluster network with ID d5fcd8f2a5951d9ef4dba873f57dd7984f25cf81ab51776c8bac88c559c2d363
   INFO[0000] Created docker volume  k3d-edge-images
   INFO[0000] Creating cluster [edge]
   INFO[0000] Creating server using docker.io/rancher/k3s:v1.17.2-k3s1...
   INFO[0008] SUCCESS: created cluster [edge]
   INFO[0008] You can now use the cluster with:
   
   export KUBECONFIG="$(k3d get-kubeconfig --name='edge')"
   kubectl cluster-info
   [WARN] [0604 17:09:50] default kubeconfig has been backup in /Users/guangbochen/.kube/rancher-k3s.yaml_k3d_bak
   [INFO] [0604 17:09:50] edge cluster's kubeconfig wrote in /Users/guangbochen/.kube/rancher-k3s.yaml now
   [INFO] [0604 17:09:50] waiting node edge-control-plane for ready
   INFO[0000] Adding 1 agent-nodes to k3d cluster edge...
   INFO[0000] Created agent-node with ID 3197e431b1a060fbb591b4c315c4949f1b472213312ff8e04c898e3353e05bdc
   [INFO] [0604 17:10:01] waiting node edge-worker for ready
   INFO[0000] Adding 1 agent-nodes to k3d cluster edge...
   INFO[0000] Created agent-node with ID d9bb3e589e745797f3b189962d14de77cfc6afe86d1b6af93a43d808a9c72b5c
   [INFO] [0604 17:10:13] waiting node edge-worker1 for ready
   INFO[0000] Adding 1 agent-nodes to k3d cluster edge...
   INFO[0000] Created agent-node with ID bc69aa9867aa2081df0cf425661ae002142bd667d3d618bc5a5b34bc092d7562
   [INFO] [0604 17:10:25] waiting node edge-worker2 for ready
   [WARN] [0604 17:10:37] please input CTRL+C to stop the local cluster
   ```

1. Open a new terminal and set the `KUBECONFIG` to access the local k3s cluster.
    ```shell script 
    export KUBECONFIG="$(k3d get-kubeconfig --name='edge')"
    ```
   
1. Validate the local k3s cluster by checking its node.
    ```shell script 
    kubectl get node
   NAME                 STATUS   ROLES    AGE     VERSION
   edge-control-plane   Ready    master   3m46s   v1.17.2+k3s1
   edge-worker2         Ready    <none>   3m8s    v1.17.2+k3s1
   edge-worker          Ready    <none>   3m33s   v1.17.2+k3s1
   edge-worker1         Ready    <none>   3m21s   v1.17.2+k3s1
    ```


## Walk-through

In this walk-through, we will use Octopus to manage a `dummy` device and perform the following tasks:

1. [Deploy the Octopus](#1-deploy-octopus)
1. [Deploy Device Model & Device Adaptor](#2-deploy-device-model--device-adaptor)
1. [Create Device-Link](#3-create-device-link)
1. [Manage Device](#4-manage-device)

### 1. Deploy Octopus

There are [two ways](./install) to deploy the Octopus, for convenience, we will use the manifest YAML file to bring up the Octopus. The installer YAML file is under the [`deploy/e2e`](https://github.com/cnrancher/octopus/tree/master/deploy/e2e) directory on Github:

```shell script
kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/deploy/e2e/all_in_one.yaml
```

expected result:
```log
namespace/octopus-system created
customresourcedefinition.apiextensions.k8s.io/devicelinks.edge.cattle.io created
role.rbac.authorization.k8s.io/octopus-leader-election-role created
clusterrole.rbac.authorization.k8s.io/octopus-manager-role created
rolebinding.rbac.authorization.k8s.io/octopus-leader-election-rolebinding created
clusterrolebinding.rbac.authorization.k8s.io/octopus-manager-rolebinding created
service/octopus-brain created
service/octopus-limb created
deployment.apps/octopus-brain created
daemonset.apps/octopus-limb created
```

After installed, we can verify the status of Octopus as below:

```shell script
kubectl get all -n octopus-system
NAME                                 READY   STATUS    RESTARTS   AGE
pod/octopus-limb-w8vcf               1/1     Running   0          14s
pod/octopus-limb-862kh               1/1     Running   0          14s
pod/octopus-limb-797d8               1/1     Running   0          14s
pod/octopus-limb-8w462               1/1     Running   0          14s
pod/octopus-brain-65fdb4ff99-zvw62   1/1     Running   0          14s

NAME                    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/octopus-brain   ClusterIP   10.43.92.81    <none>        8080/TCP   14s
service/octopus-limb    ClusterIP   10.43.143.49   <none>        8080/TCP   14s

NAME                          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
daemonset.apps/octopus-limb   4         4         4       4            4           <none>          14s

NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/octopus-brain   1/1     1            1           14s

NAME                                       DESIRED   CURRENT   READY   AGE
replicaset.apps/octopus-brain-65fdb4ff99   1         1         1       14s

```

### 2. Deploy Device Model & Device Adaptor

Octopus uses a dummy device for testing, which does not need to be connected to a real physical device. So we can assume that the dummy device is a real-world device here.

First, we need to describe the device as a resource in Kubernetes. This description process is modeling the device. In Kubernetes, the best way to describe resources is to use [CustomResourceDefinitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/#customresourcedefinitions), so **defining a device model in Octopus is actually defining the CustomResourceDefinition.** Take a quick look at this `DummySpecialDevice` model(assume this is a smart fan): 

```yaml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  annotations:
    controller-gen.kubebuilder.io/version: v0.2.5
    devices.edge.cattle.io/description: dummy device description
    devices.edge.cattle.io/device-property: ""
    devices.edge.cattle.io/enable: "true"
    devices.edge.cattle.io/icon: ""
  labels:
    app.kubernetes.io/name: octopus-adaptor-dummy
    app.kubernetes.io/version: master
  name: dummyspecialdevices.devices.edge.cattle.io
spec:
  group: devices.edge.cattle.io
  names:
    kind: DummySpecialDevice
    listKind: DummySpecialDeviceList
    plural: dummyspecialdevices
    singular: dummyspecialdevice
  scope: Namespaced
  versions:
  - name: v1alpha1
    schema:
      openAPIV3Schema:
        description: DummySpecialDevice is the Schema for the dummy special device
          API.
        properties:
          ...
          spec:
            description: DummySpecialDeviceSpec defines the desired state of DummySpecialDevice.
            properties:
              gear:
                description: Specifies how fast the dummy special device should be.
                enum:
                - slow
                - middle
                - fast
                type: string
              "on":
                description: Turn on the dummy special device.
                type: boolean
              protocol:
                description: Protocol for accessing the dummy special device.
                properties:
                  location:
                    type: string
                required:
                - location
                type: object
            required:
            - "on"
            - protocol
            type: object
          status:
            description: DummySpecialDeviceStatus defines the observed state of DummySpecialDevice.
            properties:
              gear:
                description: Reports the current gear of dummy special device.
                enum:
                - slow
                - middle
                - fast
                type: string
              rotatingSpeed:
                description: Reports the detail number of speed of dummy special device.
                format: int32
                type: integer
            type: object
        type: object
    ...
status:
  ...
```

The dummy adaptor installer YAML file is under the [`adaptors/dummy/deploy/e2e`](https://github.com/cnrancher/octopus/blob/master/adaptors/dummy/deploy/e2e) directory, the `all_in_one.yaml` contains the device model and the device adaptor, we can apply it into the cluster directly:

```shell script
kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/all_in_one.yaml
```

expected result:
```
customresourcedefinition.apiextensions.k8s.io/dummyspecialdevices.devices.edge.cattle.io created
customresourcedefinition.apiextensions.k8s.io/dummyprotocoldevices.devices.edge.cattle.io created
clusterrole.rbac.authorization.k8s.io/octopus-adaptor-dummy-manager-role created
clusterrolebinding.rbac.authorization.k8s.io/octopus-adaptor-dummy-manager-rolebinding created
daemonset.apps/octopus-adaptor-dummy-adaptor created

kubectl get all -n octopus-system
NAME                                      READY   STATUS    RESTARTS   AGE
pod/octopus-limb-w8vcf                    1/1     Running   0          2m27s
pod/octopus-limb-862kh                    1/1     Running   0          2m27s
pod/octopus-limb-797d8                    1/1     Running   0          2m27s
pod/octopus-limb-8w462                    1/1     Running   0          2m27s
pod/octopus-brain-65fdb4ff99-zvw62        1/1     Running   0          2m27s
pod/octopus-adaptor-dummy-adaptor-6xcdz   1/1     Running   0          21s
pod/octopus-adaptor-dummy-adaptor-mmk5l   1/1     Running   0          21s
pod/octopus-adaptor-dummy-adaptor-xnjrf   1/1     Running   0          21s
pod/octopus-adaptor-dummy-adaptor-srsjz   1/1     Running   0          21s

NAME                    TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)    AGE
service/octopus-brain   ClusterIP   10.43.92.81    <none>        8080/TCP   2m27s
service/octopus-limb    ClusterIP   10.43.143.49   <none>        8080/TCP   2m27s

NAME                                           DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
daemonset.apps/octopus-limb                    4         4         4       4            4           <none>          2m27s
daemonset.apps/octopus-adaptor-dummy-adaptor   4         4         4       4            4           <none>          21s

NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/octopus-brain   1/1     1            1           2m27s

NAME                                       DESIRED   CURRENT   READY   AGE
replicaset.apps/octopus-brain-65fdb4ff99   1         1         1       2m27s

```

Notes that we have also granted Octopus permission to managing `DummySpecialDevice`/`DummyProtocolDevice`:

```shell script
kubectl get clusterrolebinding | grep octopus
octopus-manager-rolebinding                            2m49s
octopus-adaptor-dummy-manager-rolebinding              43s

```

### 3. Create Device Link

Next, we are going to connect the dummy device via `DeviceLink` YAML. A `DeviceLink` consists of 3 parts: `Adaptor`, `Model`, and `Device spec`:

- The `Adaptor` defines which adaptor to use and the node that the real-world device should be connected to.
- `Model` describes the model of a device, it is the [TypeMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go) of the device model CRD.
- `Device spec` describes how to connect to the device and its desired properties or status of the device, those parameters are defined by the device model CRD. 

Let's assume that there is a device named `living-room-fan` that can be connected through the `edge-worker` node, we can use the following YAML to test how it works.
```yaml
cat <<EOF | kubectl apply -f -
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: living-room-fan
  namespace: default
spec:
  adaptor:
    node: edge-worker # select the node that the device will be connect to
    name: adaptors.edge.cattle.io/dummy
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "DummySpecialDevice"
  template:
    metadata:
      labels:
        device: living-room-fan
    spec: # specify device specs
      protocol:
        location: "living_room"
      gear: slow
      "on": true
EOF
```

There are [several states](./devicelink/state-of-dl) of a DeviceLink, if we found the `PHASE` is **DeviceConnected** and its `STATUS` is on **Healthy**, we can now query its status use the same `DeviceLink` name of device model CRD(i.e dummyspecialdevice in here):

```shell script
kubectl get devicelink living-room-fan -n default
NAME              KIND                 NODE          ADAPTOR                         PHASE             STATUS    AGE
living-room-fan   DummySpecialDevice   edge-worker   adaptors.edge.cattle.io/dummy   DeviceConnected   Healthy   10s

```

Check device reported status:
```shell script
kubectl get dummyspecialdevice living-room-fan -n default -w
NAME              GEAR   SPEED   AGE
living-room-fan   slow   10      32s
living-room-fan   slow   11      33s
living-room-fan   slow   12      36s

```

### 4. Manage Device

Users can use device spec properties to manage its device, e.g, if we want to turn off the fan, we can set its spec `"on": false`:

```shell script
kubectl patch devicelink living-room-fan -n default --type merge --patch '{"spec":{"template":{"spec":{"on":false}}}}'
```

the log shows `devicelink.edge.cattle.io/living-room-fan is patched`, query its status, both `GEAR` and `SPEED` shows an empty value.

```
kubectl get devicelink living-room-fan -n default
  NAME              KIND                 NODE          ADAPTOR                         PHASE             STATUS    AGE
  living-room-fan   DummySpecialDevice   edge-worker   adaptors.edge.cattle.io/dummy   DeviceConnected   Healthy   89s

kubectl get dummyspecialdevice living-room-fan -n default
NAME              GEAR   SPEED   AGE
living-room-fan                  117s
```
