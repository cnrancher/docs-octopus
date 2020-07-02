---
id: adaptor
title: 关于适配器
---

## 适配器设计

Octopus诞生时就考虑到了可伸缩性的必要，这种能力具体体现在设备模型和适配器的设计中。

由于可以通过CRD定义设备模型，因此设备模型可以是专用设备（例如风扇，LED等），也可以是通用协议设备（例如BLE，ModBus，OPC-UA设备等）。

```text
                      ┌──────────────────────┐
                      │   MideaAirPurifier   │ #专用设备
                      └──────────────────────┘
                                                     
                                                     
                      ┌──────────────────────┐
                      │ MideaAirConditioning │ #专用设备
                      └──────────────────────┘
                                             
                                             
                      ┌──────────────────────┐
                      │  XiaoMiAirPurifier   │ #专用设备
                      └──────────────────────┘
                                             

                      ╔══════════════════════╗
                      ║      Bluetooth       ║  #通用协议设备
                      ╚══════════════════════╝

                                             
                      ╔══════════════════════╗
                      ║        Modbus        ║ #通用协议设备
                      ╚══════════════════════╝

                                             
                      ╔══════════════════════╗
                      ║        OPC-UA        ║ #通用协议设备
                      ╚══════════════════════╝
```

同时，适配器的实现可以连接到单个设备或多个设备：

```text
                                         ┌──────────────────────┐                                           
                              ┌──────────│   MideaAirPurifier   │──────────┐                                
                              │          └──────────────────────┘          │                                
                              │                                            │                                
                              │                                            │                                
                   .          │          ┌──────────────────────┐          │           .                    
                  ( )◀────────┤          │ MideaAirConditioning │──────────┴─────────▶( )                   
                   '          │          └──────────────────────┘                      '                    
   adaptors.smarthome.io/airpurifier                                      adaptors.media.io/smarthome       
                              │                                                                             
                              │          ┌──────────────────────┐                                           
                              └──────────│  XiaoMiAirPurifier   │──────────┐                                
                                         └──────────────────────┘          │                                
                                                                           │                                
                                                                           │                                
                                         ┌──────────────────────┐          │            .                   
                                         │ XiaoMiWeighingScale  │──────────┴──────────▶( )                  
                                         └──────────────────────┘                       '                   
                                                                          adaptors.xiaomi.io/smarthome      
                                                                                                            
                   .                     ╔══════════════════════╗                                           
                  ( )◀═══════════════════║      Bluetooth       ║                                           
                   '                     ╚══════════════════════╝                                           
    adaptors.edge.cattle.io/ble                                                                       
                                                                                                            
                                         ╔══════════════════════╗                       .                   
                                         ║        Modbus        ║═════════════════════▶( )                  
                                         ╚══════════════════════╝                       '                   
                                                                         adaptors.edge.cattle.io/modbus     
```

请在[此处](../develop.md)查看有关开发适配器的更多详细信息。

## 适配器APIs

适配器的访问管理借鉴了[Kubernetes设备插件管理](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/)。 当前访问管理API的可用版本为`v1alpha1`。

|  Versions | Available | Current |
|:---:|:---:|:---:|
|  [`v1alpha1`](./design_of_adaptor.md) | * | * |

使用以下步骤使适配器与`limb`交互：

1. `limb`在主机路径上启动带有Unix socket的gRPC服务，以接收来自适配器的注册请求：
    ```proto
    // Registration is the service advertised by the Limb,
    // any adaptor start its service until Limb approved this register request.
    service Registration {
        rpc Register (RegisterRequest) returns (Empty) {}
    }
    
    message RegisterRequest {
        // Name of the adaptor in the form `adaptor-vendor.com/adaptor-name`.
        string name = 1;
        // Version of the API the adaptor was built against.
        string version = 2;
        // Name of the unix socket the adaptor is listening on, it's in the form `*.sock`.
        string endpoint = 3;
    }
    ```
1. 适配器使用主机路径`/var/lib/octopus/adaptors`下的Unix socket启动gRPC服务，该服务实现以下接口：
    ```proto
    // Connection is the service advertised by the adaptor.
    service Connection {
        rpc Connect (stream ConnectRequest) returns (stream ConnectResponse) {}
    }
    
    message ConnectRequestReferenceEntry {
        map<string, bytes> items = 1;
    }
    
    message ConnectRequest {
        // [Deprecated] Parameters for the connection, it's in form JSON bytes.
        bytes parameters = 1;
        // Model for the device.
        k8s.io.apimachinery.pkg.apis.meta.v1.TypeMeta model = 2;
        // Desired device, it's in form JSON bytes.
        bytes device = 3;
        // References for the device, i.e: Secret, ConfigMap and Downward API.
        map<string, ConnectRequestReferenceEntry> references = 4;
    }
    
    message ConnectResponse {
        // Observed device, it's in form JSON bytes.
        bytes device = 1;
    }
    ```

1. 适配器通过Unix socket字在主机路径`/var/lib/octopus/adaptors/limb.sock`处向`limb`注册。
1. 成功注册后，适配器将以服务模式运行，在此模式下，适配器将保持连接设备的状态，并在设备状态发生任何变化时向`limb`报告。

#### 关于注册

**注册** 可以让`limb`发现适配器的存在，在这一阶段，`limb`充当服务器，而适配器充当客户端。适配器使用其名称，版本和访问端点构造一个注册请求，然后请求肢体。成功注册后，`limb`将继续监视适配器并通知与已注册适配器相关的那些DeviceLink。

- 名称是适配器的名称，强烈建议使用此模式`adaptor-vendor.com/adaptor-name`来命名适配器，每个适配器必须具有一个唯一的`名称`。
    > 具有相同`名称`的第二个适配器将覆盖前一个。
- 版本是访问管理的API版本，目前已在v1alpha1中修复。
- 访问的“端点”是UNIX套接字的名称，每个适配器必须具有一个唯一的“端点”。
    > 具有相同注册端点的第二个适配器在退出前一个适配器之前将永远不会成功注册。

#### 关于链接

**链接**可以让`limb`连接到适配器，在此阶段，适配器充当服务器，而`limb`充当客户端。 `limb`使用`parameters`, `model`, `device` 和 `references`构造连接请求，然后向目标适配器发出请求。

- `parameters`是用于连接的参数，格式为JSON字节。
    > 此`parameters`字段已被**DEPRECATED**，它应将连接参数定义为设备模型的一部分。
- `model` 是设备的模型，有助于适配器区分多个模型，或者在一个模型中存在不同版本时保持兼容性非常有用。
- `device` 是设备的实例，格式为JSON字节，是完整的`model` 实例的`JSON`字节，并包含`spec`和`status`数据。
    > 适配器应根据`model`选择相应的反序列化接收对象，以接收该字段的数据。
    > 由于接收对象（设备实例）是合法的CRD实例，因此它严格遵守Kubernetes的资源管理约定，因此可以通过命名空间和名称唯一地标识设备。
- `references` 是设备的参考源，它允许设备在相同的名称空间或父`DeviceLink`实例的向下`API`下使用`ConfigMap`和`Secret`。

## 可用适配器列表

- [Modbus](./modbus)
- [OPC-UA](./opc-ua)
- [MQTT](./mqtt)
- [BLE](./ble)
- [Dummy](./dummy)
