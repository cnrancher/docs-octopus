---
id: about-dl
title: 关于 DeviceLink
---

## DeviceLink

一个`DeviceLink`由3部分组成：Adaptor，Model和Device spec。

- `adaptor` - 适配器定义了要使用的适配器（即协议）以及实际设备应连接的节点。
- `model` - 模型描述了设备的模型，它是设备模型的[TypeMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go) CRD。
- `device spec` - 设备参数描述了如何连接到设备及其所需的设备属性或状态，这些参数由设备模型的CRD来定义。


```yaml
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: living-room-fan #设备名称，这里展示的例子是客厅风扇
  namespace: default
spec:
  adaptor: # 适配器，定义了要使用的适配器（即协议）以及实际设备应连接的节点
    node: edge-worker # 选择设备连接的节点
    name: adaptors.edge.cattle.io/dummy
  model: # 模型，描述了设备的模型，它是设备模型的TypeMeta CRD
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "DummySpecialDevice"
  template: #设备模板
    metadata:
      labels:
        device: living-room-fan
    spec: # 设备参数，描述了如何连接到设备及其所需的设备属性或状态，这些参数由设备模型的CRD来定义
      protocol:
        location: "living_room"
      gear: slow
      "on": true
```

## 工作流程

下图显示了`DeviceLink`与Octopus的组件交互、使用Octopus连接设备、以及管理设备型号与适配器之间的连接的过程。

```text
                                                                                                                   
    │          metadata         │                    edge node                      │      devices      │          
   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─         
    │                           │                                                   │                   │          
                                                                                                                   
                                                                                                        │          
                                                                                                                   
        ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                                          ┌───────────┐                    │          
          <<Device Model>>                                          ┌─▶│  adaptor  ├┐  6                           
     ┌──│        CRD        │                                     4 │  └┬──────────┘│◀──┐               │          
     │   ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                                        │   └───────────┘   │                          
     │                                                              │                   │     .         │          
    1│                                                              │                   └───▶( )          user     
     │  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                                       │                     5   '         │          
     │       DeviceLink                                             │                                              
     │  ├───────────────────┤                                       │                                   │          
     └─▷│       Model       │                                       │                                              
        ├───────────────────┤                                       │                                   │          
        │      Adaptor      │                                       │                                              
        ├───────────────────┤                                       │                                   │          
        │     Template      │─────────────┬─────────────────┐       │                                              
        └───────────────────┘            2│                3│       │                                   │          
                                          │                 │       │                                  ─ ─         
                                          ▼                 │       └─────┐                             │          
                                ┌───────────────────┐       │             │                                        
                                │       brain       │       │             │                             │          
                                └───────────────────┘       │             │                                        
                                 │                          │             │                             │          
                                 ├─▣  node existed?         │             │                                        
                                 │   ────────────────       │             │                             │          
                                 │                          │             │                                        
                                 └─▣  model existed?        │             │                             │          
                                     ────────────────       │             │                                        
                                                            │             │                             │          
                                                            │             │                               octopus  
                                                            ▼             │                             │          
        ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐                     ┌───────────────────┐   │                                        
          <<Device Model>>             ┌──────────│       limb        ├┐  │ 7                           │          
        │     Instance      │          │          └┬──────────────────┘│◀─┘                                        
        ┌───────────────────┐   8      │           └┬──────────────────┘                                │          
        │       Spec        │◀─────────┘            │                                                              
        ├───────────────────┤                       ├─▣ adaptor existed?                                │          
        │      Status       │                       │   ─────────────────                                          
        └───────────────────┘                       │                                                   │          
                                                    ├─▣  device created?                                           
                                                    │   ─────────────────                               │          
                                                    │                                                              
                                                    └─▣ device connected?                               │          
                                                        ─────────────────                              ─ ─         
                                                                                                        │    
```
