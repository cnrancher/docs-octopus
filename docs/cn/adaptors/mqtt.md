---
id: mqtt
title: MQTT 适配器
---
## MQTT介绍

[MQTT](http://mqtt.org/)是一种机器对机器(M2M)/"物联网 "连接协议。它被设计为一种极其轻量级的发布/订阅消息传输。它对于需要少量代码占用和/或网络带宽很高的远程地点的连接非常有用。

MQTT适配器在[paho.mqtt.golang](https://github.com/eclipse/paho.mqtt.golang)上实现，有助于与MQTT经纪商进行通信，以与链接设备进行交互。

### MQTT杂谈

#### 数据结构

我们知道，MQTT是没有结构的的，所以没有标准的**主题**命名模式和**payload**格式。发布者组织数据结构的方式将直接影响到订阅者的使用情况。在社区中，我们总结了两种常见的模式。下面我们来看看。

第一种模式可以命名为**属性主题**：发布者将属性扁平化为主题，然后将属性的有效载荷发送到对应的主题。它在Github上有一个代表：[Homie](https://homieiot.github.io/)MQTT公约。

```
    homie/kitchen/$homie -> 4.0
    homie/kitchen/$name -> "客厅"
    homie/kitchen/$node -> "light,door"
    homie/kitchen/$state -> "ready"

    homie/kitchen/light/$name -> "客厅灯"
    homie/kitchen/light/$type -> "LED"
    homie/kitchen/light/$properties -> "开关,档位,参数_功率,参数_亮度,制造商,生产日期,使用寿命"
    ...
    
    homie/kitchen/light/switch/$name -> "灯光的开关"
    homie/kitchen/light/switch/$settable -> "true"
    homie/kitchen/light/switch/$datatype ->"boolean"
    homie/kitchen/light/switch -> "false"
    ...
    homie/kitchen/light/parameter_power/$name -> "光的强度"
    homie/kitchen/light/parameter_power/$settable -> "false"
    homie/kitchen/light/parameter_power/$datatype -> "float"
    homie/kitchen/light/parameter_power/$unit ->"watt"
    homie/kitchen/light/parameter_power -> "3.0"
    ...
```

Homie很有意思，它最大的特点就是**自发现**，也就是订阅者不需要知道数据结构，只需要订阅根主题，然后公约实现客户端就会反映出所有属性，包括名称、描述、值、类型等。但是，**属性主题**模式会创建很多主题，所以需要一个类似Homie的公约来保证标准化和可扩展性。

另一种直接将属性压缩成一个有效载荷的模式可以命名为**属性消息**。发布者将属性序列化为一种目标格式，如XML、JSON或自定义表单，然后将整个序列化结果发送给一个主题。

```
    首页/卧室/灯光 -> {"开关": "开", "动作":{"档位": "低"}, "参数":{"功率":70, "亮度":4900}, "生产":{"制造商": "兰彻章鱼假装置", "日期": "2020-07-09T13:00:00.00Z", "服务寿命": "P1Y0M0D"}}。
```

**Attributed Message**模式是节省主题的，但订阅者需要知道如何在每个主题中反序列化有效载荷，并了解数据的组织结构。更好的方法是在所有主题中使用相同的序列化格式，并引入数据结构的层次描述。例如，如果发布者选择JSON作为序列化格式，发布者可以在另一个主题中附加数据结构的[JSONschema](https://json-schema.org/)。

```
    home/bedroom/light/$schema -> {"$schema":"http://json-schema.org/draft-04/schema#","type":"object","additionalProperties":true,"properties":{"switch":{"description":"The switch of light","type":"boolean"},"action":{"description":"The action of light","type":"object","additionalProperties":true,"properties":{"gear":{"description":"The gear of power","type":"string"}}},"parameter":{"description":"The parameter of light","type":"object","additionalProperties":true,"properties":{"power":{"description":"The power of light","type":"float"},"luminance":{"description":"The luminance of light","type":"int"}}},"production":{"description":"The production information of light","type":"object","additionalProperties":true,"properties":{"manufacturer":{"description":"The manufacturer of light","type":"string"},"date":{"description":"The production date of light","type":"string"},"serviceLife":{"description":"The service life of light","type":"string"}}}}}
```

#### 操作

在MQTT中，对于数据的**pub/sub**只有两种方式：一是在同一个主题上执行**pub/sub**，二是将**pub/sub**分为两个主题。

第一种方式不受欢迎，可能需要在有效载荷中加入操作命令。

```
    home/light -> {"$data":{"on":true, "亮度":4, "功率":{"功率耗散": "10KWH", "电量":19.99}}。

    home/light <- {"$set":{"on":false}}。
    home/light -> {"$set":{"on":false}}。
```

虽然使用声明式管理的系统(如[Kubernetes](http://kubernetes.io/))可以避免上述的命令式操作，但当发布者做了**pub**时，必须引入一个**sub**，这在功耗极低的环境下是不可接受的。

```
    home/light -> {"on":true, "亮度":4, "功率":{"功率耗散": "10KWH", "电量":19.99}}。

    home/light <- {"on":false}。
    home/light -> {"on":false}。
```

因此，第二种方式会更容易被接受。由于属性已经被扁平化，在**属性主题**模式下，发布者可以将数据发送到与属性对应的特殊后缀的主题。例如，Homie更喜欢使用以`set`结尾的topic来接收值的变化。

```
    homie/light/on/$settable -> "true"
    homie/light/on -> "true"

    homie/light/on/set <- "false"
    homie/light/on -> "false"
```

对于**属性消息**模式也是如此，期望发布者需要选择只发送修改的属性还是所有属性。

```
    home/light -> {"开启": "true", "亮度":4, "功率":{"耗电量": "10KWH", "数量":19.99}}。
    
    home/light/set <- {"on":false}。
    home/light -> {"on":false}。
```

## 注册信息

| 版本 | 注册名称 | 端点 Socket | 是否可用 |
|:---|:---|:---|:---|
|  `v1alpha1` | `adaptors.edge.cattle.io/mqtt` | `mqtt.sock` | 是 |

## 支持模板

| 类型 | 设备组 | 版本 | 是否可用 | 
|:---|:---|:---|:---|
| `MQTTDevice` | `devices.edge.cattle.io` | `v1alpha1` | 是 |

## 支持的平台

| 操作系统 | 架构 |
|:---|:---|
| `linux` | `amd64` |
| `linux` | `arm` |
| `linux` | `arm64` |

## 使用方式

```shell script
kubectl apply -f https://raw.githubusercontent.com/cnrancher/octopus/master/adaptors/mqtt/deploy/e2e/all_in_one.yaml
```

## 权限

对Octopus授予权限，如下所示：

```text
  Resources                                   Non-Resource URLs  Resource Names  Verbs
  ---------                                   -----------------  --------------  -----
  mqttdevices.devices.edge.cattle.io         []                 []              [create delete get list patch update watch]
  mqttdevices.devices.edge.cattle.io/status  []                 []              [get patch update]
```

### DeviceSpecProperty

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
name | 属性名称  | string | 是
description |  属性描述  | string | 否
jsonPath | 属性值的json路径，详情请参考[GJSON Syntax](https://github.com/tidwall/gjson/blob/master/SYNTAX.md)| string | 是
subInfo | 订阅信息adapter| [SubInfo](#subinfo) | 是
value | 属性的valueProps | [ValueProps](#valueprops) | 否

### DevicePropertyStatus

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
name | property name | string | 是
description | property describe | string | 否
value | valueProps of property | [ValueProps](#valueprops) | 否
updateAt | property status update time | string | 是

### MQTT参数

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
broker | MQTT broker url地址 | string  | 是
username | MQTT 用户名 | string | 是
password | MQTT 用户密码 | string | 是

### PubInfo

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
topic | topic名称  | string | 是
qos | MQTT服务质量等级 | int | 是

### SubInfo

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
topic | topic名称  | string | 是
payloadType |  MQTT payload 类型（json） | string | 是
qos | MQTT服务质量等级 | int | 是

### ValueProps

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
valueType | 属性类型，可选值包括：int、string、float、boolean、array和object | string | 否
intValue | int类型属性的值 | int | 否
stringValue | string类型属性的值 | string | 否
floatValue | float类型属性的值 | float | 否
booleanValue | boolean类型属性的值| boolean | 否
arrayValue | array类型属性的值 | RawExtension | 否
objectValue | object类型属性的值 | RawExtension | 否

## YAML示例

- 指定 "MQTTDevice "设备链接，订阅厨房房间门的信息。

    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: kitchen-door
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/mqtt
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "MQTTDevice"
      template:
        metadata:
          labels:
            device: kitchen-door
        spec:
          protocol:
            pattern: "AttributedTopic"
            client:
              server: "tcp://test.mosquitto.org:1883"
            message:
              topic: "cattle.io/octopus/home/status/kitchen/door/:path"
          properties:
            - name: "state"
              path: "state"
              description: "The state of door"
              type: "string"
              annotations:
                type: "enum"
                format: "open,close"
            - name: "width"
              path: "width"
              description: "The width of door"
              type: "float"
              annotations:
                unit: "meter"
            - name: "height"
              path: "height"
              description: "The height of door"
              type: "float"
              annotations: 
                unit: "meter"
            - name: "material"
              path: "material"
              description: "The material of light"
              type: "string"
    ```

- 指定 "MQTTDevice "设备链接，订阅卧室灯的信息。
    ```YAML
    apiVersion: edge.cattle.io/v1alpha1
    kind: DeviceLink
    metadata:
      name: bedroom-light
    spec:
      adaptor:
        node: edge-worker
        name: adaptors.edge.cattle.io/mqtt
      model:
        apiVersion: "devices.edge.cattle.io/v1alpha1"
        kind: "MQTTDevice"
      template:
        metadata:
          labels:
            device: bedroom-light
        spec:
          protocol:
            pattern: "AttributedMessage"
            client:
              server: "tcp://test.mosquitto.org:1883"
            message:
              topic: "cattle.io/octopus/home/bedroom/light/:operator"
              operator:
                write: "set"
          properties:
            - name: "switch"
              path: "switch"
              description: "The switch of light"
              type: "boolean"
              readOnly: false
            - name: "gear"
              path: "action.gear"
              description: "The gear of light"
              type: "string"
              readOnly: false
              annotations:
                type: "enum"
                format: "low,mid,high"
            - name: "power"
              path: "parameter.power"
              description: "The power of light"
              type: "float"
              annotations:
                group: "parameter"
                unit: "watt"
            - name: "luminance"
              path: "parameter.luminance"
              description: "The luminance of light"
              type: "int"
              annotations:
                group: "parameter"
                unit: "luminance"
            - name: "manufacturer"
              path: "production.manufacturer"
              description: "The manufacturer of light"
              type: "string"
              annotations:
                group: "production"
            - name: "productionDate"
              path: "production.date"
              description: "The production date of light"
              type: "string"
              annotations:
                group: "production"
                type: "datetime"
                standard: "ISO 8601"
                format: "YYYY-MM-DDThh:mm:ss.SSZ"
            - name: "serviceLife"
              path: "production.serviceLife"
              description: "The service life of light"
              type: "string"
              annotations:
                group: "production"
                type: "duration"
                standard: "ISO 8601"
                format: "PYYMMDD"
    ```

更多的 "MQTTDevice "设备链接示例，请参考[deploy/e2e](https://github.com/cnrancher/octopus/tree/master/adaptors/mqtt/deploy/e2e)目录。

## MQTTDevice

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
metadata |元数据 | [metav1.ObjectMeta](https://github.com/kubernetes/apimachinery/blob/master/pkg/apis/meta/v1/types.go#L110) | false
spec | 定义 "MQTTDevice"的预期状态 | [MQTTDeviceSpec](#mqttdevicespec) | 是
status | 定义 "MQTTDevice"的实际状态 | [MQTTDeviceStatus](#mqttdevicestatus) | 否

### MQTTDeviceSpec

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
protocol | 指定访问设备时使用的协议 | [MQTTDeviceProtocol](#mqttdeviceprotocol) | 是
properties | 指定设备的属性| [[]MQTTDeviceProperty](#mqttdeviceproperty) | 否

### MQTTDeviceStatus

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
properties | 上报设备的属性 | [[]MQTTDeviceStatusProperty](#mqttdevicestatusproperty) | 否

#### MQTTDeviceProtocol

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
pattern | 指定MQTTDevice协议的模式 | [MQTTDevicePattern](#mqttdevicepattern) | 是
client | 指定客户端的设置 | [MQTTClientOptions](./mqtt-extension.md#mqttclientoptions) | 是
message | 指定消息的设置 | [MQTTMessageOptions](./mqtt-extension.md#mqttmessageoptions) | 是

#### MQTTDevicePattern

参数 | 描述| 类型 |
:--- | :--- | :--- |
AttributedMessage | 将属性压缩成一条消息，一个主题有其所有的属性值 | string 
AttributedTopic | 扁平化属性到主题，每个主题都有自己的属性值 | string  

#### MQTTDeviceProperty

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
annotations | 指定属性的注释 | map[string]string | 否
name | 指定属性的名称 | string | 是
description | 指定属性的描述 | string | 否
readOnly | 指定该属性是否为只读，默认为 "true" | *bool | 否
type | 指定属性的类型 | [MQTTDevicePropertyType](#mqttdevicepropertytype) | 否
value | 指定属性的值，只在可写属性中可用 | [MQTTDevicePropertyValue](#mqttdevicepropertyvalue) | 否
path | 指定topic的`:path`关键字的渲染路径，默认与`name`相同。 <br/><br/>在`AttributedTopic`模式下，这个路径将在topic上呈现；<br/>在`AttributedMessage`模式下，这个路径应该是一个[`JSONPath`](#available-jsonpath)，可以访问payload内容 | string | 否
operator | 指定用于呈现主题的`:operator`关键字的操作符。| MQTTMessageTopicOperator](./mqtt-extension.md#mqttmessagetopicoperator)。 | 否
qos | 指定消息的QoS，只有在`AttributedTopic`模式下才有。默认值是`1`。|[MQTTMessageQoSLevel](./mqtt-extension.md#mqttmessageqoslevel) | 否
retained | 指定是否保留最后发布的消息，只有在`AttributedTopic`模式下才有。默认为 "true"。| *bool | 否

> MQTT适配器会返回MQTT broker接收到的原始数据，因此，"type "的意义并不是告诉MQTT适配器如何处理有效载荷，而是让用户描述期望值。因此，"type "的含义不是告诉MQTT适配器如何处理有效载荷，而是让用户描述期望的内容。

#### MQTTDeviceStatusProperty

参数 | 描述| 类型 | 是否必填
:--- | :--- | :--- | :---
annotations | 属性的注释 | map[string]string | 否
name | 属性的名称 | string | 是
description | 属性的描述 | string | 否
readOnly | 该属性是否为只读，默认为 "true" | *bool | 否
type | 属性的类型 | [MQTTDevicePropertyType](#mqttdevicepropertytype) | 否
value | 属性的值，只在可写属性中可用 | [MQTTDevicePropertyValue](#mqttdevicepropertyvalue) | 否
path | topic的`:path`关键字的渲染路径，默认与`name`相同。 <br/><br/>在`AttributedTopic`模式下，这个路径将在topic上呈现；<br/>在`AttributedMessage`模式下，这个路径应该是一个[`JSONPath`](#available-jsonpath)，可以访问payload内容 | string | 否
operator | 用于呈现主题的`:operator`关键字的操作符。| MQTTMessageTopicOperator](./mqtt-extension.md#mqttmessagetopicoperator)。 | 否
qos | 消息的QoS，只有在`AttributedTopic`模式下才有。默认值是`1`。|[MQTTMessageQoSLevel](./mqtt-extension.md#mqttmessageqoslevel) | 否
retained | 是否保留最后发布的消息，只有在`AttributedTopic`模式下才有。默认为 "true"。| *bool | 否


#### MQTTDevicePropertyType

参数 | 描述| 类型 |
:--- | :--- | :--- | :---
string | 属性数据类型为string | string 
int | 属性数据类型为int | string  
float | 属性数据类型为float | string  
boolean | 属性数据类型为boolean | string
array | 属性数据类型为array| string
object | 属性数据类型为object | string

#### MQTTDevicePropertyValue

MQTTDevicePropertyValue需要根据`type`输入相应的内容。例如：

```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
...
spec:
  ...
  template:
    ...
    spec:
      ...
      properties:
        - name: "string"
          readOnly: false
          type: "string"
          value: "str"
        - name: "int"
          readOnly: false
          type: "int"
          value: 1
        - name: "float"
          readOnly: false
          type: "float"
          value: 3.3
        - name: "bool"
          readOnly: false
          type: "boolean"
          value: true
        - name: "array"
          readOnly: false
          type: "array"
          value:
            - item-1
            - item-2
            - item-3
        - name: "object"
          readOnly: false
          type: "object"
          value:
            name: "james"
            age: 12
```

## MQTT deviceLink YAML示例
```YAML
apiVersion: edge.cattle.io/v1alpha1
kind: DeviceLink
metadata:
  name: mqtt-test
spec:
  adaptor:
    node: k3d-k3s-default-server
    name: adaptors.edge.cattle.io/mqtt
    parameters:
      syncInterval: 5
      timeout: 10
  model:
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MqttDevice"
  template:
    metadata:
      labels:
        device: mqtt-test
    spec:
      config:
        broker: "tcp://192.168.8.246:1883"
        password: p*****3
        username: parchk
      properties:
        - name: "switch"
          description: "the room light switch"
          jsonPath: "switch"
          subInfo:
              topic: "device/room/light"
              payloadType: "json"
              qos: 2
        - name: "brightness"
          description: "the room light brightness"
          jsonPath: "brightness"
          subInfo:
              topic: "device/room/light"
              payloadType: "json"
              qos: 2
        - name: "power"
          description: "the room light power"
          jsonPath: "power"
          subInfo:
              topic: "device/room/light"
              payloadType: "json"
              qos: 2


```

### JSON Path语法

属性值的json路径，详情请参考[GJSON Syntax](https://github.com/tidwall/gjson/blob/master/SYNTAX.md)


### 快速入门

1. 更新上述[YAML](#example-of-mqtt-devicelink-yaml)文件示例中的MQTT broker参数配置
    ```yaml
        spec:
          config:
            broker: "tcp://192.168.8.246:1883"
            password: p*****3
            username: parchk
    ```
1. 启动`test/testdata/testdevice/roomlight`路径下的roomlight设备
    ```shell script
    cd ./testdata/testdevice/roomlight
    go build
    ./roomlight -b "tcp://192.168.8.246:1883"
    ```
   
1. 使用[`deploy/e2e`](https://github.com/cnrancher/octopus/tree/master/deploy/e2e)部署DeviceLink
    ```shell script
    $ kubeclt apply -f roomlightcase1.yaml
    ```
1. 检查集群中设备的状态
    ```shell script
    $ kubeclt get mqttdevice mqtt-test -oyaml
    ```

1. 如果安装成功，应该返回如下信息：
    ```yaml
    apiVersion: "devices.edge.cattle.io/v1alpha1"
    kind: "MqttDevice"
    metadata: 
      creationTimestamp: 
      name: "testDevice"
    spec: 
      config: 
        broker: ""
        password: ""
        username: ""
      properties: 
      - description: "test property"
        jsonPath: "power"
        name: "test_property"
        pubInfo: 
          qos: "0"
          topic: ""
        subInfo: 
          payloadType: "json"
          qos: "2"
          topic: "test/abc"
        value: 
          valueType: ""
    status: 
      properties: 
      - description: "test property"
        name: "test_property"
        updateAt: "2020-05-20T09:04:46Z"
        value: 
          objectValue: 
            electricQuantity: "19.99"
            powerDissipation: "10KWH"
          valueType: "object"
    ```
1. 您可以修改设备属性，如下所示：

    ```shell script
    $ kubectl edit dl mqtt-test
    ```

    ```yaml
        spec:
          config:
            broker: tcp://192.168.8.246:1883
            password: p*****3
            username: parchk
          properties:
          - description: the room light switch
            jsonPath: switch
            name: switch
            subInfo:
              payloadType: json
              qos: 2
              topic: device/room/light
            value:
              stringValue: "on"
              valueType: string
    ```
