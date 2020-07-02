---
id: dummy
title: Dummy 适配器
---

Dummy适配器是Octopus一种用于测试和Demo的模拟适配器。

### 注册信息

|  Versions | Register Name | Endpoint Socket | Available |
|:---:|:---:|:---:|:---:|
|  `v1alpha1` | `adaptors.edge.cattle.io/dummy` | `dummy.sock` | * |

### 支持模型

| Kind | Group | Version | Available | 
|:---:|:---:|:---:|:---:|
| [`DummySpecialDevice`](#dummyspecialdevice) | `devices.edge.cattle.io` | `v1alpha1` | * |
| [`DummyProtocolDevice`](#dummyprotocoldevice) | `devices.edge.cattle.io` | `v1alpha1` | * |

### 支持平台

| OS | Arch |
|:---:|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

### 使用方式

```shell script
$ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/all_in_one.yaml
```

### 权限

对Octopus授予权限，如下所示：

```text
  Resources                                           Non-Resource URLs  Resource Names  Verbs
  ---------                                           -----------------  --------------  -----
  dummyprotocoldevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  dummyspecialdevices.devices.edge.cattle.io          []                 []              [create delete get list patch update watch]
  dummyprotocoldevices.devices.edge.cattle.io/status  []                 []              [get patch update]
  dummyspecialdevices.devices.edge.cattle.io/status   []                 []              [get patch update]
```

### DummySpecialDevice

`DummySpecialDevice`可被视为模拟风扇。

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false |
| spec | Defines the desired state of DummySpecialDevice. | [DummySpecialDeviceSpec](#dummyspecialdevicespec) | true |
| status | Defines the observed state of DummySpecialDevice. | [DummySpecialDeviceStatus](#dummyspecialdevicestatus) | false |

#### DummySpecialDeviceSpec

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Specifies the extension of device. | [DeviceExtensionSpec](#deviceextensionspec) | false |
| protocol |  Protocol for accessing the dummy special device. | [DummySpecialDeviceProtocol](#dummyspecialdeviceprotocol) | true |
| on | Turn on the dummy special device | bool | true |
| gear | Specifies how fast the dummy special device should be. | [DummySpecialDeviceGear](#dummyspecialdevicegear) | false |

#### DummySpecialDeviceStatus

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Reports the extension of device. | [DeviceExtensionStatus](#deviceextensionstatus) | false |
| gear | Reports the current gear of dummy special device. | [DummySpecialDeviceGear](#dummyspecialdevicegear) | false |
| rotatingSpeed | Reports the detail number of speed of dummy special device. | int32 | false |

#### DummySpecialDeviceProtocol

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| location | Specifies where to locate the dummy special device. | string | true |

#### DummySpecialDeviceGear

DummySpecialDeviceGear defines how fast the dummy special device should be.

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| slow | Starts from 0 and increases every three seconds until 100. | string | false |
| middle | Starts from 100 and increases every two seconds until 200. | string | false |
| fast | Starts from 200 and increases every one second until 300. | string | false |

#### DummyProtocolDevice

The `DummyProtocolDevice` can be considered as a chaos protocol robot, it will change its attribute values every two seconds.

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| metadata | | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false |
| spec | Defines the desired state of DummyProtocolDevice. | [DummyProtocolDeviceSpec](#dummyprotocoldevicespec) | true |
| status | Defines the observed state of DummyProtocolDevice. | [DummyProtocolDeviceStatus](#dummyprotocoldevicestatus) | false |

#### DummyProtocolDeviceSpec

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Specifies the extension of device. | [DeviceExtensionSpec](#deviceextensionspec) | false |
| protocol | Protocol for accessing the dummy protocol device. | [DummyProtocolDeviceProtocol](#dummyprotocoldeviceprotocol) | true |
| props | Describes the desired properties. | map[string][DummyProtocolDeviceSpecProps](#dummyprotocoldevicespecprops) | false |

#### DummyProtocolDeviceStatus

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| extension | Reports the extension of device. | [DeviceExtensionStatus](#deviceextensionstatus) | false |
| props | Reports the observed value of the desired properties. | map[string][DummyProtocolDeviceStatusProps](#dummyprotocoldevicestatusprops) | false |

#### DummyProtocolDeviceProtocol

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| ip | Specifies where to connect the dummy protocol device. | string | true |

#### DummyProtocolDeviceSpecProps

> `DummyProtocolDeviceSpecObjectOrArrayProps` is the same as `DummyProtocolDeviceSpecProps`.
> The existence of `DummyProtocolDeviceSpecObjectOrArrayProps` is to combat the object circular reference.

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| type | Describes the type of property. | [DummyProtocolDevicePropertyType](#dummyprotocoldevicepropertytype) | true |
| description | Outlines the property. | string | false |
| readOnly | Configures the property is readOnly or not. | bool | false |
| arrayProps | Describes item properties of the array type. | *[DummyProtocolDeviceSpecObjectOrArrayProps](#dummyprotocoldevicespecprops) | false | 
| objectProps | Describes properties of the object type. | map[string][DummyProtocolDeviceSpecObjectOrArrayProps](#dummyprotocoldevicespecprops) | false |

#### DummyProtocolDeviceStatusProps

> `DummyProtocolDeviceStatusObjectOrArrayProps` is the same as `DummyProtocolDeviceStatusProps`.
> The existence of `DummyProtocolDeviceStatusObjectOrArrayProps` is to combat the object circular reference.

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| type | Reports the type of property. | [DummyProtocolDevicePropertyType](#dummyprotocoldevicepropertytype) | true |
| intValue | Reports the value of int type. | *int | false |
| stringValue | Reports the value of string type. | *string | false |
| floatValue | Reports the value of float type. | *[resource.Quantity](https://github.com/kubernetes/apimachinery/blob/master/pkg/api/resource/quantity.go) [kubernetes-sigs/controller-tools/issues#245](https://github.com/kubernetes-sigs/controller-tools/issues/245#issuecomment-550030238) | false |
| booleanValue | Reports the value of bool type. | *bool | false |
| arrayValue | Reports the value of array type. | [][DummyProtocolDeviceStatusObjectOrArrayProps](#dummyprotocoldevicestatusprops) | false | 
| objectValue | Reports the value of object type. | map[string][DummyProtocolDeviceStatusObjectOrArrayProps](#dummyprotocoldevicestatusprops) | false |

#### DummyProtocolDevicePropertyType

DummyProtocolDevicePropertyType describes the type of property.

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| string | | string | false |
| int | | string | false |
| float | | string | false |
| boolean | | string | false |
| array | | string | false |
| object | | string | false |

##### DeviceExtensionSpec

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| mqtt | Specifies the MQTT settings. | *[v1alpha1.MQTTOptionsSpec](./mqtt-extension#specification) | true |

##### DeviceExtensionStatus

| Field | Description | Schema | Required |
|:---|:---|:---|:---:|
| mqtt | Reports the MQTT settings. | *[v1alpha1.MQTTOptionsStatus](./mqtt-extension#status) | true |

### Demo演示

1. 创建一个[DeviceLink](https://github.com/cnrancher/octopus/blob/master/adaptors/dummy/deploy/e2e/dl_specialdevice.yaml)以连接DummySpecialDevice，该设备模拟客厅的风扇。

    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_specialdevice.yaml
    ```
   
    将上面创建的风扇状态同步到远程MQTT代理服务器。
    
    ```shell script
    # create a Generic Secret to store the CA for connecting test.mosquitto.org.
    $ kubectl create secret generic living-room-fan-mqtt-ca --from-file=ca.crt=./test/integration/physical/testdata/mosquitto.org.crt
   
    # create a TLS Secret to store the TLS/SSL keypair for connecting test.mosquitto.org.
    $ kubectl create secret tls living-room-fan-mqtt-tls --key ./test/integration/physical/testdata/client-key.pem --cert ./test/integration/physical/testdata/client.crt
   
    # publish status to test.mosquitto.org
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_specialdevice_with_mqtt.yaml
    ```
    
    使用[`mosquitto_sub`](https://mosquitto.org/man/mosquitto_sub-1.html)工具观看同步状态。
    
    ```shell script
    # get mqtt broker server
    $ kubectl get dummyspecialdevices.devices.edge.cattle.io living-room-fan -o jsonpath="{.status.extension.mqtt.client.server}"
   
    # get topic name
    $ kubectl get dummyspecialdevices.devices.edge.cattle.io living-room-fan -o jsonpath="{.status.extension.mqtt.message.topicName}"
    # use mosquitto_sub
   
    $ mosquitto_sub -h {the host of mqtt broker server} -p {the port of mqtt broker server} -t {the topic name}
    # mosquitto_sub -h test.mosquitto.org -p 1883 -t cattle.io/octopus/default/living-room-fan 
    ```
   
1. 创建一个[DeviceLink](https://github.com/cnrancher/octopus/blob/master/adaptors/dummy/deploy/e2e/dl_protocoldevice.yaml)以连接DummyProtocolDevice，该设备模拟一个充满智能属性的机器人，它可以在2秒内随机填充所需的属性。

    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_protocoldevice.yaml
    ```
   
    将以上创建的机械的答案同步到远程MQTT代理服务器。
        
    ```shell script
    # publish status to test.mosquitto.org
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_protocoldevice_with_mqtt.yaml
    ```
    
    使用[`mosquitto_sub`](https://mosquitto.org/man/mosquitto_sub-1.html)工具观看同步的答案。
    
    ```shell script
    # get mqtt broker server
    $ kubectl get dummyprotocoldevices.devices.edge.cattle.io localhost-robot -o jsonpath="{.status.extension.mqtt.client.server}"
   
    # get topic name
    $ kubectl get dummyprotocoldevices.devices.edge.cattle.io localhost-robot -o jsonpath="{.status.extension.mqtt.message.topicName}"
   
    # use mosquitto_sub
    $ mosquitto_sub -h {the host of mqtt broker server} -p {the port of mqtt broker server} -t {the topic name}
    # mosquitto_sub -h test.mosquitto.org -p 1883 -t cattle.io/octopus/835aea2e-5f80-4d14-88f5-40c4bda41aa3
    ```
