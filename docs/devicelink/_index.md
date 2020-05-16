---
id: create-dl
title: Create DeviceLink
---

We are going to connect a device via `DeviceLink`. A link consists of 3 parts: `Adaptor`, `Model` and `Device spec`:

- `Adaptor` describes how to access the device, this connection process calls adaptation. In order to connect a device, we should indicate the name of the adaptor, the name of the device-connectable node and the parameters of this connection.
- `Model` describes the model of device, it is the [TypeMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go) of the device model CRD.
- `Device spec` describes the desired status of device, it is determined by the device model CRD. 

We can imagine that there is a device named `example` on the `edge-worker` node, we can try to connect it in.

```yaml
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: example
  namespace: octopus-test
spec:
  adaptor:
    node: edge-worker
    name: adaptors.edge.cattle.io/dummy
    parameters:
      ip: 192.168.2.47
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "DummyDevice"
  template:
    metadata:
      labels:
        device: example
    spec:
      gear: slow
      "on": true

```

There are [several states](./docs/octopus/state_of_devicelink.md) of a link, if we found the **DeviceConnected** `PHASE` is on **Healthy** `STATUS`, we can query the same name instance of device model CRD, now the device is in our cluster:

```shell script
$ kubectl get devicelink example -n octopus-test
NAME      KIND          NODE          ADAPTOR                         PHASE             STATUS    AGE
example   DummyDevice   edge-worker   adaptors.edge.cattle.io/dummy   DeviceConnected   Healthy   17s

$ kubectl get dummydevice example -n octopus-test -w
NAME      GEAR   SPEED   AGE
example   slow   11      20s
example   slow   12      22s
example   slow   13      25s

```

### Manage Device

When we want to stop the device, we can do this as below:

```shell script
$ kubectl patch devicelink example -n octoupus-test --type merge --patch '{"spec":{"template":{"spec":{"on":false}}}}'
devicelink.edge.cattle.io/example patched

$ kubectl get devicelink example -n octopus-test
NAME      GEAR   SPEED   AGE
example                  1m12s

```
