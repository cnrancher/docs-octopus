---
id: dummy
title: Dummy 适配器
---

Dummy适配器是Octopus一种用于测试和Demo的模拟适配器。

### 注册信息

|  版本 | 注册名称 | 端点 Socket | 是否可用 |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/dummy` | `dummy.sock` | * |

### 支持模型

| 类型 | 设备组 | 版本 | 是否可用 | 
|:---|:---|:---|:---|
| [`DummySpecialDevice`](#dummyspecialdevice) | `devices.edge.cattle.io` | `v1alpha1` | * |
| [`DummyProtocolDevice`](#dummyprotocoldevice) | `devices.edge.cattle.io` | `v1alpha1` | * |

### 支持平台

| 操作系统 | 架构 |
|:---|:---|
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

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| metadata | 元数据 | 详情请参考[metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | 否 |
| spec | 设备的期望状态 | [DummySpecialDeviceSpec](#dummyspecialdevicespec) | 是 |
| status | 设备的实际状态 | [DummySpecialDeviceStatus](#dummyspecialdevicestatus) | 否 |

#### DummySpecialDeviceSpec

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| extension | 设备是否有与MQTT插件基础 | [DeviceExtensionSpec](#deviceextensionspec) | 否 |
| protocol |  访问设备时使用的传输协议| [DummySpecialDeviceProtocol](#dummyspecialdeviceprotocol) | 是 |
| on | 设备是否已经启动 | bool | 是 |
| gear | 如果设备已启动，上报设备运转的频率 | [DummySpecialDeviceGear](#dummyspecialdevicegear) | 否 |

#### DummySpecialDeviceStatus

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| extension | 集群使用的MQTT插件的配置  | [DeviceExtensionStatus](#deviceextensionstatus) | 否 |
| gear | 如果设备已启动，上报设备运转的频率 | [DummySpecialDeviceGear](#dummyspecialdevicegear) | 否 |
| rotatingSpeed | 设备的转速 | int32 | 是 |

#### DummySpecialDeviceProtocol

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| location | 设备所处的位置 | string | 是 |

#### DummySpecialDeviceGear

DummySpecialDeviceGear定义了设备运行的速度。

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| slow | 从0开始，每3秒增加一次，直至达到100 | string | 否 |
| middle |从100开始，每2秒增加一次，直至达到200  | string | 否 |
| fast | 从200开始，每1秒增加一次，直至达到300 | string | 否 |

#### DummyProtocolDevice

您可以将`DummyProtocolDevice` 看成一个chaos protocol robot，它的值每两秒会变化一次。

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| metadata | 元数据 | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | 否 |
| spec | 设备的期望状态 | [DummyProtocolDeviceSpec](#dummyprotocoldevicespec) | 是 |
| status | 设备的实际状态 | [DummyProtocolDeviceStatus](#dummyprotocoldevicestatus) | 否 |

#### DummyProtocolDeviceSpec

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| extension | 集群使用的MQTT插件的配置 | [DeviceExtensionSpec](#deviceextensionspec) | 否 |
| protocol | 访问设备时使用的传输协议 | [DummyProtocolDeviceProtocol](#dummyprotocoldeviceprotocol) | 是 |
| props | 设备属性的期望值 | [DummyProtocolDeviceSpecProps](#dummyprotocoldevicespecprops) | 否 |

#### DummyProtocolDeviceStatus

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| extension | 集群使用的MQTT插件的配置 | [DeviceExtensionStatus](#deviceextensionstatus) | 否 |
| props | 设备属性的实际值 | map[string][DummyProtocolDeviceStatusProps](#dummyprotocoldevicestatusprops) | 否 |

#### DummyProtocolDeviceProtocol

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| ip | 连接设备时用到的ip地址 | string | 是 |

#### DummyProtocolDeviceSpecProps
>**说明：**
> - `DummyProtocolDeviceSpecObjectOrArrayProps`和`DummyProtocolDeviceSpecProps`相同
> - 使用`DummyProtocolDeviceSpecObjectOrArrayProps` 的目的是避免对象循环引用

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| type | 设备属性的类型，可选值包括：string、int、float、boolean、object和array | [DummyProtocolDevicePropertyType](#dummyprotocoldevicepropertytype) | 是 |
| description | 属性描述 | string | 否 |
| readOnly | 是否只读 | bool | 否 |
| arrayProps | 数组类型的属性 | [DummyProtocolDeviceSpecObjectOrArrayProps](#dummyprotocoldevicespecprops) | 否 | 
| objectProps | 对象类型的属性 | [string][DummyProtocolDeviceSpecObjectOrArrayProps](#dummyprotocoldevicespecprops) | 否 |

#### DummyProtocolDeviceStatusProps

>**说明：**
> - `DummyProtocolDeviceStatusObjectOrArrayProps` 和`DummyProtocolDeviceStatusProps`相同
> - 使用`DummyProtocolDeviceStatusObjectOrArrayProps`的目的是避免对象循环引用

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| type | 设备属性的类型 | [DummyProtocolDevicePropertyType](#dummyprotocoldevicepropertytype) | 是 |
| intValue | 如果设备属性的类型是int，上报int的值R | int | 否 |
| stringValue | 如果设备属性的类型是string，上报string的值 | string | 否 |
| floatValue | 如果设备属性的类型是float，上报float的值 | [resource.Quantity](https://github.com/kubernetes/apimachinery/blob/master/pkg/api/resource/quantity.go) [kubernetes-sigs/controller-tools/issues#245](https://github.com/kubernetes-sigs/controller-tools/issues/245#issuecomment-550030238) | 否 |
| booleanValue | 如果设备属性的类型是boolean，上报boolean的值 | boolean | 否 |
| arrayValue | 如果设备属性的类型是boolean，上报array的值 | [DummyProtocolDeviceStatusObjectOrArrayProps](#dummyprotocoldevicestatusprops) | 否 | 
| objectValue | 如果设备属性的类型是object，上报object的值 | [DummyProtocolDeviceStatusObjectOrArrayProps](#dummyprotocoldevicestatusprops) | 否 |

#### DummyProtocolDevicePropertyType

DummyProtocolDevicePropertyType 描述了设备属性的类型。

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| string |int类型属性的值 | string | 否 |
| int |int类型属性的值 | string | 否 |
| float |float类型属性的值 | string | 否 |
| boolean |boolean类型属性的值 | string | 否 |
| array |array类型属性的值 | string | 否 |
| object |object类型属性的值 | string | 否 |

##### DeviceExtensionSpec

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| mqtt | 说明MQTT插件的配置 | *[v1alpha1.MQTTOptionsSpec](./mqtt-extension#specification) | 是 |

##### DeviceExtensionStatus

参数 | 描述 | 类型 | 是否必填
:--- | :--- | :--- | :---
| mqtt | 上报MQTT插件的配置 | *[v1alpha1.MQTTOptionsStatus](./mqtt-extension#status) | 是 |

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
   
1. 创建一个[DeviceLink](https://github.com/cnrancher/octopus/blob/master/adaptors/dummy/deploy/e2e/dl_protocoldevice.yaml)以连接DummyProtocolDevice，该设备模拟一个智能机器人，它可以在2秒内随机填充所需的属性。

    ```shell script
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_protocoldevice.yaml
    ```
   
    将以上创建的机械的答案同步到远程MQTT代理服务器。
        
    ```shell script
    # publish status to test.mosquitto.org
    $ kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/dummy/deploy/e2e/dl_protocoldevice_with_mqtt.yaml
    ```
    
    使用[`mosquitto_sub`](https://mosquitto.org/man/mosquitto_sub-1.html)工具观看同步的结果。
    
    ```shell script
    # get mqtt broker server
    $ kubectl get dummyprotocoldevices.devices.edge.cattle.io localhost-robot -o jsonpath="{.status.extension.mqtt.client.server}"
   
    # get topic name
    $ kubectl get dummyprotocoldevices.devices.edge.cattle.io localhost-robot -o jsonpath="{.status.extension.mqtt.message.topicName}"
   
    # use mosquitto_sub
    $ mosquitto_sub -h {the host of mqtt broker server} -p {the port of mqtt broker server} -t {the topic name}
    # mosquitto_sub -h test.mosquitto.org -p 1883 -t cattle.io/octopus/835aea2e-5f80-4d14-88f5-40c4bda41aa3
    ```
