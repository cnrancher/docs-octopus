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

##### How can I build custom device adaptors?

Please reference the Octopus <a href="https://github.com/cnrancher/octopus/blob/master/docs/adaptors/develop.md" target="_blank">adaptors/develop.md</a> with instructions.
