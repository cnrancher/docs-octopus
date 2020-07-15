---
id: opc-ua
title: OPC-UA Adaptor
---

## Introduction

[OPC Unified Architecture](https://opcfoundation.org/about/opc-technologies/opc-ua/) (OPC-UA) is a machine to machine communication protocol for industrial automation developed by the OPC Foundation.

OPC-UA adaptor implements the [gopcua](https://github.com/gopcua/opcua) and focus on communicating with the industrial OPC-UA equipment and systems for data collection and data manipulation on the edge side.

## Registration Information

|  Versions | Register Name | Endpoint Socket | Available |
|:---:|:---:|:---:|:---:|
|  `v1alpha1` | `adaptors.edge.cattle.io/opcua` | `opcua.sock` | * |

## Support Model

| Kind | Group | Version | Available | 
|:---:|:---:|:---:|:---:|
| `OPCUADevice` | `devices.edge.cattle.io` | `v1alpha1` | * |

## Support Platform

| OS | Arch |
|:---:|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## Usage

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/opcua/deploy/e2e/all_in_one.yaml
```

## Authority

Grant permissions to Octopus as below:

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  opcuadevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  opcuadevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

## Example

- Specifies a `OPCUADevice` device link to connect a OPC-UA server.

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: opcua
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/opcua
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "OPCUADevice"
      template:
        metadata:
          labels:
            device: opcua
        spec:
          parameters:
            syncInterval: 5s
            timeout: 10s
          protocol:
            # replace the address if needed
            endpoint: opc.tcp://10.43.29.71:4840/
          properties:
            - name: datetime
              description: the current datetime
              readOnly: true
              visitor:
                nodeID: ns=0;i=2258
              type: datetime
            - name: integer
              description: mock number. Default value is 42
              readOnly: false
              visitor:
                nodeID: ns=1;s=the.answer
              type: int32
              value: "1"
            - name: string
              description: mock byte string. Default value is "test123"
              readOnly: false
              visitor:
                nodeID: ns=1;s=myByteString
              type: byteString
              value: "newString"
    ```

For more `OPCUADevice` device link examples, please refer to the [deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/opcua/deploy/e2e) directory.

## OPCUADevice

Parameter | Description | Schema | Required
--- | --- | --- | ---
metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false
spec | Defines the desired state of `OPCUADevice`. | [OPCUADeviceSpec](#opcuadevicespec) | true
status | Defines the observed state of `OPCUADevice`. | [OPCUADeviceStatus](#opcuadevicestatus) | false

### OPCUADeviceSpec

Parameter | Description | Scheme | Required
--- | --- | --- | ---
extension | Specifies the extension of device. | *[OPCUADeviceExtension](#opcuadeviceextension) | false
parameters | Specifies the parameters of device. | *[OPCUADeviceParamters](#opcuadeviceparamters) | false
protocol | Specifies the protocol for accessing the device. | *[OPCUADeviceProtocol](#opcuadeviceprotocol) | true
properties | Specifies the properties of device. | [[]OPCUADeviceProperty](#opcuadeviceproperty) | false

### OPCUADeviceStatus

Parameter | Description | Scheme | Required
--- | --- | --- | ---
properties | Reports the properties of device. | [[]OPCUADeviceStatusProperty](#opcuadevicestatusproperty) | false

#### OPCUADeviceParamters

Parameter | Description | Scheme | Required
--- | --- | --- | ---
syncInterval | Specifies the amount of interval that synchronized to limb, default to `15s`. | string | false
timeout | Specifies the amount of timeout, default to `10s`. | string | false

#### OPCUADeviceProtocol

Parameter | Description | Scheme | Required
--- | --- | --- | ---
endpoint | Specifies the URL of OPC-UA server endpoint, which is start with "opc.tcp://". | string | true
securityPolicy | Specifies the security policy for accessing OPC-UA server, default to `None`. | [OPCUADeviceProtocolSecurityPolicy](#opcuadeviceprotocolsecuritypolicy) | false
securityMode | Specifies the security mode for accessing OPC-UA server, default to `None`. | [OPCUADeviceProtocolSecurityMode](#opcuadeviceprotocolsecuritymode) | false
basicAuth | Specifies the username and password that the client connects to OPC-UA server. | *[OPCUADeviceProtocolBasicAuth](#opcuadeviceprotocolbasicauth) | false
tlsConfig | Specifies the TLS configuration that the client connects to OPC-UA server. | *[OPCUADeviceProtocolTLS](#opcuadeviceprotocoltls) | false

#### OPCUADeviceProtocolSecurityPolicy

Parameter | Description | Scheme
--- | --- | ---
None | | string  
Basic128Rsa15 | | string  
Basic256 | | string  
Basic256Sha256 | | string  
Aes128Sha256RsaOaep | | string  
Aes256Sha256RsaPss | | string  

#### OPCUADeviceProtocolSecurityMode

Parameter | Description | Scheme
--- | --- | ---
None | | string  
Sign | | string  
SignAndEncrypt | | string

#### OPCUADeviceProtocolBasicAuth

Parameter | Description | Scheme | Required
--- | --- | --- | ---
username | Specifies the username for accessing OPC-UA server. | string | false
usernameRef | Specifies the relationship of DeviceLink's references to refer to the value as the username. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false
password | Specifies the password for accessing OPC-UA server. | string | false
passwordRef | Specifies the relationship of DeviceLink's references to refer to the value as the password. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false

#### OPCUADeviceProtocolTLS

Parameter | Description | Scheme | Required
--- | --- | --- | ---
certFilePEM | Specifies the PEM format content of the certificate(public key), which is used for client authenticate to the OPC-UA server. | string | false
certFilePEMRef | Specifies the relationship of DeviceLink's references to refer to the value as the client certificate file PEM content. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false
keyFilePEM | Specifies the PEM format content of the key(private key), which is used for client authenticate to the OPC-UA server. | string | false
keyFilePEMRef | Specifies the relationship of DeviceLink's references to refer to the value as the client key file PEM content. | *[edgev1alpha1.DeviceLinkReferenceRelationship](https://github.com/cnrancher/octopus/blob/master/api/v1alpha1/devicelink_types.go#L12) | false

#### OPCUADeviceProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Specifies the name of property. | string | true
description | Specifies the description of property. | string | false
type | Specifies the type of property. | [OPCUADevicePropertyType](#opcuadevicepropertytype) | true
visitor | Specifies the visitor of property. | [OPCUADevicePropertyVisitor](#opcuadevicepropertyvisitor) | true
readOnly | Specifies if the property is readonly, default is `false`. | boolean | false
value | Specifies the value of property, only available in the writable property. | string | false

#### OPCUADeviceStatusProperty

Parameter | Description | Scheme | Required
--- | --- | --- | ---
name | Reports the name of property. | string | false
type | Reports the type of property. | [OPCUADevicePropertyType](#modbusdevicepropertytype) | false
value | Reports the value of property. | string | false
updatedAt | Reports the updated timestamp of property. | *[metav1.Time](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/time.go#L33) | false

#### OPCUADevicePropertyVisitor

Parameter | Description | Scheme |  Required
--- | --- | --- | ---
nodeID | Specifies the id of OPC-UA node, e.g. "ns=1,i=1005". | string | true
browseName | Specifies the name of OPC-UA node. | string | false

#### OPCUADevicePropertyType

Parameter | Description | Scheme
--- | --- | --- 
boolean | Property data type is boolean. | string
int64 | Property data type is int64. | string
int32 |  Property data type is int32. | string
int16 |  Property data type is int16. | string
uint64 | Property data type is uint64. | string
uint32 |  Property data type is uint32. | string
uint16 |  Property data type is uint16. | string
float |  Property data type is float. | string
double |  Property data type is double. | string
string |  Property data type is string. | string
byteString |  Property data type is bytestring. Will be converted to string for display. | string
datetime |  Property data type is datetime. | string

#### OPCUADeviceExtension

Parameter | Description | Scheme | Required
--- | --- | --- | ---
mqtt | Specifies the MQTT settings. | *[v1alpha1.MQTTOptionsSpec](./mqtt-extension#specification) | false
