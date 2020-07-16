---
id: faq
title: FAQ
---

:::note
The FAQ is updated periodically and designed to answer the questions our users most frequently ask about Octopus.
:::

##### Can Octopus run on either k3s or native Kubernetes cluster?

Yes, Octopus follows k8s api-extension and CRD model, it is compatible with both k3s and vanilla Kubernetes.

##### Does Octopus support ARM and AMD64

Yes, both ARM64 and ARMv7 are supported with multi-arch images, Octopus works great from something as small as a Raspberry Pi to an AWS a1.4xlarge 32GiB server.

##### Does Octopus support Windows?

At this time Octopus does not natively support Windows, however we are open to the idea in the future.

##### How can I build Octopus from source?

Please reference the Octopus <a href="https://github.com/cnrancher/octopus/blob/master/docs/octopus/develop.md" target="_blank">develop.md</a> with instructions.

##### How can I build custom device adaptor?

Please reference the [develop adaptor](./adaptors/develop) with instructions.

##### Does it support local offline access to UI?

Yes, if you are using the `master` image, you can add the configuration using `local` by editing `kubectl edit settings ui-index`:
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
value: local # use local access
```
If the user is using the `tag` image, for example, `cnrancher/octopus-api-server:v1.0.2`, the offline file will be used by default.
