---
id: adaptor
title: How it Works
---

## Design of Adaptor

The Octopus was born with strong scalability in mind, this ability reflects in the design of the device model and the adaptor especially.

Since device model can be defined via CRD, the device model can either be a dedicated device such as a fan, LED, etc., or a general protocol device such as a Bluetooth, Modbus, OPC-UA device, and etc.

```text
                      ┌──────────────────────┐
                      │   MideaAirPurifier   │ #dedicated device model
                      └──────────────────────┘
                                                     
                                                     
                      ┌──────────────────────┐
                      │ MideaAirConditioning │ #dedicated device model
                      └──────────────────────┘
                                             
                                             
                      ┌──────────────────────┐
                      │  XiaoMiAirPurifier   │ #dedicated device model
                      └──────────────────────┘
                                             

                      ╔══════════════════════╗
                      ║      Bluetooth       ║  #protocol device model
                      ╚══════════════════════╝

                                             
                      ╔══════════════════════╗
                      ║        Modbus        ║ #protocol device model
                      ╚══════════════════════╝

                                             
                      ╔══════════════════════╗
                      ║        OPC-UA        ║ #protocol device model
                      ╚══════════════════════╝
```

At the meantime, the implementation of adapter can be connected to a single device or multiple devices:

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

Please view [here](../how-to-develop-adaptor.md) for more detail about developing an adaptor.

## Adaptor APIs

The access management of adaptors takes inspiration from [Kubernetes Device Plugins management](https://kubernetes.io/docs/concepts/extend-kubernetes/compute-storage-net/device-plugins/). The available version of access management APIs is `v1alpha1`.

|  Versions | Available | Current |
:--- | :--- | :--- |
|  [`v1alpha1`](https://github.com/cnrancher/octopus/blob/8a0a7df439180a961b0d1c47415d0138c401767e/pkg/adaptor/api/v1alpha1/api.proto) | * | * |

Use the following steps to make the adaptor interact with `limb`:

1. The `limb` starts a gRPC service with a Unix socket on host path to receive registration requests from adaptors:
    ```proto
    // Registration is the service advertised by the Limb,
    // any adaptor start its service until Limb approved this register request.
    service Registration {
      // Register is used to register the adaptor with limb.
      rpc Register (RegisterRequest) returns (Empty) {}
    }

    // RegisterRequest is the request used during registration
    // and is used to uniquely identify an adaptor.
    message RegisterRequest {
      // Name of the adaptor in the form `adaptor-vendor.com/adaptor-name`.
      string name = 1;
      // Version of the API the adaptor was built against.
      string version = 2;
      // Name of the unix socket the adaptor is listening on, it's in the form `*.sock`.
      string endpoint = 3;
    }
    ```
1. The adaptor starts a gRPC service with a Unix socket under host path `/var/lib/octopus/adaptors`, that implements the following interfaces:
    ```proto
    // Connection is the service advertised by the adaptor.
    service Connection {
      // Connect is for communication between the adaptor and limb.
      rpc Connect (stream ConnectRequest) returns (stream ConnectResponse) {}
    }

    message ConnectRequestReferenceEntry {
      map<string, bytes> items = 1;
    }

    // ConnectRequest is the request used during connection
    // and is used to send desired device data to an adaptor.
    message ConnectRequest {
      // Model for the device.
      k8s.io.apimachinery.pkg.apis.meta.v1.TypeMeta model = 1;
      // Desired device, it's in form JSON bytes.
      bytes device = 2;
      // References for the device, i.e: Secret, ConfigMap and Downward API.
      map<string, ConnectRequestReferenceEntry> references = 3;
    }

    // ConnectResponse is the response used during connection
    // and is used to return observed device data to the limb.
    message ConnectResponse {
      // Observed device, it's in form JSON bytes.
      bytes device = 1;
      // The unhandled error message indicates that the connection cannot be interrupted
      // and the user needs to choose to recreate or ignore it.
      string errorMessage = 2;
    }
    ```
1. The adaptor registers itself with the `limb` through the Unix socket at host path `/var/lib/octopus/adaptors/limb.sock`.
1. After successfully registering itself, the adaptor runs in serving mode, during which it keeps connecting devices and reports back to the `limb` upon any device state changes.

#### Registration

The **Registration** can let the `limb` to know the existence of an adaptor/, on this phase, the `limb` acts as a server, and the adaptor acts as a client. The adaptor constructs a registration request with its `name`, `version` and accessing `endpoint`, and then request to `limb`. After successfully registered, the `limb` will keep watching the adaptor and notify those DeviceLinks related to the registered adaptor.

- The `name` is the name of the adaptor, it's strongly recommended that to use this pattern `adaptor-vendor.com/adaptor-name` to named an adaptor, each adaptor must have one unique `name`.
    > The second adaptor who has the same `name` will overwrite the previous one.
- The `version` is the API version of accessing management, for now, it's fixed in `v1alpha1`.
- The accessing `endpoint` is the name of the UNIX socket, each adaptor must have one unique `endpoint`. 
    > The second adaptor who has the same registered `endpoint` will never register successfully until the previous one quits.

#### Connection

The **Connection** can let the `limb` to connect to an adaptor, on this phase, the adaptor acts as a server, and the `limb` acts as a client. The `limb` constructs a connection request with the `model`, `device` and `references`, and then request to the target adaptor.

- The `model` is the device's model, it's useful to help adaptor to distinguish multiple models, or maintain the compatibility if there are different versions in one model.
- The `device` is the device's instance, it's in form JSON bytes, which is JSON bytes of a complete `model` instance and contains `spec` and `status` data.
    > The adaptor should select the corresponding deserialized receiving object according to the `model` to receive this field's data.
    > Since the receiving object (device instance) is a legal CRD instance, it strictly conforms to the resource management convention of Kubernetes, so a device can be uniquely identified by Namespace and Name.
- The `references` is the reference sources of the device, it allows the device to use the ConfigMap and Secret under the same Namespace, or downward API of the parent DeviceLink instance.

## Available Adaptor List

- [Modbus](/docs-octopus/docs/en/adaptors/modbus)
- [OPC-UA](/docs-octopus/docs/en/adaptors/opc-ua)
- [MQTT](/docs-octopus/docs/en/adaptors/mqtt)
- [BLE](/docs-octopus/docs/en/adaptors/ble)
- [Dummy](/docs-octopus/docs/en/adaptors/dummy)
