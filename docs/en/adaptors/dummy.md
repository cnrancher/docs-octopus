---
id: dummy
title: Dummy Adaptor
---

## Introduction

Dummy is used to quickly experience Octopus. The Dummy adaptor can simulate the interaction of limb and adaptor.

## Registration Information

|  Versions | Register Name | Endpoint Socket | Available |
|:---:|:---:|:---:|:---:|
|  `v1alpha1` | `adaptors.edge.cattle.io/dummy` | `dummy.sock` | * |

## Support Model

| Kind | Group | Version | Available | 
|:---:|:---:|:---:|:---:|
| [`DummySpecialDevice`](#dummyspecialdevice) | `devices.edge.cattle.io` | `v1alpha1` | * |
| [`DummyProtocolDevice`](#dummyprotocoldevice) | `devices.edge.cattle.io` | `v1alpha1` | * |

## Support Platform

| OS | Arch |
|:---:|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## Usage

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/all_in_one.yaml
```

## Authority

Grant permissions to Octopus as below:

```text
  Resources                                           Non-Resource URLs  Resource Names  Verbs
  ---------                                           -----------------  --------------  -----
  dummyprotocoldevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  dummyspecialdevices.devices.edge.cattle.io          []                 []              [create delete get list patch update watch]
  dummyprotocoldevices.devices.edge.cattle.io/status  []                 []              [get patch update]
  dummyspecialdevices.devices.edge.cattle.io/status   []                 []              [get patch update]
```

## Example

- Specifies a `DummySpecialDevice` device link to connect a fake fan in living room.

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: living-room-fan
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/dummy
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "DummySpecialDevice"
      # uses Secret resources
      references:
        - name: "ca"
          secret:
            name: "living-room-fan-mqtt-ca"
        - name: "tls"
          secret:
            name: "living-room-fan-mqtt-tls"
      template:
        metadata:
          labels:
            device: living-room-fan
        spec:
          # integrates with MQTT
          extension:
            mqtt:
              client:
                server: tcps://test.mosquitto.org:8884
                tlsConfig:
                  caFilePEMRef:
                    name: ca
                    item: ca.crt
                  certFilePEMRef:
                    name: tls
                    item: tls.crt
                  keyFilePEMRef:
                    name: tls
                    item: tls.key
                  serverName: test.mosquitto.org
                  insecureSkipVerify: true
              message:
                # uses dynamic topic with namespaced name
                topic: "cattle.io/octopus/:namespace/:name"
          protocol:
            location: "living_room"
          gear: slow
          "on": true
    ```

- Specifies a `DummyProtocolDevice` device link to connect the chaos robot of localhost.

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: localhost-robot
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/dummy
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "DummyProtocolDevice"
      template:
        metadata:
          labels:
            device: localhost-robot
        spec:
          protocol:
            ip: "127.0.0.1"
          properties:
            name:
              type: string
              description: "The name (unique identifier) of the robot."
              readOnly: true
            gender:
              type: object
              description: "The gender of the robot."
              objectProperties:
                name:
                  type: string
                  description: "The name of the gender."
                code:
                  type: int
                  description: "The code of the gender."
            friends:
              type: array
              description: "The name list of the robot's friends."
              arrayProperties:
                type: string
                description: "The name of the friend."
            power:
              type: float
              description: "The power of the robot."
    ```

For more `Dummy*Device` device link examples, please refer to the [deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/dummy/deploy/e2e) directory.

## DummySpecialDevice

The `DummySpecialDevice` can be considered as a fake fan.

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false |
| spec | Defines the desired state of `DummySpecialDevice`. | [DummySpecialDeviceSpec](#dummyspecialdevicespec) | true |
| status | Defines the observed state of `DummySpecialDevice`. | [DummySpecialDeviceStatus](#dummyspecialdevicestatus) | false |

### DummySpecialDeviceSpec

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Specifies the extension of device. | [DummyDeviceExtension](#dummydeviceextension) | false |
| protocol |  Specifies the protocol for accessing the device. | [DummySpecialDeviceProtocol](#dummyspecialdeviceprotocol) | true |
| on | Specifies if turn on the device. | bool | true |
| gear | Specifies how fast the device should be, default to `slow`. | [DummySpecialDeviceGear](#dummyspecialdevicegear) | false |

### DummySpecialDeviceStatus

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| gear | Reports the current gear of device. | [DummySpecialDeviceGear](#dummyspecialdevicegear) | false |
| rotatingSpeed | Reports the detail number of speed. | int32 | false |

#### DummySpecialDeviceProtocol

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| location | Specifies the location of device. | string | true |

### DummySpecialDeviceGear

DummySpecialDeviceGear defines how fast the dummy special device should be.

| Parameter | Description | Schema |
|:---|:---|:---:|
| slow | Starts from 0 and increases every three seconds until 100. | string |
| middle | Starts from 100 and increases every two seconds until 200. | string |
| fast | Starts from 200 and increases every one second until 300. | string |

### DummyProtocolDevice

The `DummyProtocolDevice` can be considered as a chaos protocol robot, it will change its attribute values every two seconds.

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false |
| spec | Defines the desired state of `DummyProtocolDevice`. | [DummyProtocolDeviceSpec](#dummyprotocoldevicespec) | true |
| status | Defines the observed state of `DummyProtocolDevice`. | [DummyProtocolDeviceStatus](#dummyprotocoldevicestatus) | false |

### DummyProtocolDeviceSpec

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Specifies the extension of device. | [DummyDeviceExtension](#dummydeviceextension) | false |
| protocol | Specifies the protocol for accessing the device. | [DummyProtocolDeviceProtocol](#dummyprotocoldeviceprotocol) | true |
| properties | Specifies the properties of device. | [map[string]DummyProtocolDeviceProperty](#dummyprotocoldeviceproperty) | false |

### DummyProtocolDeviceStatus

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Reports the extension of device. | [DeviceExtensionStatus](#deviceextensionstatus) | false |
| properties | Reports the observed value of the desired properties. | [map[string]DummyProtocolDeviceStatusProperty](#dummyprotocoldevicestatusproperty) | false |

#### DummyProtocolDeviceProtocol

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| ip | Specifies where to connect the dummy protocol device. | string | true |

#### DummyProtocolDeviceProperty

> `DummyProtocolDeviceObjectOrArrayProperty` is the same as `DummyProtocolDeviceProperty`.
> The existence of `DummyProtocolDeviceObjectOrArrayProperty` is to combat the object circular reference.

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| type | Describes the type of property. | [DummyProtocolDevicePropertyType](#dummyprotocoldevicepropertytype) | true |
| description | Outlines the property. | string | false |
| readOnly | Configures the property is readOnly or not. | bool | false |
| arrayProperties | Describes item properties of the array type. | *[DummyProtocolDeviceObjectOrArrayProperty](#dummyprotocoldeviceproperty) | false | 
| objectProperties | Describes properties of the object type. | [map[string]DummyProtocolDeviceObjectOrArrayProperty](#dummyprotocoldeviceproperty) | false |

#### DummyProtocolDeviceStatusProperty

> `DummyProtocolDeviceStatusObjectOrArrayProperty` is the same as `DummyProtocolDeviceStatusProperty`.
> The existence of `DummyProtocolDeviceStatusObjectOrArrayProperty` is to combat the object circular reference.

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| type | Reports the type of property. | [DummyProtocolDevicePropertyType](#dummyprotocoldevicepropertytype) | true |
| intValue | Reports the value of int type. | *int | false |
| stringValue | Reports the value of string type. | *string | false |
| floatValue | Reports the value of float type. | *[resource.Quantity](https://github.com/kubernetes/apimachinery/blob/master/pkg/api/resource/quantity.go), [kubernetes-sigs/controller-tools/issues#245](https://github.com/kubernetes-sigs/controller-tools/issues/245#issuecomment-550030238) | false |
| booleanValue | Reports the value of bool type. | *bool | false |
| arrayValue | Reports the value of array type. | [[]DummyProtocolDeviceStatusObjectOrArrayProperty](#dummyprotocoldevicestatusproperty) | false | 
| objectValue | Reports the value of object type. | [map[string]DummyProtocolDeviceStatusObjectOrArrayProperty](#dummyprotocoldevicestatusproperty) | false |

#### DummyProtocolDevicePropertyType

DummyProtocolDevicePropertyType describes the type of property.

| Parameter | Description | Schema |
|:---|:---|:---:|
| string | Property data type is string. | string  |
| int | Property data type is int. | string |
| float | Property data type is float. | string  |
| boolean | Property data type is boolean. | string |
| array | Property data type is array. | string |
| object | Property data type is object. | string |

#### DummyDeviceExtension

| Parameter | Description | Schema | Required |
|:---|:---|:---|:---:|
| mqtt | Specifies the MQTT settings. | *[v1alpha1.MQTTOptionsSpec](./mqtt-extension#specification) | false |

## Walkthrough

1. Create a [DeviceLink](https://github.com/cnrancher/octopus/blob/master/adaptors/dummy/deploy/e2e/dl_specialdevice.yaml) to connect the DummySpecialDevice, which simulates a fan of living room. 

    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_specialdevice.yaml
    ```
    
    Synchronize the above-created fan's status to the remote MQTT broker server.
    
    ```shell script
    # create a Generic Secret to store the CA for connecting test.mosquitto.org.
    $ kubectl create secret generic living-room-fan-mqtt-ca --from-file=ca.crt=./test/integration/physical/testdata/mosquitto.org.crt
   
    # create a TLS Secret to store the TLS/SSL keypair for connecting test.mosquitto.org.
    $ kubectl create secret tls living-room-fan-mqtt-tls --key ./test/integration/physical/testdata/client-key.pem --cert ./test/integration/physical/testdata/client.crt
   
    # publish status to test.mosquitto.org
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_specialdevice_with_mqtt.yaml
    ```
    
    Use [`mosquitto_sub`](https://mosquitto.org/man/mosquitto_sub-1.html) tool to watch the synchronized status.
    
    ```shell script
    # get mqtt broker server
    $ kubectl get dl living-room-fan -o jsonpath="{.spec.template.spec.extension.mqtt.client.server}"
   
    # get topic name
    $ kubectl get dl living-room-fan -o jsonpath="{.spec.template.spec.extension.mqtt.message.topic}"

    # use mosquitto_sub
    $ mosquitto_sub -h {the host of mqtt broker server} -p {the port of mqtt broker server} -t {the topic name}
    # mosquitto_sub -h test.mosquitto.org -p 1883 -t cattle.io/octopus/default/living-room-fan 
    ```
   
1. Create a [DeviceLink](./deploy/e2e/dl_protocoldevice.yaml) to connect the DummyProtocolDevice, which simulates an intelligent property-filled robot, it can fill the desired properties randomly in 2 seconds.

    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_protocoldevice.yaml
    ```
   
    Synchronize the above-created robot's answers to the remote MQTT broker server.
        
    ```shell script
    # publish status to test.mosquitto.org
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_protocoldevice_with_mqtt.yaml
    ```
    
    Use [`mosquitto_sub`](https://mosquitto.org/man/mosquitto_sub-1.html) tool to watch the synchronized answers.
    
    ```shell script
    # get mqtt broker server
    $ kubectl get dl localhost-robot -o jsonpath="{.spec.template.spec.extension.mqtt.client.server}"
   
    # get topic name
    $ kubectl get dl localhost-robot -o jsonpath="{.spec.template.spec.extension.mqtt.message.topic}"

    # get dl uid
    $ kubectl get dl localhost-robot -o jsonpath="{.metadata.uid}"
   
    # use mosquitto_sub
    $ mosquitto_sub -h {the host of mqtt broker server} -p {the port of mqtt broker server} -t {the topic name}
    # mosquitto_sub -h test.mosquitto.org -p 1883 -t cattle.io/octopus/835aea2e-5f80-4d14-88f5-40c4bda41aa3
    ```
