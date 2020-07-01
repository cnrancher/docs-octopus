---
id: state-of-dl
title: State of DeviceLink
---

## Main Flow

In the status of `DeviceLink`, there are several conditions used for tracing the states of the link. Now, let's start with the transition of these conditions.

This is a example of `DeviceLink`:

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

When we deploy the above `DeviceLink` into the cluster, the `brain` will validate if the node specified in the `spec.adaptor.node` is available:

```text
┌─────────────────────┐   if the node is available? 
│     NodeExisted     │───────────────┐             
└─────────────────────┘               │             
                                      ▼             
                                      .             
                                     ( ) brain      
                                      '             
```

If the Node is available, the `brain` will verify if the CRD corresponded `spec.model` is exist:

```text
┌─────────────────────┐   if the node is available? 
│     NodeExisted     │───────────────┐             
└─────────────────────┘               │             
                                      ▼             
                          yes         .             
           ┌─────────────────────────( ) brain      
           │                          '             
           ▼                                        
┌─────────────────────┐   if the model is exist?  
│    ModelExisted     │───────────────┐             
└─────────────────────┘               │             
                                      ▼             
                                      .             
                                     ( ) brain      
                                      '             
```

:::note
The CRD used as a device model requires an annotation: `devices.edge.cattle.io/enable:true`.
:::

If the CRD is validated, the Octopus `limb` will verify if the adaptor corresponded `spec.adaptor.name` is available:

```text
           │                                        
           ▼                                           
┌─────────────────────┐   if the model is exist?   
│    ModelExisted     │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                          yes         .                
           ┌─────────────────────────( ) brain         
           │                          '                
           ▼                                           
┌─────────────────────┐   if the adaptor is available? 
│   AdaptorExisted    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                                      .                
                                     ( ) limb          
                                      '                
```

You can check the [Design of Adaptor](../en/adaptors/adaptor) to understand how the `limb` detects an adaptor. If the adaptor is available, the `limb` will try to create a device instance related to `spec.model`:

```text
           │                                          
           ▼                                           
┌─────────────────────┐   if the adaptor is available? 
│   AdaptorExisted    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                          yes         .                
           ┌─────────────────────────( ) limb          
           │                          '                
           ▼                                           
┌─────────────────────┐   create an instance of model  
│    DeviceCreated    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                                      .                
                                     ( ) limb          
                                      '                
```

After the device instance is successfully created, the `limb` will use the `spec.template.spec` to connect that real device via adaptor:

```text
           │                                   
           ▼                                           
┌─────────────────────┐   create an instance of model  
│    DeviceCreated    │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                          success     .                
           ┌─────────────────────────( ) limb          
           │                          '                
           ▼                                           
┌─────────────────────┐   connect the real device      
│   DeviceConnected   │───────────────┐                
└─────────────────────┘               │                
                                      ▼                
                                      .                
                                     ( ) limb          
                                      '                
```

If the connection is `healthy`, the corresponding device instance will synchronize its status from the real physical one. Below is a full process of all states:

```text
┌─────────────────────┐   if the node is available?               
│     NodeExisted     │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          yes         .                           
           ┌─────────────────────────( ) brain                    
           │                          '                           
           ▼                                                      
┌─────────────────────┐   if the model is exist?              
│    ModelExisted     │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          yes         .                           
           ┌─────────────────────────( ) brain                    
           │                          '                           
           ▼                                                      
┌─────────────────────┐   if the adaptor is available?            
│   AdaptorExisted    │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          yes         .                           
           ┌─────────────────────────( ) limb                     
           │                          '                           
           ▼                                                      
┌─────────────────────┐   create an instance of model             
│    DeviceCreated    │───────────────┐                           
└─────────────────────┘               │                           
                                      ▼                           
                          success     .                           
           ┌─────────────────────────( ) limb                     
           │                          '                           
           ▼                                                      
┌─────────────────────┐   connect the real device                 
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
The flow of states is ordered, which means that if the previous state is not ready(unsuccessful or false), it will not flow to the next state.
:::



## Correct behaviors

The main flow is not always going forward, some detection logic can adjust it to show the current state, we called them *corrections*. Some corrections are automatic, but some need manual intervention.

| State | Operator | Correction Logic |
|:---:|:---:|:---|
| `NodeExisted` | `brain` | If the Node has been deleted/drained/cordoned, the `brain` will adjust the main flow back to `NodeExisted` and mark it unavailable. <br/><br/> When the Node becomes available again, the `brain` will trigger the main flow to start again. |
| `ModelExisted` | `brain` | If the CRD(device model) has been deleted/disabled, the `brain` will adjust the main flow back to `ModelExisted` and mark it unavailable. <br/><br/> When the CRD becomes available again, the `brain` will trigger the main flow to start from model detection. |
| `AdaptorExisted` | `limb` | If the adaptor has been deleted, the `limb` will adjust the main flow back to `AdaptorExisted` and mark it unavailable. <br/><br/> When the adaptor becomes available again, the `limb` will trigger the main flow to start from adaptor detection. |
| `DeviceConnected` | `limb` maybe  | Accidental deletion of device instance will not be immediately perceived by `limb`, because the `limb` doesn't list-watch these instances. <br/><br/> If the deleted device has already connected(`DeviceConnected` was healthy), and the implementation of an adaptor is to synchronize status from the real device in real-time or interval, it could have a chance to be recreated by `limb`. The `limb` will trigger the main flow to start from device creation again. <br/><br/> **Otherwise, the link needs to be modified/rebuilt manually.** |

### State of DeviceConnected 

Before talking about `DeviceConnected`, it needs to know that the device connection management of Octopus divides into two parts, one is the connection between `limb` and adaptor, another one is the connection between the adaptor and real device:

```text
┌──────────┐   c1   ┌─────────┐   c2    .               
│   limb   │◀──────▶│ adaptor │◀──────▶( ) real device  
└──────────┘        └─────────┘         '                    
```

The `c1` is based on [gRPC](https://grpc.io/), and `c2` is determined by adaptor.  When both `c1` and `c2` are healthy, the `limb` will set `DeviceConnected` state to **Healthy**.

The `limb` can watch the changes in `c1`, if the `c1` closes unexpectedly, `limb` will trigger the main flow to start from device connection again.  

However, the `limb` cannot perceive whether the `c2` closes unexpectedly or not, so the adaptor is responsible for notifying its status, usually the adaptor need to send an *ERROR* to the `limb`.  Then, the `limb` will set the `DeviceConnected` state to **Unhealthy**.

If the interrupted `c2` is not reconnected, the link will remain **Unhealthy**.
