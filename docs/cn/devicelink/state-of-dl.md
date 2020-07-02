---
id: state-of-dl
title: DeviceLink 的状态
---

## 主要流程

在 `DeviceLink`的状态中，有下列几种条件可用于跟踪其链接的状态。 现在，让我们从这些条件的转变开始。

这是 `DeviceLink`的示例：
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

当我们将上述`DeviceLink`部署到集群中时，`brain`将验证`spec.adaptor.node`中指定的节点是否可用：

```text
┌─────────────────────┐   节点是否可以? 
│     NodeExisted     │───────────────┐             
└─────────────────────┘               │             
                                      ▼             
                                      .             
                                     ( ) brain      
                                      '             
```

如果该节点可用，则`brain`将验证CRD对应的`spec.model`(设备模型)是否存在：

```text
┌─────────────────────┐   节点是否可用? 
│     NodeExisted     │───────────────┐             
└─────────────────────┘               │             
                                      ▼             
                          yes         .             
           ┌─────────────────────────( ) brain      
           │                          '             
           ▼                                        
┌─────────────────────┐   设备模型是否存在?  
│    ModelExisted     │───────────────┐             
└─────────────────────┘               │             
                                      ▼             
                                      .             
                                     ( ) brain      
                                      '             
```

:::note
用作设备模型的CRD需要包含注释：`devices.edge.cattle.io/enable：true`。
:::

如果CRD(设备模型)验证通过，则Octopus的`limb`将验证适配器(Adaptor)对应的`spec.adaptor.name`是否可用：

```text
           │                                        
           ▼                                           
┌─────────────────────┐   设备模型是否存在?   
│    ModelExisted     │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                          yes         .                
           ┌─────────────────────────( ) brain         
           │                          '                
           ▼                                           
┌─────────────────────┐   适配器（Adaptor）是否可用? 
│   AdaptorExisted    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                                      .                
                                     ( ) limb          
                                      '                
```

您可以检查[Adaptor的设计](../adaptors/adaptor)来了解`limb`如何检测适配器。 如果适配器可用，那么`limb`将尝试创建与`spec.model`相关的设备实例：

```text
           │                                          
           ▼                                           
┌─────────────────────┐   适配器（Adaptor）是否可用? 
│   AdaptorExisted    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                          yes         .                
           ┌─────────────────────────( ) limb          
           │                          '                
           ▼                                           
┌─────────────────────┐   创建设备实例（基于设备模型） 
│    DeviceCreated    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                                      .                
                                     ( ) limb          
                                      '                
```

成功创建设备实例后，`limb`将使用`spec.template.spec`通过适配器(Adaptor)连接该实际设备：

```text
           │                                   
           ▼                                           
┌─────────────────────┐   创建设备实例  
│    DeviceCreated    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                          success     .                
           ┌─────────────────────────( ) limb          
           │                          '                
           ▼                                           
┌─────────────────────┐   链接到真实设备      
│   DeviceConnected   │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                                      .                
                                     ( ) limb          
                                      '                
```

如果连接状态是`healthy`，则相应的设备实例将从实际物理设备同步其状态。 以下是所有状态的完整过程：

```text
┌─────────────────────┐   节点是否可用?               
│     NodeExisted     │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          yes         .                           
           ┌─────────────────────────( ) brain                    
           │                          '                           
           ▼                                                      
┌─────────────────────┐   设备模型是否存在?              
│    ModelExisted     │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          yes         .                           
           ┌─────────────────────────( ) brain                    
           │                          '                           
           ▼                                                      
┌─────────────────────┐   适配器（Adaptor）是否可用?            
│   AdaptorExisted    │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          yes         .                           
           ┌─────────────────────────( ) limb                     
           │                          '                           
           ▼                                                      
┌─────────────────────┐   创建设备实例             
│    DeviceCreated    │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          success     .                           
           ┌─────────────────────────( ) limb                     
           │                          '                           
           ▼                                                      
┌─────────────────────┐   链接到真实设备                 
│   DeviceConnected   │───────────────┐                           
└─────────────────────┘               │                           
           ▲                          ▼                           
           │              healthy     .                           
           └─────────────────────────( ) limb ─────────┐          
                                      '                │          
                                      ▲                ▼          
                                      │                .          
                                      └───────────────( ) adaptor 
                                                       '          
```

:::info
DeviceLink的状态流是有序的，这意味着如果前一个状态未准备就绪（不成功或错误），则不会进入到下一个状态。
:::



## 流程与行为

主要流程并不一定总是向前发展，某些检测逻辑可以对其进行调整以显示当前状态，我们称它们为`更正`。 有些更正是自动的，但有些需要手动干预。

| 状态 | 控制器  | 逻辑描述 |
|:---:|:---:|:---|
| `NodeExisted` | `brain` |  如果该节点已被删除/驱逐/束缚，则Octopus的`brain`会将主流重新调整为`NodeExisted`，并将其标记为不可用。 <br/> <br/>当节点再次可用时，`brain`将触发主流重新开始。 |
| `ModelExisted` | `brain` | 如果CRD（设备模型）已被删除/禁用，则`brain`会将主流调整回`ModelExisted`并标记为不可用。 <br/> <br/>当CRD再次可用时，`大脑`将触发主要流程，从模型检测开始。 |
| `AdaptorExisted` | `limb` | 如果已删除适配器，则`limbs`会将主流调整回`AdaptorExisted`并标记为不可用。 <br/> <br/>当适配器再次可用时，`limb`将触发主要流程，从适配器检测开始。|
| `DeviceConnected` | `limb` maybe  | `limbs`不会立即察觉到设备实例的意外删除，因为`limbs`无法监视到这些真实设备的实例（而是通过适配器控制）。 <br/> <br/>如果已删除的设备已经连接（`DeviceConnected: Healthy`），并且适配器的实现是实时或间隔地同步实际设备的状态，则它可能有机会由`limb`重新创建。 `limb`将触发主要流程再次从设备创建开始。 <br/> <br/> **否则，该链接需要手动修改/重建。** |

### 设备连接状态

在谈论`DeviceConnected`之前，需要知道Octopus的设备连接管理分为两部分，一个是`limb`与适配器之间的连接，另一个是适配器与真实设备之间的连接：

```text
┌──────────┐   c1   ┌─────────┐   c2    .               
│   limb   │◀──────▶│ adaptor │◀──────▶( ) real device  
└──────────┘        └─────────┘         '                    
```

c1基于[gRPC](https://grpc.io/)，而c2由适配器确定。 当c1和c2都健康时，`limb`会将DeviceConnected状态设置为`Healthy`。

`limb`可以观察到`c1`的变化，如果`c1`意外关闭，则`limb`会触发主流从设备连接重新开始。

但是，`limb` 无法感知 `c2`是否意外关闭，因此适配器需要负责通知其状态，通常，适配器需要向`limb`发送`ERROR`状态的消息。 然后，`limb`会将 `DeviceConnected`状态设置为`Unhealthy`。

如果中断的`c2`没有重新连接，则链接将保持`Unhealthy`的状态。
